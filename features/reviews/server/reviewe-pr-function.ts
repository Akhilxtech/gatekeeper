import { inngest } from "@/features/inngest/client";
import { getPullRequestFile } from "./pr-files";
import { chunkPrFiles } from "../utils/chunk-code";
import {prisma} from "@/lib/db"
import { generateReview } from "./generate-review";

export const reviewPullRequest= inngest.createFunction(
    {id: "review-pull-request", triggers:{event:"github/pr.received"}},
    async ({event,step})=>{
        const pullRequestId= event.data.pullRequestId;

        // step-1 mark as processing

        const pullRequest= await step.run("mark-processing",async ()=>{
            return prisma.pullRequest.update({
                where:{
                    id:pullRequestId
                },
                data:{
                    status:"processing"
                }
            })
        })
        // step-2 chunk step
        const chunks= await step.run("breakdown-code",async()=>{
            const files=await getPullRequestFile(
                pullRequest.installationId,
                pullRequest.repoFullName,
                pullRequest.prNumber
            );
            return chunkPrFiles(pullRequest.prNumber,files)
        })

        // step -3 chunking
        if(chunks.length===0){
            //  stop review here
            await step.run("mark-reviewed-no-code", async () => {
                await prisma.pullRequest.update({
                  where: { id: pullRequestId },
                  data: { status: "reviewed" },
                });
            });

            return {pullRequestId, status: "reviewed", reason: "no code to review"};
            
        }

        // build pr namespaces that creates isolated div from other pr

        // Todo:       // PR namespace isolates this diff from other PRs and from repo-wide sync data 

        await step.sleep("wait-for-vector-to-index","10s")

        // repoContext snippet

        const review= await step.run("generate-ai-review",async()=>{
            return generateReview({
                repoFullName: pullRequest.repoFullName,
                title: pullRequest.title
            })
        })

        await step.run("post-pr-comment", async ()=>{
            await postPrComment(
                pullRequest.installationId,
                pullRequest.repoFullName,
                pullRequest.prNumber,
                review
            );
        })

        await step.run("mark-reviewed", async () => {
            await prisma.pullRequest.update({
              where: { id: pullRequestId },
              data: {
                status: "reviewed",
                reviewComment: review,
                reviewedAt: new Date(),
              },
            });
          });

          return {pullRequestId, status:"reviewed"}
    }
)