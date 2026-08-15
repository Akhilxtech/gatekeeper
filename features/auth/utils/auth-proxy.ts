// import { auth } from "@/lib/auth";
// import { getSafeCallbackPath,SIGN_IN_PATH } from "./index";

// import { NextRequest,NextResponse } from "next/server";


// function redirectToSignIn(request: NextRequest, pathname: string) {
//     const signInUrl = new URL(SIGN_IN_PATH, request.url);
//     // Include query string so filters/search params survive the round-trip through sign-in.
//     signInUrl.searchParams.set(
//       "callbackUrl",
//       `${pathname}${request.nextUrl.search}`,
//     );
//     return NextResponse.redirect(signInUrl);
//   }

//   function getPostAuthRedirectPath(request: NextRequest): string {
//     const callbackUrl = request.nextUrl.searchParams.get("callbackUrl");
//     return getSafeCallbackPath(callbackUrl);
//   }


// //  "/" always public route
// //  "/sign-in" loggedin user redirect away from here, guest only come here

//   export async function handleAuthProxy(request: NextRequest){
//     const {pathname}= request.nextUrl;

//     if(pathname==="/"){ // homepage req hai kuch mat kro agge jane do aur code yhi roko
//         return NextResponse.next();
//     }
//     const session= await auth.api.getSession({
//         headers: request.headers
//     })

//     if(pathname===SIGN_IN_PATH){
//         if(session){
//             const redirectPath= getPostAuthRedirectPath(request);
//             return NextResponse.redirect(new URL(redirectPath,request.url))
//         }

//         return NextResponse.next();
//     }
//     if(!session){
//         return redirectToSignIn(request,pathname)
//     }

//     return NextResponse.next()

//   }


import { getSafeCallbackPath, SIGN_IN_PATH } from "./index";
import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";

function redirectToSignIn(request: NextRequest, pathname: string) {
    const signInUrl = new URL(SIGN_IN_PATH, request.url);
    signInUrl.searchParams.set(
        "callbackUrl",
        `${pathname}${request.nextUrl.search}`,
    );
    return NextResponse.redirect(signInUrl);
}

function getPostAuthRedirectPath(request: NextRequest): string {
    const callbackUrl = request.nextUrl.searchParams.get("callbackUrl");
    return getSafeCallbackPath(callbackUrl);
}

export async function handleAuthProxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (pathname === "/") {
        return NextResponse.next();
    }

    // DB call nahi, sirf cookie presence check — fast & no timeout risk
    const sessionCookie = getSessionCookie(request);

    if (pathname === SIGN_IN_PATH) {
        if (sessionCookie) {
            const redirectPath = getPostAuthRedirectPath(request);
            return NextResponse.redirect(new URL(redirectPath, request.url));
        }
        return NextResponse.next();
    }

    if (!sessionCookie) {
        return redirectToSignIn(request, pathname);
    }

    return NextResponse.next();
}
