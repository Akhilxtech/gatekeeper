import { serve } from "inngest/next";
import { inngest } from '@/features/inngest/client';
import { processTask } from "./funtion";
import { reviewPullRequest } from "@/features/reviews/server/reviewe-pr-function";
import { syncRepoCodebaseFunction } from "@/features/repo-sync/server/sync-repo-function";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [processTask, reviewPullRequest, syncRepoCodebaseFunction],
});




