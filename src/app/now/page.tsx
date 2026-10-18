import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/portfolio-sections";
import { nowPageContent } from "@/data/now";
import achievements from "@/data/achievements.json";
import education from "@/data/education.json";
import profileData from "@/data/profile.json";
import projects from "@/data/projects.json";
import skills from "@/data/skills.json";
import { hasLocalPublicFile } from "@/lib/portfolio-utils";
import type { Profile } from "@/types/portfolio";

export const metadata: Metadata = {
  title: "Now — Yeasin Arafat",
  description: "What I’m currently learning, building, and focusing on as I grow as a software engineer.",
};

export default function NowPage() {
  const profile: Profile = profileData;
  const visibleSections = [
    profile.about.body.trim() || profile.about.interests.length > 0 || profile.about.seeking.trim() ? "about" : "",
    projects.some((project) => project.featured) ? "projects" : "",
    skills.some((group) => group.items.length > 0) ? "skills" : "",
    education.length > 0 || achievements.length > 0 ? "education" : "",
  ].filter(Boolean);
  const date = new Date(`${nowPageContent.lastUpdated}-01T00:00:00.000Z`);
  const formattedDate = new Intl.DateTimeFormat("en", { month: "long", year: "numeric", timeZone: "UTC" }).format(date);

  return (
    <div className="portfolio-shell" id="top">
      <Navbar name={profile.name} visibleSections={visibleSections} isNowPage />
      <main className="now-page" aria-labelledby="now-title">
        <header className="now-intro">
          <p className="eyebrow">Now / Currently</p>
          <h1 id="now-title">What I’m up to now.</h1>
          <p className="now-intro-copy">{nowPageContent.intro}</p>
          <p className="now-updated">Last updated: <time dateTime={nowPageContent.lastUpdated}>{formattedDate}</time></p>
        </header>

        {nowPageContent.currentFocus.length > 0 && (
          <section className="now-section" aria-labelledby="now-focus-title">
            <h2 id="now-focus-title">What has my attention</h2>
            <div className="now-prose">
              {nowPageContent.currentFocus.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
          </section>
        )}

        {nowPageContent.learningTopics.length > 0 && (
          <section className="now-section" aria-labelledby="now-learning-title">
            <h2 id="now-learning-title">What I’m learning</h2>
            <ul className="now-topic-list">
              {nowPageContent.learningTopics.map((topic) => (
                <li key={topic.title}>
                  <h3>{topic.title}</h3>
                  <p>{topic.detail}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {nowPageContent.currentProjects.length > 0 && (
          <section className="now-section" aria-labelledby="now-building-title">
            <h2 id="now-building-title">What I’m building</h2>
            <div className="now-project-list">
              {nowPageContent.currentProjects.map((project) => (
                <article className="now-project" key={project.title}>
                  <h3>{project.title}</h3>
                  {project.context && <p className="now-project-context">{project.context}</p>}
                  <p>{project.description}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        {nowPageContent.beyondCode.length > 0 && (
          <section className="now-section" aria-labelledby="now-beyond-title">
            <h2 id="now-beyond-title">Beyond code</h2>
            <ul className="now-beyond-list">
              {nowPageContent.beyondCode.map((item) => (
                <li key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.detail}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <footer className="now-closing">
          <div className="now-prose">
            {nowPageContent.closingNote.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
          <Link href="/">Back to the homepage <span aria-hidden="true">↗</span></Link>
        </footer>
      </main>
      <Footer profile={profile} visibleSections={visibleSections} hasResume={hasLocalPublicFile(profile.resumeUrl)} isNowPage />
    </div>
  );
}
