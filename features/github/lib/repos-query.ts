import { DashboardRepo } from "@/features/dashboard/lib/types";
import { infiniteQueryOptions } from "@tanstack/react-query";

type GithubRepoPage={
    repos: DashboardRepo[];
    totalCount:number;
    page:number;
    hasMore:boolean;
}

export const githubRepoKeys={
    all: ["github","repos"]
}

const REPOS_STALE_TIME=10*60*1000;

export const githubReposInfiniteQuery= infiniteQueryOptions({
    queryKey:[...githubRepoKeys.all,"list"],
    queryFn: async ({pageParam})=>{
        const response=await fetch(`/api/github/repo?page=${pageParam}`)

        if(!response.ok){
            throw new Error("Failed to load repositories");
        }

        return response.json()
    },
    initialPageParam:1,
    getNextPageParam:(lastPage)=>{
        if(lastPage.hasMore){
            return lastPage.page+1
        }
    },
    staleTime: REPOS_STALE_TIME // till time time data will fresf after that we will refetch
})


