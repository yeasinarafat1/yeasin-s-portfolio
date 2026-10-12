import Image from "next/image";
import type { Achievement, EducationEntry, Profile, Project, SkillGroup } from "@/types/portfolio";
import { ProjectCard } from "@/components/project-card";
import { SkillsExplorer } from "@/components/skills-explorer";
import { SocialLinks } from "@/components/social-links";
import { ContactForm } from "@/components/contact-form";
import { safeEmail, safeHttpUrl } from "@/lib/portfolio-utils";

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div className="section-heading">
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}

export function Hero({ profile, hasResume }: { profile: Profile; hasResume: boolean }) {
  return (
    <section className="hero-section" id="home" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="hero-greeting">{profile.greeting}</p>
        <h1 id="hero-title">I&apos;m <span className="text-coral">{profile.name}</span></h1>
        <p className="hero-role">{profile.role}</p>
        <p className="hero-description">{profile.description}</p>
        <div className="hero-actions">
          <a className="button button--primary" href="#projects">View My Projects <span aria-hidden="true">↘</span></a>
          {hasResume && <a className="button button--secondary" href={profile.resumeUrl} download>Download CV <span aria-hidden="true">↓</span></a>}
          {!hasResume && <a className="button button--secondary" href="#contact">Contact Me <span aria-hidden="true">↗</span></a>}
        </div>
        {profile.location && <p className="hero-location"><span aria-hidden="true">⌖</span> {profile.location}</p>}
      </div>
      <div className="hero-visual">
        <div className="hero-orbit hero-orbit--one" aria-hidden="true" />
        <div className="hero-orbit hero-orbit--two" aria-hidden="true" />
        <Image
          src={profile.illustration || "/images/developer.svg"}
          alt=""
          width={720}
          height={580}
          priority
          className="developer-illustration"
        />
        <span className="hero-visual-caption" aria-hidden="true">DESIGN · BUILD · REFINE</span>
      </div>
      <SocialLinks links={profile.socialLinks} email={profile.email} />
    </section>
  );
}

export function AboutSection({ profile }: { profile: Profile }) {
  return (
    <section className="content-section about-section" id="about">
      <SectionHeading eyebrow="A little about me" title="Curious by nature. Building with purpose." />
      <div className="about-grid">
        <p className="about-body">{profile.about.body}</p>
        <div className="about-details">
          {profile.about.interests.length > 0 && (
            <div>
              <h3>What I enjoy</h3>
              <ul className="interest-list">
                {profile.about.interests.map((interest) => <li key={interest}><span aria-hidden="true">↗</span>{interest}</li>)}
              </ul>
            </div>
          )}
          {profile.about.seeking && <p className="about-seeking">{profile.about.seeking}</p>}
        </div>
      </div>
    </section>
  );
}

export function ProjectsSection({ projects }: { projects: Project[] }) {
  const featured = projects.filter((project) => project.featured).slice(0, 4);
  if (featured.length === 0) return null;

  return (
    <section className="content-section projects-section" id="projects">
      <SectionHeading eyebrow="Projects & demos" title="Built work and ideas in progress." description="BookBazar is a completed marketplace; the other cards are demo concepts exploring useful product ideas." />
      <div className="project-grid">
        {featured.map((project) => <ProjectCard key={project.id} project={project} />)}
      </div>
    </section>
  );
}

export function SkillsSection({ groups }: { groups: SkillGroup[] }) {
  if (groups.every((group) => group.items.length === 0)) return null;
  return (
    <section className="content-section skills-section" id="skills">
      <SectionHeading eyebrow="Tools of the trade" title="Technologies I work with." />
      <SkillsExplorer groups={groups} />
    </section>
  );
}

export function EducationSection({ education, achievements, languages }: { education: EducationEntry[]; achievements: Achievement[]; languages: Profile["languages"] }) {
  if (education.length === 0 && achievements.length === 0 && languages.length === 0) return null;
  return (
    <section className="content-section background-section" id="education">
      <div className="education-column">
        <SectionHeading eyebrow="Learning" title="Education." />
        {education.map((entry) => (
          <article className="education-entry" key={entry.id}>
            <span className="timeline-dot" aria-hidden="true" />
            <div className="education-entry-heading">
              <h3>{entry.qualification}</h3>
              <span>{entry.status}</span>
            </div>
            <p className="education-institution">{entry.institution}</p>
            {entry.dates && <p className="education-dates">{entry.dates}</p>}
            {entry.description && <p className="education-description">{entry.description}</p>}
          </article>
        ))}
      </div>
      {(achievements.length > 0 || languages.length > 0) && (
        <div className="achievement-column" id="achievements">
          {achievements.length > 0 && <SectionHeading eyebrow="Milestones" title="Problem-solving." />}
          <div className="achievement-list">
            {achievements.map((achievement) => (
              <article className="achievement-entry" key={achievement.id}>
                <h3>{achievement.title}</h3>
                {achievement.value && <p className="achievement-value">{achievement.value}</p>}
                {achievement.description && <p>{achievement.description}</p>}
                {safeHttpUrl(achievement.url ?? "") && <a href={safeHttpUrl(achievement.url ?? "") ?? undefined} target="_blank" rel="noopener noreferrer">View profile <span aria-hidden="true">↗</span></a>}
              </article>
            ))}
          </div>
          {languages.length > 0 && (
            <div className="language-block">
              <SectionHeading eyebrow="Communication" title="Languages." />
              <ul className="language-list">
                {languages.map((language) => (
                  <li className="language-entry" key={language.name}>
                    <span>{language.name}</span>
                    <span>{language.proficiency}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export function ContactSection({ profile }: { profile: Profile }) {
  const email = safeEmail(profile.email);
  const phone = profile.phone.replace(/[^\d+]/g, "");
  const hasEmail = email !== null;
  return (
    <>
      <section className="contact-section" id="contact">
        <div className="contact-copy">
          <span className="eyebrow">Get in touch</span>
          <h2>Let&apos;s make something useful.</h2>
          <p>{profile.contactMessage}</p>
        </div>
        <div className="contact-actions">
          {hasEmail && <a className="button button--primary" href={`mailto:${email}`}>Email me <span aria-hidden="true">↗</span></a>}
          {phone && <a className="button button--secondary" href={`tel:${phone}`}>Call {profile.phone}</a>}
          <SocialLinks links={profile.socialLinks} email={profile.email} placement="inline" />
        </div>
        <span className="contact-mark" aria-hidden="true">&lt;/&gt;</span>
      </section>
      <section className="contact-form-section" aria-labelledby="contact-form-title">
        <div className="section-heading">
          <span className="eyebrow">Or send a message</span>
          <h2 id="contact-form-title">I&apos;d be glad to hear from you.</h2>
          <p>Your name, email, and message go directly to my portfolio inbox.</p>
        </div>
        <ContactForm />
      </section>
    </>
  );
}

export function Footer({ profile, visibleSections, hasResume }: { profile: Profile; visibleSections: string[]; hasResume: boolean }) {
  const year = new Date().getFullYear();
  const email = safeEmail(profile.email);
  const footerSections = [
    { id: "about", label: "About" },
    { id: "projects", label: "Projects" },
    { id: "skills", label: "Skills" },
    { id: "education", label: "Education" },
    { id: "contact", label: "Contact" },
  ].filter((section) => section.id === "contact" || visibleSections.includes(section.id));

  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand">
          <a className="footer-wordmark" href="#top">{profile.name}<span>.</span></a>
          <p>{profile.role} based in {profile.location}.</p>
          <p className="footer-availability">Currently seeking an internship opportunity.</p>
        </div>
        <nav className="footer-navigation" aria-label="Footer navigation">
          <h2>Explore</h2>
          <ul>
            {footerSections.map((section) => (
              <li key={section.id}><a href={`#${section.id}`}>{section.label}</a></li>
            ))}
          </ul>
        </nav>
        <div className="footer-connect">
          <h2>Let&apos;s connect</h2>
          {email && <a className="footer-email" href={`mailto:${email}`}>{email}<span aria-hidden="true">↗</span></a>}
          {hasResume && <a className="footer-resume" href={profile.resumeUrl} download>Download my CV</a>}
          <SocialLinks links={profile.socialLinks} email="" placement="inline" />
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {year} {profile.name}. Built with care in Cumilla.</p>
        <a href="#top" className="back-to-top">Back to top <span aria-hidden="true">↑</span></a>
      </div>
    </footer>
  );
}
