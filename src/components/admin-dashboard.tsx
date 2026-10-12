"use client";

import { useCallback, useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { deleteMessageAction, logoutAdmin, savePortfolioContentAction, setMessageReadAction } from "@/app/actions";
import type { Achievement, ContactMessage, EducationEntry, Profile, Project, SkillGroup, SocialLink } from "@/types/portfolio";

type AdminSection = "overview" | "profile" | "projects" | "skills" | "education" | "achievements" | "contact" | "messages" | "settings";
type CreateModal = "project" | "skill" | "education" | "achievement" | "social" | null;
type AdminSocialLink = SocialLink & { visible: boolean };

const socialPlatforms = [
  { id: "linkedin", label: "LinkedIn" },
  { id: "github", label: "GitHub" },
  { id: "facebook", label: "Facebook" },
  { id: "instagram", label: "Instagram" },
  { id: "x", label: "X" },
  { id: "youtube", label: "YouTube" },
  { id: "tiktok", label: "TikTok" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "telegram", label: "Telegram" },
  { id: "codeforces", label: "Codeforces" },
  { id: "leetcode", label: "LeetCode" },
  { id: "codechef", label: "CodeChef" },
  { id: "stackoverflow", label: "Stack Overflow" },
  { id: "behance", label: "Behance" },
  { id: "dribbble", label: "Dribbble" },
  { id: "medium", label: "Medium" },
  { id: "website", label: "Personal website" },
];

const skillCatalog = [
  { category: "Programming languages", skills: ["C", "C++", "C#", "Go", "Java", "JavaScript", "Kotlin", "PHP", "Python", "Ruby", "Rust", "Swift", "TypeScript"] },
  { category: "Frontend", skills: ["HTML", "CSS", "React.js", "Next.js", "Vue.js", "Angular", "Svelte", "Tailwind CSS", "Bootstrap", "Sass", "Material UI", "shadcn/ui", "Redux", "Zustand", "Vite"] },
  { category: "Backend & APIs", skills: ["Node.js", "Express.js", "NestJS", "Django", "Flask", "FastAPI", "Laravel", "Spring Boot", "ASP.NET Core", "REST APIs", "GraphQL", "WebSockets", "Clerk"] },
  { category: "Databases & ORMs", skills: ["PostgreSQL", "Neon PostgreSQL", "MySQL", "SQLite", "MongoDB", "Redis", "Firebase", "Supabase", "Drizzle ORM", "Prisma", "TypeORM", "Sequelize"] },
  { category: "Cloud, DevOps & operating systems", skills: ["Git", "GitHub", "GitLab", "Docker", "Kubernetes", "Linux", "Linux (Ubuntu/Arch)", "AWS", "Microsoft Azure", "Vercel", "Netlify", "CI/CD", "Nginx"] },
  { category: "Testing & developer tools", skills: ["Jest", "Vitest", "Playwright", "Cypress", "Postman", "Figma", "Visual Studio Code", "npm", "pnpm", "IndexedDB"] },
  { category: "Data & AI", skills: ["NumPy", "Pandas", "scikit-learn", "TensorFlow", "PyTorch", "OpenAI API"] },
];

interface AdminDashboardProps {
  profile: Profile;
  projects: Project[];
  skills: SkillGroup[];
  education: EducationEntry[];
  achievements: Achievement[];
  messages: ContactMessage[];
  storageMode: string;
}

const sections: { id: AdminSection; label: string; icon: string }[] = [
  { id: "overview", label: "Overview", icon: "grid" },
  { id: "profile", label: "Profile", icon: "user" },
  { id: "projects", label: "Projects", icon: "folder" },
  { id: "skills", label: "Skills", icon: "sparkles" },
  { id: "education", label: "Education", icon: "graduation" },
  { id: "achievements", label: "Achievements", icon: "award" },
  { id: "contact", label: "Contact & footer", icon: "message" },
  { id: "messages", label: "Messages", icon: "message" },
  { id: "settings", label: "Site settings", icon: "settings" },
];

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const paths: Record<string, ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
    user: <><circle cx="12" cy="8" r="3.5" /><path d="M5 20c.8-3.3 3.2-5 7-5s6.2 1.7 7 5" /></>,
    folder: <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H10l2 2h6.5A2.5 2.5 0 0 1 21 9.5v8a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5z" />,
    sparkles: <><path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5z" /><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" /></>,
    graduation: <><path d="m2 9 10-5 10 5-10 5z" /><path d="M6 11v5c3.4 2.7 8.6 2.7 12 0v-5M22 9v6" /></>,
    award: <><circle cx="12" cy="8" r="5" /><path d="m8.7 12-1 8 4.3-2.5 4.3 2.5-1-8" /></>,
    message: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v9a2.5 2.5 0 0 1-2.5 2.5H11l-5 4v-4.2a2.5 2.5 0 0 1-2-2.3z" /><path d="M8 8h8M8 12h5" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1a1.8 1.8 0 1 1-2.5 2.5l-.1-.1a1.8 1.8 0 0 0-3 .9v.2a1.8 1.8 0 1 1-3.6 0v-.2a1.8 1.8 0 0 0-3-.9l-.1.1a1.8 1.8 0 1 1-2.5-2.5l.1-.1a1.8 1.8 0 0 0-.9-3h-.2a1.8 1.8 0 1 1 0-3.6h.2a1.8 1.8 0 0 0 .9-3l-.1-.1a1.8 1.8 0 1 1 2.5-2.5l.1.1a1.8 1.8 0 0 0 3-.9v-.2a1.8 1.8 0 1 1 3.6 0v.2a1.8 1.8 0 0 0 3 .9l.1-.1a1.8 1.8 0 1 1 2.5 2.5l-.1.1a1.8 1.8 0 0 0 .9 3h.2a1.8 1.8 0 1 1 0 3.6h-.2a1.8 1.8 0 0 0-.9 3Z" /></>,
    arrow: <><path d="M7 17 17 7M7 7h10v10" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
  };

  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name] ?? paths.grid}</svg>;
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  multiline = false,
  wide = false,
  disabled = false,
  required = false,
  inputType = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  wide?: boolean;
  disabled?: boolean;
  required?: boolean;
  inputType?: "text" | "url" | "email";
}) {
  const id = useId();
  return (
    <label className={`admin-field${wide ? " admin-field--wide" : ""}`} htmlFor={id}>
      <span>{label}</span>
      {multiline ? (
        <textarea id={id} value={value} placeholder={placeholder} disabled={disabled} required={required} onChange={(event) => onChange(event.target.value)} rows={4} />
      ) : (
        <input id={id} type={inputType} value={value} placeholder={placeholder} disabled={disabled} required={required} onChange={(event) => onChange(event.target.value)} />
      )}
    </label>
  );
}

function SkillPicker({ label, value, onChange, wide = false }: {
  label: string;
  value: string[];
  onChange: (skills: string[]) => void;
  wide?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const menuId = useId();
  const normalizedQuery = query.trim().toLowerCase();
  const filteredGroups = skillCatalog.map((group) => ({
    ...group,
    skills: group.skills.filter((skill) => !normalizedQuery || skill.toLowerCase().includes(normalizedQuery) || group.category.toLowerCase().includes(normalizedQuery)),
  })).filter((group) => group.skills.length > 0);

  function toggleSkill(skill: string) {
    if (value.includes(skill)) {
      onChange(value.filter((item) => item !== skill));
      return;
    }
    onChange([...value, skill]);
    setQuery("");
  }

  return (
    <div className={`admin-field admin-skill-picker-field${wide ? " admin-field--wide" : ""}`}>
      <span>{label}</span>
      <div className="admin-skill-picker">
        <div className="admin-skill-picker-controls">
          <input type="search" value={query} aria-label={`Search ${label}`} aria-controls={menuId} aria-expanded={isOpen} placeholder="Search preloaded technical skills..." onFocus={() => setIsOpen(true)} onChange={(event) => { setQuery(event.target.value); setIsOpen(true); }} />
          <button className="admin-skill-picker-toggle" type="button" aria-expanded={isOpen} aria-controls={menuId} onClick={() => setIsOpen((open) => !open)}>{isOpen ? "Done" : "Browse"}</button>
        </div>
        {value.length > 0 ? (
          <div className="admin-selected-skills" aria-label={`${value.length} selected skills`}>
            {value.map((skill) => <button key={skill} type="button" className="admin-selected-skill" aria-label={`Remove ${skill}`} onClick={() => toggleSkill(skill)}>{skill}<span aria-hidden="true">×</span></button>)}
          </div>
        ) : <small className="admin-picker-empty">No skills selected yet.</small>}
        {isOpen && <div className="admin-skill-picker-menu" id={menuId}>
          {filteredGroups.length > 0 ? filteredGroups.map((group) => (
            <section className="admin-skill-picker-group" key={group.category}>
              <h4>{group.category}</h4>
              <div>{group.skills.map((skill) => {
                const selected = value.includes(skill);
                return <button key={skill} type="button" role="checkbox" aria-checked={selected} className={`admin-skill-option${selected ? " is-selected" : ""}`} onClick={() => toggleSkill(skill)}><span>{skill}</span><b aria-hidden="true">{selected ? "✓" : "+"}</b></button>;
              })}</div>
            </section>
          )) : <p className="admin-skill-picker-no-results">No matching skill in the catalog.</p>}
        </div>}
        <small className="admin-picker-hint">Select any number of skills from the preloaded catalog.</small>
      </div>
    </div>
  );
}

function AdminModal({ title, description, submitLabel, onClose, onSubmit, children }: {
  title: string;
  description: string;
  submitLabel: string;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = "hidden";
    dialogRef.current?.querySelector<HTMLElement>("input, select, textarea, button")?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab" && dialogRef.current) {
        const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>("a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex='-1'])"));
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, [onClose]);

  return (
    <div className="admin-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="admin-modal" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="admin-modal-title" aria-describedby="admin-modal-description">
        <header className="admin-modal-header">
          <span className="admin-modal-mark"><Icon name="plus" size={18} /></span>
          <div><h2 id="admin-modal-title">{title}</h2><p id="admin-modal-description">{description}</p></div>
          <button className="admin-modal-close" type="button" aria-label="Close dialog" onClick={onClose}>×</button>
        </header>
        <form onSubmit={onSubmit}>
          <div className="admin-modal-fields">{children}</div>
          <footer className="admin-modal-footer"><button className="admin-button admin-button--quiet" type="button" onClick={onClose}>Cancel</button><button className="admin-button admin-button--primary" type="submit">{submitLabel}</button></footer>
        </form>
      </section>
    </div>
  );
}

function SectionHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="admin-heading-row">
      <div>
        <p className="admin-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="admin-heading-description">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function AdminDashboard({ profile: initialProfile, projects: initialProjects, skills: initialSkills, education: initialEducation, achievements: initialAchievements, messages: initialMessages, storageMode }: AdminDashboardProps) {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<AdminSection>("overview");
  const [profile, setProfile] = useState(initialProfile);
  const [projects, setProjects] = useState(initialProjects);
  const [skills, setSkills] = useState(initialSkills);
  const [education, setEducation] = useState(initialEducation);
  const [achievements, setAchievements] = useState(initialAchievements);
  const [messages, setMessages] = useState(initialMessages);
  const [socialLinks, setSocialLinks] = useState<AdminSocialLink[]>(() => initialProfile.socialLinks.map((link) => ({ ...link, visible: link.visible !== false })));
  const [notice, setNotice] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [previewMenuOpen, setPreviewMenuOpen] = useState(false);
  const [previewNoticeVisible, setPreviewNoticeVisible] = useState(true);
  const [modalType, setModalType] = useState<CreateModal>(null);
  const [projectDraft, setProjectDraft] = useState<Project>({ id: "", title: "", category: "", description: "", technologies: [], image: "/images/project-preview.svg", liveUrl: "", sourceUrl: "", featured: false });
  const [skillDraft, setSkillDraft] = useState<SkillGroup>({ id: "", title: "", items: [] });
  const [educationDraft, setEducationDraft] = useState<EducationEntry>({ id: "", institution: "", qualification: "", status: "In progress", dates: "", description: "" });
  const [achievementDraft, setAchievementDraft] = useState<Achievement>({ id: "", title: "", value: "", description: "", url: "" });
  const [socialDraft, setSocialDraft] = useState({ platformId: "", url: "", visible: true });
  const closeModal = useCallback(() => setModalType(null), []);

  const title = sections.find((section) => section.id === activeSection)?.label ?? "Overview";
  const totalSkills = skills.reduce((total, group) => total + group.items.length, 0);
  const unreadMessages = messages.filter((message) => !message.isRead).length;
  const availableSocialPlatforms = socialPlatforms.filter((platform) => !socialLinks.some((link) => link.id === platform.id));

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2800);
  }

  async function persistChanges() {
    setIsSaving(true);
    try {
      const result = await savePortfolioContentAction({
        profile: { ...profile, socialLinks: socialLinks.map(({ id, label, url, visible }) => ({ id, label, url, visible })) },
        projects,
        skills,
        education,
        achievements,
      });
      if (!result.ok) throw new Error(result.error);
      showNotice(`Changes saved to ${storageMode}.`);
      router.refresh();
    } catch (error) {
      showNotice(error instanceof Error ? error.message : "Could not save your changes.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void persistChanges();
  }

  async function logout() {
    await logoutAdmin();
    router.refresh();
  }

  async function toggleMessageRead(message: ContactMessage) {
    try {
      const result = await setMessageReadAction(message.id, !message.isRead);
      if (!result.ok) throw new Error(result.error);
      setMessages((current) => current.map((item) => item.id === message.id ? { ...item, isRead: !item.isRead } : item));
    } catch {
      showNotice("Could not update this message. Please try again.");
    }
  }

  async function removeMessage(message: ContactMessage) {
    if (!window.confirm(`Delete the message from ${message.name}?`)) return;
    try {
      const result = await deleteMessageAction(message.id);
      if (!result.ok) throw new Error(result.error);
      setMessages((current) => current.filter((item) => item.id !== message.id));
      showNotice("Message deleted.");
    } catch {
      showNotice("Could not delete this message. Please try again.");
    }
  }

  function addProject() {
    setProjectDraft({ id: "", title: "", category: "", description: "", technologies: [], image: "/images/project-preview.svg", liveUrl: "", sourceUrl: "", featured: false });
    setModalType("project");
  }

  function addSkillGroup() {
    setSkillDraft({ id: "", title: "", items: [] });
    setModalType("skill");
  }

  function addEducation() {
    setEducationDraft({ id: "", institution: "", qualification: "", status: "In progress", dates: "", description: "" });
    setModalType("education");
  }

  function addAchievement() {
    setAchievementDraft({ id: "", title: "", value: "", description: "", url: "" });
    setModalType("achievement");
  }

  function addSocialProfile() {
    const firstAvailable = availableSocialPlatforms[0];
    if (!firstAvailable) return;
    setSocialDraft({ platformId: firstAvailable.id, url: "", visible: true });
    setModalType("social");
  }

  function submitCreation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = `draft-${Date.now()}`;

    if (modalType === "project") {
      setProjects((current) => [{ ...projectDraft, id }, ...current]);
      showNotice("Project added. Save changes to publish it.");
    } else if (modalType === "skill") {
      setSkills((current) => [...current, { ...skillDraft, id }]);
      showNotice("Skill group added. Save changes to publish it.");
    } else if (modalType === "education") {
      setEducation((current) => [...current, { ...educationDraft, id }]);
      showNotice("Education entry added. Save changes to publish it.");
    } else if (modalType === "achievement") {
      setAchievements((current) => [...current, { ...achievementDraft, id }]);
      showNotice("Achievement added. Save changes to publish it.");
    } else if (modalType === "social") {
      const platform = socialPlatforms.find((item) => item.id === socialDraft.platformId);
      if (platform) {
        setSocialLinks((current) => [...current, { id: platform.id, label: platform.label, url: socialDraft.url, visible: socialDraft.visible }]);
        showNotice(`${platform.label} added. Save changes to publish it.`);
      }
    }

    setModalType(null);
  }

  const saveButton = <button className="admin-button admin-button--primary" type="submit" disabled={isSaving}>{isSaving ? "Saving…" : "Save changes"} <span>↗</span></button>;
  const addProjectButton = <button className="admin-button admin-button--primary" type="button" onClick={addProject}><Icon name="plus" size={16} /> Add project</button>;
  const addSkillButton = <button className="admin-button admin-button--primary" type="button" onClick={addSkillGroup}><Icon name="plus" size={16} /> Add group</button>;
  const addEducationButton = <button className="admin-button admin-button--primary" type="button" onClick={addEducation}><Icon name="plus" size={16} /> Add education</button>;
  const addAchievementButton = <button className="admin-button admin-button--primary" type="button" onClick={addAchievement}><Icon name="plus" size={16} /> Add achievement</button>;

  return (
    <main className="admin-shell">
      <aside className={`admin-sidebar${previewMenuOpen ? " is-open" : ""}`}>
        <a className="admin-brand" href="/" aria-label="Portfolio admin home">
          <span className="admin-brand-mark">Y<span>.</span></span>
          <span className="admin-brand-copy">Portfolio studio<small>CONTENT MANAGER</small></span>
        </a>

        <p className="admin-nav-label">WORKSPACE</p>
        <nav className="admin-nav" aria-label="Admin navigation">
          {sections.map((section) => (
            <button
              key={section.id}
              className={`admin-nav-item${activeSection === section.id ? " is-active" : ""}`}
              type="button"
              aria-current={activeSection === section.id ? "page" : undefined}
              onClick={() => { setActiveSection(section.id); setPreviewMenuOpen(false); }}
            >
              <Icon name={section.icon} />
              <span>{section.label}</span>
              {section.id === "projects" && <span className="admin-nav-count">{projects.length}</span>}
              {section.id === "messages" && unreadMessages > 0 && <span className="admin-nav-count">{unreadMessages}</span>}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-bottom">
          <div className="admin-storage-card">
            <span className="admin-storage-icon"><Icon name="settings" size={16} /></span>
            <span><strong>Content source</strong><small>{storageMode}</small></span>
            <i aria-label="Connected" />
          </div>
          <div className="admin-user-card">
            <span className="admin-avatar">YA</span>
            <span><strong>{profile.name}</strong><small>Portfolio owner</small></span>
            <button type="button" aria-label="Sign out" onClick={logout}>Sign out</button>
          </div>
        </div>
      </aside>
      {previewMenuOpen && <button className="admin-sidebar-backdrop" type="button" aria-label="Close admin navigation" onClick={() => setPreviewMenuOpen(false)} />}

      <section className="admin-main">
        <header className="admin-topbar">
          <div className="admin-breadcrumb"><span>Workspace</span><Icon name="chevron" size={15} /><strong>{title}</strong></div>
          <div className="admin-topbar-actions">
            <span className="admin-preview-badge"><i /> {storageMode}</span>
            <a className="admin-button admin-button--quiet" href="/" target="_blank" rel="noreferrer">View portfolio <Icon name="arrow" size={15} /></a>
            <button className="admin-button admin-button--primary" type="button" onClick={() => void persistChanges()} disabled={isSaving}>{isSaving ? "Saving…" : "Save changes"}</button>
            <button className="admin-mobile-menu" type="button" aria-label="Toggle admin navigation" aria-expanded={previewMenuOpen} onClick={() => setPreviewMenuOpen((open) => !open)}><span /><span /><span /></button>
          </div>
        </header>

        <div className="admin-content">
          {previewNoticeVisible && <div className="admin-preview-notice"><span className="admin-notice-icon">i</span><p><strong>Changes are saved when you choose Save changes.</strong> New edits stay in this page until saved to {storageMode}.</p><button type="button" aria-label="Dismiss save notice" onClick={() => setPreviewNoticeVisible(false)}>×</button></div>}

          {activeSection === "overview" && (
            <>
              <SectionHeading eyebrow="CONTENT OVERVIEW" title={`Welcome back, ${profile.name.split(" ")[0]}`} description="Here’s what’s in your portfolio right now." action={<a className="admin-button admin-button--quiet" href="/" target="_blank" rel="noreferrer">Open live site <Icon name="arrow" size={15} /></a>} />
              <div className="admin-stat-grid">
                <article className="admin-stat-card"><span className="admin-stat-icon admin-stat-icon--coral"><Icon name="folder" /></span><p>Projects</p><strong>{projects.length.toString().padStart(2, "0")}</strong><small>Portfolio entries</small></article>
                <article className="admin-stat-card"><span className="admin-stat-icon admin-stat-icon--blue"><Icon name="sparkles" /></span><p>Skills</p><strong>{totalSkills.toString().padStart(2, "0")}</strong><small>Across {skills.length} groups</small></article>
                <article className="admin-stat-card"><span className="admin-stat-icon admin-stat-icon--violet"><Icon name="graduation" /></span><p>Education</p><strong>{education.length.toString().padStart(2, "0")}</strong><small>Education entries</small></article>
                <article className="admin-stat-card"><span className="admin-stat-icon admin-stat-icon--green"><Icon name="user" /></span><p>Profile</p><strong>Ready</strong><small>Core details are filled in</small></article>
              </div>

              <div className="admin-overview-grid">
                <section className="admin-panel admin-content-panel">
                  <div className="admin-panel-heading"><div><h2>Your content</h2><p>Choose a section to review or update.</p></div><span className="admin-count-pill">{sections.length - 1} sections</span></div>
                  <div className="admin-content-list">
                    {[
                      { id: "profile" as const, icon: "user", label: "Profile & introduction", detail: profile.role, status: "Complete" },
                      { id: "projects" as const, icon: "folder", label: "Projects", detail: `${projects.length} portfolio projects`, status: "Published" },
                      { id: "skills" as const, icon: "sparkles", label: "Skills", detail: `${skills.length} categories · ${totalSkills} skills`, status: "Published" },
                      { id: "education" as const, icon: "graduation", label: "Education", detail: `${education.length} education entries`, status: "Published" },
                      { id: "contact" as const, icon: "message", label: "Contact & footer", detail: profile.email, status: "Complete" },
                      { id: "messages" as const, icon: "message", label: "Messages", detail: `${messages.length} submissions`, status: unreadMessages > 0 ? `${unreadMessages} new` : "Inbox" },
                    ].map((item) => (
                      <button className="admin-content-row" key={item.id} type="button" onClick={() => setActiveSection(item.id)}>
                        <span className="admin-row-icon"><Icon name={item.icon} size={17} /></span>
                        <span className="admin-row-copy"><strong>{item.label}</strong><small>{item.detail}</small></span>
                        <span className="admin-row-status"><i />{item.status}</span>
                        <Icon name="chevron" size={16} />
                      </button>
                    ))}
                  </div>
                </section>

                <section className="admin-panel admin-preview-card">
                  <div className="admin-panel-heading"><div><h2>Portfolio preview</h2><p>Your public profile at a glance.</p></div><span className="admin-live-dot">LIVE</span></div>
                  <div className="admin-mini-site">
                    <div className="admin-mini-top"><span>{profile.name}<b>.</b></span><span className="admin-mini-menu"><i /><i /><i /></span></div>
                    <div className="admin-mini-body"><span className="admin-mini-kicker">{profile.greeting}</span><strong>{profile.name}<b>.</b></strong><span className="admin-mini-role">{profile.role}</span><p>{profile.tagline}</p><span className="admin-mini-cta">Let&apos;s work together <Icon name="arrow" size={12} /></span></div>
                    <div className="admin-mini-bottom"><span /> <span /> <span /></div>
                  </div>
                  <a href="/" target="_blank" rel="noreferrer" className="admin-text-link">View full portfolio <Icon name="arrow" size={14} /></a>
                </section>
              </div>

              <section className="admin-panel admin-quick-actions">
                <div><span className="admin-quick-icon"><Icon name="sparkles" size={19} /></span><span><strong>Keep your portfolio fresh</strong><small>Add a new project or update your introduction.</small></span></div>
                <div className="admin-quick-buttons"><button className="admin-button admin-button--quiet" type="button" onClick={() => setActiveSection("profile")}>Edit profile</button><button className="admin-button admin-button--primary" type="button" onClick={() => { setActiveSection("projects"); addProject(); }}> <Icon name="plus" size={15} /> Add a project</button></div>
              </section>
            </>
          )}

          {activeSection === "profile" && (
            <>
              <SectionHeading eyebrow="PERSONAL DETAILS" title="Profile" description="Shape the introduction visitors see when they open your portfolio." />
              <form className="admin-panel admin-form-panel" onSubmit={handleSave}>
                <div className="admin-panel-heading"><div><h2>Basic information</h2><p>Your name, role, and short introduction.</p></div><span className="admin-section-step">01 / 02</span></div>
                <div className="admin-form-grid">
                  <Field label="Full name" value={profile.name} onChange={(value) => setProfile({ ...profile, name: value })} />
                  <Field label="Professional title" value={profile.role} onChange={(value) => setProfile({ ...profile, role: value })} />
                  <Field label="Location" value={profile.location} onChange={(value) => setProfile({ ...profile, location: value })} />
                  <Field label="Short tagline" value={profile.tagline} onChange={(value) => setProfile({ ...profile, tagline: value })} />
                  <Field label="About your work" value={profile.description} onChange={(value) => setProfile({ ...profile, description: value })} multiline wide />
                  <Field label="About section text" value={profile.about.body} onChange={(value) => setProfile({ ...profile, about: { ...profile.about, body: value } })} multiline wide />
                  <Field label="Internship / availability note" value={profile.about.seeking} onChange={(value) => setProfile({ ...profile, about: { ...profile.about, seeking: value } })} multiline wide />
                </div>
                <div className="admin-form-footer"><span>Save to publish these changes on your portfolio.</span>{saveButton}</div>
              </form>
            </>
          )}

          {activeSection === "projects" && (
            <>
              <SectionHeading eyebrow="PORTFOLIO CONTENT" title="Projects" description="Manage project details, links, technologies, and which work is featured." action={addProjectButton} />
              <div className="admin-project-list">
                {projects.map((project, index) => (
                  <details className="admin-panel admin-project-item" key={project.id}>
                    <summary><span className="admin-project-number">{String(index + 1).padStart(2, "0")}</span><span className="admin-project-summary"><strong>{project.title}</strong><small>{project.category} · {project.technologies.length} technologies</small></span><span className={`admin-project-status${project.featured ? " is-featured" : ""}`}>{project.featured ? "Featured" : "Hidden"}</span><span className="admin-details-chevron"><Icon name="chevron" size={16} /></span></summary>
                    <div className="admin-project-editor"><div className="admin-form-grid">
                      <Field label="Project name" value={project.title} onChange={(value) => setProjects((current) => current.map((item) => item.id === project.id ? { ...item, title: value } : item))} />
                      <Field label="Category" value={project.category} onChange={(value) => setProjects((current) => current.map((item) => item.id === project.id ? { ...item, category: value } : item))} />
                      <Field label="Description" value={project.description} onChange={(value) => setProjects((current) => current.map((item) => item.id === project.id ? { ...item, description: value } : item))} multiline wide />
                      <SkillPicker label="Project technologies" value={project.technologies} onChange={(technologies) => setProjects((current) => current.map((item) => item.id === project.id ? { ...item, technologies } : item))} wide />
                      <Field label="Live project URL" value={project.liveUrl} onChange={(value) => setProjects((current) => current.map((item) => item.id === project.id ? { ...item, liveUrl: value } : item))} />
                      <Field label="Source code URL" value={project.sourceUrl} onChange={(value) => setProjects((current) => current.map((item) => item.id === project.id ? { ...item, sourceUrl: value } : item))} />
                    </div><div className="admin-project-editor-footer"><label className="admin-checkbox"><input type="checkbox" checked={project.featured} onChange={(event) => setProjects((current) => current.map((item) => item.id === project.id ? { ...item, featured: event.target.checked } : item))} /> Show on portfolio</label><button className="admin-delete-button" type="button" onClick={() => { setProjects((current) => current.filter((item) => item.id !== project.id)); showNotice("Project removed. Save changes to publish."); }}>Remove project</button></div></div>
                  </details>
                ))}
              </div>
              <div className="admin-form-footer admin-form-footer--standalone"><span>Save project edits to publish them on your portfolio.</span><button className="admin-button admin-button--primary" type="button" onClick={() => void persistChanges()} disabled={isSaving}>{isSaving ? "Saving…" : "Save changes"} <span>↗</span></button></div>
            </>
          )}

          {activeSection === "skills" && (
            <>
              <SectionHeading eyebrow="WHAT YOU WORK WITH" title="Skills" description="Group your tools and technologies into clear, easy-to-scan categories." action={addSkillButton} />
              <div className="admin-card-grid">
                {skills.map((group, index) => (
                  <article className="admin-panel admin-skill-editor" key={group.id}>
                    <div className="admin-panel-heading"><span className="admin-skill-index">{String(index + 1).padStart(2, "0")}</span><button className="admin-icon-button" type="button" aria-label={`Remove ${group.title}`} onClick={() => { setSkills((current) => current.filter((item) => item.id !== group.id)); showNotice("Skill group removed. Save changes to publish."); }}>×</button></div>
                    <Field label="Group name" value={group.title} onChange={(value) => setSkills((current) => current.map((item) => item.id === group.id ? { ...item, title: value } : item))} />
                    <SkillPicker label="Skills in this group" value={group.items} onChange={(items) => setSkills((current) => current.map((item) => item.id === group.id ? { ...item, items } : item))} />
                  </article>
                ))}
              </div>
              <div className="admin-form-footer admin-form-footer--standalone"><span>{totalSkills} skills across {skills.length} groups</span><button className="admin-button admin-button--primary" type="button" onClick={() => void persistChanges()} disabled={isSaving}>{isSaving ? "Saving…" : "Save changes"} <span>↗</span></button></div>
            </>
          )}

          {activeSection === "education" && (
            <>
              <SectionHeading eyebrow="YOUR BACKGROUND" title="Education" description="Keep your studies and qualifications current for visitors and recruiters." action={addEducationButton} />
              <div className="admin-entry-list">{education.map((entry) => (
                <article className="admin-panel admin-entry-editor" key={entry.id}>
                  <span className="admin-entry-icon"><Icon name="graduation" /></span><div className="admin-form-grid">
                    <Field label="Institution" value={entry.institution} onChange={(value) => setEducation((current) => current.map((item) => item.id === entry.id ? { ...item, institution: value } : item))} />
                    <Field label="Qualification" value={entry.qualification} onChange={(value) => setEducation((current) => current.map((item) => item.id === entry.id ? { ...item, qualification: value } : item))} />
                    <Field label="Status" value={entry.status} onChange={(value) => setEducation((current) => current.map((item) => item.id === entry.id ? { ...item, status: value } : item))} />
                    <Field label="Dates" value={entry.dates ?? ""} onChange={(value) => setEducation((current) => current.map((item) => item.id === entry.id ? { ...item, dates: value } : item))} />
                    <Field label="Description" value={entry.description ?? ""} onChange={(value) => setEducation((current) => current.map((item) => item.id === entry.id ? { ...item, description: value } : item))} multiline wide />
                  </div><button className="admin-delete-button" type="button" onClick={() => { setEducation((current) => current.filter((item) => item.id !== entry.id)); showNotice("Education entry removed. Save changes to publish."); }}>Remove entry</button>
                </article>
              ))}</div>
              <div className="admin-form-footer admin-form-footer--standalone"><span>Education appears in the portfolio background section.</span><button className="admin-button admin-button--primary" type="button" onClick={() => void persistChanges()} disabled={isSaving}>{isSaving ? "Saving…" : "Save changes"} <span>↗</span></button></div>
            </>
          )}

          {activeSection === "achievements" && (
            <>
              <SectionHeading eyebrow="MILESTONES & RECOGNITION" title="Achievements" description="Highlight milestones, awards, and accomplishments that support your story." action={addAchievementButton} />
              <div className="admin-entry-list">{achievements.map((achievement) => (
                <article className="admin-panel admin-entry-editor" key={achievement.id}>
                  <span className="admin-entry-icon admin-entry-icon--award"><Icon name="award" /></span><div className="admin-form-grid">
                    <Field label="Achievement title" value={achievement.title} onChange={(value) => setAchievements((current) => current.map((item) => item.id === achievement.id ? { ...item, title: value } : item))} />
                    <Field label="Value or result" value={achievement.value ?? ""} onChange={(value) => setAchievements((current) => current.map((item) => item.id === achievement.id ? { ...item, value } : item))} />
                    <Field label="Description" value={achievement.description ?? ""} onChange={(value) => setAchievements((current) => current.map((item) => item.id === achievement.id ? { ...item, description: value } : item))} multiline wide />
                    <Field label="Related link" value={achievement.url ?? ""} onChange={(value) => setAchievements((current) => current.map((item) => item.id === achievement.id ? { ...item, url: value } : item))} wide />
                  </div><button className="admin-delete-button" type="button" onClick={() => { setAchievements((current) => current.filter((item) => item.id !== achievement.id)); showNotice("Achievement removed. Save changes to publish."); }}>Remove achievement</button>
                </article>
              ))}</div>
              <div className="admin-form-footer admin-form-footer--standalone"><span>{achievements.length} achievement entries</span><button className="admin-button admin-button--primary" type="button" onClick={() => void persistChanges()} disabled={isSaving}>{isSaving ? "Saving…" : "Save changes"} <span>↗</span></button></div>
            </>
          )}

          {activeSection === "contact" && (
            <>
              <SectionHeading eyebrow="MAKE IT EASY TO REACH YOU" title="Contact & footer" description="Manage the contact details and closing message shown across your site." />
              <form className="admin-panel admin-form-panel" onSubmit={handleSave}>
                <div className="admin-panel-heading"><div><h2>Contact information</h2><p>These details are used in the contact section and footer.</p></div><span className="admin-section-step">01 / 02</span></div>
                <div className="admin-form-grid">
                  <Field label="Email address" value={profile.email} onChange={(value) => setProfile({ ...profile, email: value })} />
                  <Field label="Phone number" value={profile.phone} onChange={(value) => setProfile({ ...profile, phone: value })} />
                  <Field label="Location" value={profile.location} onChange={(value) => setProfile({ ...profile, location: value })} />
                  <Field label="Resume / CV file path" value={profile.resumeUrl} onChange={(value) => setProfile({ ...profile, resumeUrl: value })} />
                  <Field label="Contact section message" value={profile.contactMessage} onChange={(value) => setProfile({ ...profile, contactMessage: value })} multiline wide />
                  <Field label="Availability note" value={profile.about.seeking} onChange={(value) => setProfile({ ...profile, about: { ...profile.about, seeking: value } })} multiline wide />
                </div>
                <div className="admin-social-editor">
                  <div className="admin-social-heading">
                    <div><h3>Social profiles</h3><p>Choose the networks to show in your hero, contact section, and footer.</p></div>
                    <button className="admin-button admin-button--quiet" type="button" onClick={addSocialProfile} disabled={availableSocialPlatforms.length === 0}><Icon name="plus" size={15} /> Add social</button>
                  </div>
                  {socialLinks.length === 0 && <p className="admin-social-empty">No social profiles yet. Add a platform to show it on your portfolio.</p>}
                  {socialLinks.map((link) => {
                    const platformChoices = socialPlatforms.filter((platform) => platform.id === link.id || !socialLinks.some((other) => other.id === platform.id));
                    return (
                      <div className="admin-social-row" key={link.id}>
                        <span className="admin-social-badge" aria-hidden="true">{link.label.slice(0, 1)}</span>
                        <label className="admin-field"><span>Platform</span><select value={link.id} onChange={(event) => {
                          const platform = socialPlatforms.find((item) => item.id === event.target.value);
                          if (platform) setSocialLinks((current) => current.map((item) => item.id === link.id ? { ...item, id: platform.id, label: platform.label } : item));
                        }}>{platformChoices.map((platform) => <option key={platform.id} value={platform.id}>{platform.label}</option>)}</select></label>
                        <Field label={`${link.label} profile URL`} value={link.url} placeholder="https://..." inputType="url" onChange={(value) => setSocialLinks((current) => current.map((item) => item.id === link.id ? { ...item, url: value } : item))} />
                        <label className="admin-visibility-toggle"><input type="checkbox" checked={link.visible} onChange={(event) => setSocialLinks((current) => current.map((item) => item.id === link.id ? { ...item, visible: event.target.checked } : item))} /><span className="admin-toggle-track" /><span>Show on site</span></label>
                        <button className="admin-social-remove" type="button" aria-label={`Remove ${link.label}`} onClick={() => { setSocialLinks((current) => current.filter((item) => item.id !== link.id)); showNotice(`${link.label} removed. Save changes to publish.`); }}>×</button>
                      </div>
                    );
                  })}
                </div>
                <div className="admin-form-footer"><span>Save to publish these changes on your portfolio.</span>{saveButton}</div>
              </form>
            </>
          )}

          {activeSection === "messages" && (
            <>
              <SectionHeading
                eyebrow="CONTACT INBOX"
                title="Messages"
                description={`${messages.length} saved messages${unreadMessages ? ` · ${unreadMessages} unread` : ""}. Reply directly to a sender by email.`}
              />
              {messages.length === 0 ? (
                <section className="admin-panel admin-message-empty">
                  <span className="admin-entry-icon"><Icon name="message" /></span>
                  <h2>Your inbox is clear</h2>
                  <p>Messages sent through the portfolio contact form will appear here.</p>
                </section>
              ) : (
                <div className="admin-message-list">
                  {messages.map((message) => (
                    <article className={`admin-panel admin-message-card${message.isRead ? "" : " is-unread"}`} key={message.id}>
                      <header className="admin-message-header">
                        <div className="admin-message-contact">
                          <div className="admin-message-sender"><h2>{message.name}</h2>{!message.isRead && <span className="admin-message-unread">Unread</span>}</div>
                          <a className="admin-message-email" href={`mailto:${message.email}`}>{message.email}</a>
                        </div>
                        <div className="admin-message-meta"><time dateTime={message.createdAt}>{new Date(message.createdAt).toISOString().replace("T", " ").slice(0, 16)} UTC</time></div>
                      </header>
                      <p className="admin-message-body">{message.message}</p>
                      <footer className="admin-message-actions">
                        <a className="admin-button admin-button--primary" href={`mailto:${message.email}?subject=${encodeURIComponent(`Re: Portfolio message from ${message.name}`)}`}>Reply by email</a>
                        <button className="admin-button admin-button--quiet" type="button" onClick={() => void toggleMessageRead(message)}>{message.isRead ? "Mark unread" : "Mark read"}</button>
                        <button className="admin-delete-button" type="button" onClick={() => void removeMessage(message)}>Delete</button>
                      </footer>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}

          {activeSection === "settings" && (
            <>
              <SectionHeading eyebrow="PORTFOLIO PREFERENCES" title="Site settings" description="A central place for site-wide options and publishing preferences." />
              <div className="admin-settings-stack">
                <section className="admin-panel admin-setting-panel"><div className="admin-panel-heading"><div><h2>Site identity</h2><p>How your portfolio is identified in the browser and search results.</p></div><span className="admin-setting-icon"><Icon name="user" /></span></div><div className="admin-form-grid"><Field label="Site title" value={`${profile.name} | Developer Portfolio`} onChange={() => {}} disabled /><Field label="Site description" value={profile.description} onChange={() => {}} multiline disabled /></div></section>
                <section className="admin-panel admin-setting-panel"><div className="admin-panel-heading"><div><h2>Content storage</h2><p>Where portfolio content is read and saved.</p></div><span className="admin-setting-icon"><Icon name="settings" /></span></div><div className="admin-storage-detail"><span className="admin-storage-status"><i />Connected</span><span><strong>{storageMode}</strong><small>Profile and portfolio sections are stored as editable content documents.</small></span><span className="admin-coming-soon">Active</span></div></section>
                <section className="admin-panel admin-setting-panel"><div className="admin-panel-heading"><div><h2>Publishing</h2><p>Your portfolio is rendered by the Next.js server.</p></div><span className="admin-setting-icon"><Icon name="arrow" /></span></div><div className="admin-publish-row"><span><strong>Public portfolio</strong><small>Visitors can view the portfolio website.</small></span><span className="admin-public-status"><i />Available</span></div><div className="admin-settings-footnote">For Vercel, configure DATABASE_URL with your Neon connection string.</div></section>
              </div>
            </>
          )}

          <footer className="admin-footer"><span>Portfolio Studio <b>·</b> Content manager</span><span>Built for {profile.name}</span></footer>
        </div>
      </section>

      {modalType && (
        <AdminModal
          title={{ project: "Add a project", skill: "Add a skill group", education: "Add education", achievement: "Add an achievement", social: "Add a social profile" }[modalType]}
          description="Enter the details below, then save your changes to publish them."
          submitLabel={{ project: "Add project", skill: "Add skill group", education: "Add education", achievement: "Add achievement", social: "Add profile" }[modalType]}
          onClose={closeModal}
          onSubmit={submitCreation}
        >
          {modalType === "project" && <div className="admin-form-grid">
            <Field label="Project name" value={projectDraft.title} onChange={(value) => setProjectDraft({ ...projectDraft, title: value })} required />
            <Field label="Category" value={projectDraft.category} onChange={(value) => setProjectDraft({ ...projectDraft, category: value })} required />
            <Field label="Description" value={projectDraft.description} onChange={(value) => setProjectDraft({ ...projectDraft, description: value })} multiline wide />
            <SkillPicker label="Project technologies" value={projectDraft.technologies} onChange={(technologies) => setProjectDraft({ ...projectDraft, technologies })} wide />
            <Field label="Project image path" value={projectDraft.image} onChange={(value) => setProjectDraft({ ...projectDraft, image: value })} wide />
            <Field label="Live project URL" value={projectDraft.liveUrl} onChange={(value) => setProjectDraft({ ...projectDraft, liveUrl: value })} inputType="url" />
            <Field label="Source code URL" value={projectDraft.sourceUrl} onChange={(value) => setProjectDraft({ ...projectDraft, sourceUrl: value })} inputType="url" />
            <label className="admin-checkbox admin-modal-featured"><input type="checkbox" checked={projectDraft.featured} onChange={(event) => setProjectDraft({ ...projectDraft, featured: event.target.checked })} /> Show this project on the portfolio</label>
          </div>}

          {modalType === "skill" && <div className="admin-form-grid">
            <Field label="Group name" value={skillDraft.title} onChange={(value) => setSkillDraft({ ...skillDraft, title: value })} required wide />
            <SkillPicker label="Skills in this group" value={skillDraft.items} onChange={(items) => setSkillDraft({ ...skillDraft, items })} wide />
          </div>}

          {modalType === "education" && <div className="admin-form-grid">
            <Field label="Institution" value={educationDraft.institution} onChange={(value) => setEducationDraft({ ...educationDraft, institution: value })} required />
            <Field label="Qualification" value={educationDraft.qualification} onChange={(value) => setEducationDraft({ ...educationDraft, qualification: value })} required />
            <Field label="Status" value={educationDraft.status} onChange={(value) => setEducationDraft({ ...educationDraft, status: value })} />
            <Field label="Dates" value={educationDraft.dates ?? ""} onChange={(value) => setEducationDraft({ ...educationDraft, dates: value })} placeholder="2023 — Present" />
            <Field label="Description" value={educationDraft.description ?? ""} onChange={(value) => setEducationDraft({ ...educationDraft, description: value })} multiline wide />
          </div>}

          {modalType === "achievement" && <div className="admin-form-grid">
            <Field label="Achievement title" value={achievementDraft.title} onChange={(value) => setAchievementDraft({ ...achievementDraft, title: value })} required />
            <Field label="Value or result" value={achievementDraft.value ?? ""} onChange={(value) => setAchievementDraft({ ...achievementDraft, value })} placeholder="e.g. 1st place" />
            <Field label="Description" value={achievementDraft.description ?? ""} onChange={(value) => setAchievementDraft({ ...achievementDraft, description: value })} multiline wide />
            <Field label="Related link" value={achievementDraft.url ?? ""} onChange={(value) => setAchievementDraft({ ...achievementDraft, url: value })} inputType="url" wide />
          </div>}

          {modalType === "social" && <div className="admin-form-grid">
            <label className="admin-field admin-field--wide"><span>Social platform</span><select required value={socialDraft.platformId} onChange={(event) => setSocialDraft({ ...socialDraft, platformId: event.target.value })}>{availableSocialPlatforms.map((platform) => <option key={platform.id} value={platform.id}>{platform.label}</option>)}</select></label>
            <Field label="Profile URL" value={socialDraft.url} onChange={(value) => setSocialDraft({ ...socialDraft, url: value })} placeholder="https://..." inputType="url" required wide />
            <label className="admin-checkbox admin-modal-featured"><input type="checkbox" checked={socialDraft.visible} onChange={(event) => setSocialDraft({ ...socialDraft, visible: event.target.checked })} /> Show this profile on the portfolio</label>
          </div>}
        </AdminModal>
      )}

      {notice && <div className="admin-toast" role="status"><span>i</span>{notice}<button type="button" aria-label="Dismiss message" onClick={() => setNotice("")}>×</button></div>}
    </main>
  );
}
