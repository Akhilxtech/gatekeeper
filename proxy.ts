import type { NextRequest } from "next/server";
import { handleAuthProxy } from "./features/auth/utils/auth-proxy";


export default async function Proxy(request:NextRequest){
    return handleAuthProxy(request)
}


// konsa path run karega auth middleware ko isko limit kar rhe hai yha per
export const config={ // inhi path per proxy available honi chiye
    matcher:["/sign-in","/dashboard","/dashboard/:path*"]
}

