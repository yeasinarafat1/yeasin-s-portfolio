import { AboutSection, ContactSection, EducationSection, Footer, Hero, ProjectsSection, SkillsSection } from "@/components/portfolio-sections";
import { Navbar } from "@/components/navbar";
import { hasLocalPublicFile, safeLocalAsset } from "@/lib/portfolio-utils";
import { getPortfolioContent } from "@/lib/portfolio-db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function Home() {
  const { profile, projects, skills: skillGroups, education, achievements } = await getPortfolioContent();
  const hasResume = hasLocalPublicFile(profile.resumeUrl);
  const visibleSections = [
    profile.about.body.trim() || profile.about.interests.length > 0 || profile.about.seeking.trim() ? "about" : "",
    projects.some((project) => project.featured) ? "projects" : "",
    skillGroups.some((group) => group.items.length > 0) ? "skills" : "",
    education.length > 0 || achievements.length > 0 ? "education" : "",
  ].filter(Boolean);
  const profileWithFallbackIllustration = {
    ...profile,
    illustration: safeLocalAsset(profile.illustration, "/images/developer.svg"),
  };
  return (
    <main className="portfolio-shell min-h-screen" id="top">
      <Navbar name={profile.name} visibleSections={visibleSections} />
      <Hero profile={profileWithFallbackIllustration} hasResume={hasResume} />
      <div className="content-wrap">
        <AboutSection profile={profile} />
        <ProjectsSection projects={projects} />
        <SkillsSection groups={skillGroups} />
        <EducationSection education={education} achievements={achievements} languages={profile.languages} />
        <ContactSection profile={profile} />
      </div>
      <Footer profile={profile} visibleSections={visibleSections} hasResume={hasResume} />
    </main>
  );
}
