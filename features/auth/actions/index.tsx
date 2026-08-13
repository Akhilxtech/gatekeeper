"use server"

import {auth} from "@/lib/auth"

import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { DEFAULT_AUTH_CALLBACK,getSafeCallbackPath,SIGN_IN_PATH } from "../utils"


export async function signInWithGithub(formData:FormData){
    const callBack= formData.get("callbackUrl");


    const reditectTo= getSafeCallbackPath(
        typeof callBack ==="string" ? callBack : null
    )

    const result= await auth.api.signInSocial({
        body:{
            provider:"github",
            callbackURL:reditectTo
        },
        headers: await headers(),
    })

    if(result.url){
        redirect(result.url);
    }
}


export async function getServerSession(){
    return auth.api.getSession({
        headers: await headers()
    })
}

export async function requireAuth(redirectTo=SIGN_IN_PATH){
    const session= await getServerSession();

    if(!session){
        redirect(redirectTo)
    }

    return session
}

export async function requireUnauth(redirectTo=DEFAULT_AUTH_CALLBACK){
    const session= await getServerSession();

    if(session){
        redirect(redirectTo)
        
    }

}