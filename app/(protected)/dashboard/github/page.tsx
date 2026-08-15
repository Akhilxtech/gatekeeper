import React from 'react'
import { Metadata } from 'next'
import { requireAuth } from '@/features/auth/actions'
import { getInstallationStatus } from '@/features/github/server/installation'
import { DashboardHeader } from '@/features/dashboard/components/dashboard-header'
import { GithubConnectCard } from '@/features/github/components/github-connect-card'

export const metadata: Metadata={
    title: "GitHub App - Dashboard"
}
const DashboardGithubPage = async () => {

  const session= await requireAuth();
  const installation= await getInstallationStatus(session.user.id);


  return (
    <>
    <DashboardHeader 
    title='Github App'
    description='Install or disconnect the reveiwer app on yout github account'
    />
    <GithubConnectCard userId={session.user.id} installation={installation}/>

    
    </>
  )
}

export default DashboardGithubPage