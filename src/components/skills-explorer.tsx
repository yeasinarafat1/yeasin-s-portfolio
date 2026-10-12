"use client";

import { useState } from "react";
import type { SkillGroup } from "@/types/portfolio";

function CategoryIcon({ id }: { id: string }) {
  if (id === "all") {
    return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>;
  }
  if (id === "frontend") {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m8 7-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"/></svg>;
  }
  if (id === "backend") {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="8" height="6" rx="2"/><rect x="13" y="14" width="8" height="6" rx="2"/><path d="M11 7h3a3 3 0 0 1 3 3v4M7 10v4a3 3 0 0 0 3 3h3"/></svg>;
  }
  if (id === "database") {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v7c0 1.7 3.6 3 8 3s8-1.3 8-3v-7"/><path d="M4 14c0 1.7 3.6 3 8 3s8-1.3 8-3"/></svg>;
  }
  if (id === "languages") {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m8 7-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"/></svg>;
  }
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14.5 6.5a5 5 0 0 0-6.9 6.9L3 18l3 3 4.6-4.6a5 5 0 0 0 6.9-6.9L14 13l-3-3 3.5-3.5Z"/><path d="m16 4 4 4"/></svg>;
}

function TechnologyIcon({ name }: { name: string }) {
  if (name === "React" || name === "React.js") {
    return <span className="technology-icon technology-icon--react" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25"><ellipse cx="12" cy="12" rx="10" ry="4.2"/><ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(120 12 12)"/><circle cx="12" cy="12" r="1.7" fill="currentColor" stroke="none"/></svg></span>;
  }
  if (name === "TypeScript" || name === "JavaScript") {
    const isTypeScript = name === "TypeScript";
    return <span className={`technology-icon technology-icon--wordmark ${isTypeScript ? "" : "technology-icon--javascript"}`} aria-hidden="true">{isTypeScript ? "TS" : "JS"}</span>;
  }
  if (name === "Next.js") return <span className="technology-icon technology-icon--next" aria-hidden="true">N</span>;
  if (name === "HTML" || name === "CSS") {
    return <span className={`technology-icon ${name === "HTML" ? "technology-icon--html" : "technology-icon--css"}`} aria-hidden="true">{name === "HTML" ? "5" : "3"}</span>;
  }
  if (name === "Tailwind CSS") {
    return <span className="technology-icon technology-icon--tailwind" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 5.5c-3.1 0-5.1 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.9.2 1.5.9 2.2 1.6 1.1 1.2 2.3 2.5 4.8 2.5 3.1 0 5.1-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.9-.2-1.5-.9-2.2-1.6C15.7 6.8 14.5 5.5 12 5.5ZM6 13.4c-3.1 0-5.1 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.9.2 1.5.9 2.2 1.6 1.1 1.2 2.3 2.5 4.8 2.5 3.1 0 5.1-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.9-.2-1.5-.9-2.2-1.6C9.7 14.7 8.5 13.4 6 13.4Z" transform="translate(1 -1) scale(.9)"/></svg></span>;
  }
  if (name === "Node.js") {
    return <span className="technology-icon technology-icon--node" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"><path d="m12 2.8 8 4.6v9.2l-8 4.6-8-4.6V7.4l8-4.6Z"/><path d="m9 9 6 6m0-6-6 6"/></svg></span>;
  }
  if (name === "REST APIs") {
    return <span className="technology-icon technology-icon--rest" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m8 5-5 7 5 7M16 5l5 7-5 7M14 4l-4 16"/></svg></span>;
  }
  if (["PostgreSQL", "Drizzle ORM", "IndexedDB"].includes(name)) {
    return <span className="technology-icon technology-icon--database" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v13c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11c0 1.7 3.6 3 8 3s8-1.3 8-3"/></svg></span>;
  }
  if (name === "Git") {
    return <span className="technology-icon technology-icon--git" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="7" cy="5" r="2"/><circle cx="7" cy="19" r="2"/><circle cx="17" cy="9" r="2"/><path d="M7 7v10m0-9c0 5 10 1 10 9"/></svg></span>;
  }
  if (name === "GitHub") return <span className="technology-icon technology-icon--github" aria-hidden="true">GH</span>;
  if (name === "Vercel") {
    return <span className="technology-icon technology-icon--vercel" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3 23 21H1L12 3Z"/></svg></span>;
  }
  return <span className="technology-icon technology-icon--rest" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m8 6-6 6 6 6m8-12 6 6-6 6"/></svg></span>;
}

export function SkillsExplorer({ groups }: { groups: SkillGroup[] }) {
  const populatedGroups = groups.filter((group) => group.items.length > 0);
  const [activeId, setActiveId] = useState("all");
  const filteredGroups = activeId === "all" ? populatedGroups : populatedGroups.filter((group) => group.id === activeId);
  const technologyCount = filteredGroups.reduce((count, group) => count + group.items.length, 0);
  const filters = [{ id: "all", title: "All skills" }, ...populatedGroups.map(({ id, title }) => ({ id, title }))];

  if (populatedGroups.length === 0) return null;

  return (
    <div className="skills-explorer">
      <div className="skill-filters" role="group" aria-label="Filter technologies by category">
        {filters.map((filter) => (
          <button
            className="skill-filter"
            type="button"
            key={filter.id}
            aria-pressed={activeId === filter.id}
            onClick={() => setActiveId(filter.id)}
          >
            <span className="skill-filter-icon"><CategoryIcon id={filter.id} /></span>
            <span>{filter.title}</span>
          </button>
        ))}
      </div>
      <p className="skills-count" aria-live="polite">
        Showing {technologyCount} {technologyCount === 1 ? "technology" : "technologies"}
        {activeId !== "all" && ` in ${filteredGroups[0]?.title ?? "this category"}`}
      </p>
      <div className={`skill-grid${activeId === "all" ? "" : " skill-grid--filtered"}`}>
        {filteredGroups.map((group) => (
          <article className="skill-group" key={group.id}>
            <div className="skill-group-heading">
              <span className="skill-category-icon"><CategoryIcon id={group.id} /></span>
              <div>
                <h3>{group.title}</h3>
                <p>{group.items.length} {group.items.length === 1 ? "technology" : "technologies"}</p>
              </div>
              <span className="skill-group-arrow" aria-hidden="true">↗</span>
            </div>
            <ul className="skill-items">
              {group.items.map((item) => (
                <li className="skill-chip" key={item}>
                  <TechnologyIcon name={item} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}
