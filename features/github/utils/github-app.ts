//  ocktokit package used here

import {App} from "octokit"

let githubApp: App | null= null;

const appId = process.env.GITHUB_APP_ID!;
const privateKey = process.env.GITHUB_APP_PRIVATE_KEY?.replace(/\\n/g,"\n")!;


// if (!appId || !privateKey) {
//   throw new Error("Missing GITHUB_APP_ID or GITHUB_PRIVATE_KEY in environment variables");
// }

export function getGithubApp(){
    if(!githubApp){
        githubApp= new App({
            appId : appId,
            privateKey: privateKey,
            webhooks:{
                secret:process.env.GITHUB_WEBHOOK_SECRET!
            }
            
        })
    }
    
    return githubApp;
}


// github app installation url


export function getGithubInstallUrl(userId: string){

    const url= new URL(`https://github.com/apps/gatekeper-project/installations/new`);
    url.searchParams.set("state",userId);
    return url.toString();
}