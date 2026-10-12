import Image from "next/image";
import type { Project } from "@/types/portfolio";
import { safeHttpUrl, safeLocalAsset } from "@/lib/portfolio-utils";

export function ProjectCard({ project }: { project: Project }) {
  const liveUrl = safeHttpUrl(project.liveUrl);
  const sourceUrl = safeHttpUrl(project.sourceUrl);
  const image = safeLocalAsset(project.image, "/images/project-preview.svg");

  return (
    <article className="project-card">
      <div className="project-image-wrap">
        <Image
          src={image}
          alt={`${project.title} ${project.demo ? "concept" : "project"} illustration`}
          width={960}
          height={600}
          className="project-image"
        />
        <span className="preview-label">{project.demo ? "Demo concept" : "Project illustration"}</span>
      </div>
      <div className="project-card-body">
        <div className="project-heading-row">
          <h3>{project.title}</h3>
          {project.category && <span className="project-category">{project.category}</span>}
        </div>
        <p>{project.description}</p>
        {project.contribution?.trim() && <p className="project-contribution">{project.contribution}</p>}
        {project.technologies.length > 0 && (
          <>
            <span className="stack-label">{project.demo ? "Suggested stack" : "Technology stack"}</span>
            <ul className="tag-list" aria-label={`${project.title} technologies`}>
              {project.technologies.map((technology) => <li key={technology}>{technology}</li>)}
            </ul>
          </>
        )}
        {(liveUrl || sourceUrl) && (
          <div className="project-actions">
            {liveUrl && <a href={liveUrl} target="_blank" rel="noopener noreferrer">Live preview <span aria-hidden="true">↗</span></a>}
            {sourceUrl && <a href={sourceUrl} target="_blank" rel="noopener noreferrer">Source code <span aria-hidden="true">↗</span></a>}
          </div>
        )}
      </div>
    </article>
  );
}
