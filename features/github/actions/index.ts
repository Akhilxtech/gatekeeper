"use server"
import { getServerSession } from "@/features/auth/actions";
import { deleteInstallation } from "../server/installation";
import { DASHBOARD_ROUTES } from "@/features/dashboard/lib/routes";
import { redirect } from "next/navigation";
export async function  disconnectGithubApp(){
    const session= await getServerSession();

    if(!session){
        redirect("/sign-in");
    }

    await deleteInstallation(session.user.id);
    redirect(DASHBOARD_ROUTES.github)
}