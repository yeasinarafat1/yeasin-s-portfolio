import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin-dashboard";
import { AdminLogin } from "@/components/admin-login";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, adminAuthConfigured, verifyAdminSession } from "@/lib/admin-auth";
import { getContactMessages, getDatabaseMode, getPortfolioContent } from "@/lib/portfolio-db";

export const metadata: Metadata = {
  title: "Admin | Portfolio Studio",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminPage() {
  const cookieStore = await cookies();
  if (!verifyAdminSession(cookieStore.get(ADMIN_COOKIE)?.value)) {
    return <AdminLogin configured={adminAuthConfigured()} />;
  }

  const [{ profile, projects, skills, education, achievements }, messages] = await Promise.all([
    getPortfolioContent(),
    getContactMessages(),
  ]);
  return (
    <AdminDashboard
      profile={profile}
      projects={projects}
      skills={skills}
      education={education}
      achievements={achievements}
      messages={messages}
      storageMode={getDatabaseMode()}
    />
  );
}
