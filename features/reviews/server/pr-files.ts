import { getGithubApp } from "@/features/github/utils/github-app";
import { PrFile } from "../types/review";
import { Octokit } from "octokit";

const FILES_PER_PAGE=100
export async function getPullRequestFile(
    installationId:number,
    repoFullName: string,
    prNumber: number
): Promise<PrFile[]>{
    const app= getGithubApp();
    const octokit= await app.getInstallationOctokit(installationId);
    const [owner, repo]=repoFullName.split("/");
    const {data}= await octokit.request(
        "GET /repos/{owner}/{repo}/pulls/{pull_number}/files",
        {owner,repo,pull_number:prNumber, per_page:FILES_PER_PAGE}
    )

    const files: PrFile[]=[];
    for(const file of data){
        if(!file.patch){
            continue
        }
        files.push({filePath: file.filename,patch:file.patch})
    }

    return files;
}