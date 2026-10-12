import "server-only";

import { createHmac } from "node:crypto";
import { and, asc, desc, eq, lt, sql } from "drizzle-orm";
import achievementsSeed from "@/data/achievements.json";
import educationSeed from "@/data/education.json";
import profileSeed from "@/data/profile.json";
import projectsSeed from "@/data/projects.json";
import skillsSeed from "@/data/skills.json";
import { getDb } from "@/db";
import {
  achievements,
  contactMessages,
  contactRateLimits,
  educationEntries,
  portfolioProfile,
  portfolioProjects,
  profileInterests,
  profileLanguages,
  projectTechnologies,
  skillGroups,
  skillItems,
  socialLinks,
} from "@/db/schema";
import type { Achievement, ContactMessage, EducationEntry, Profile, Project, SkillGroup } from "@/types/portfolio";
import type { ValidPortfolioContent } from "./portfolio-validation";

export interface PortfolioContent {
  profile: Profile;
  projects: Project[];
  skills: SkillGroup[];
  education: EducationEntry[];
  achievements: Achievement[];
}

const seedContent: PortfolioContent = {
  profile: profileSeed as Profile,
  projects: projectsSeed as Project[],
  skills: skillsSeed as SkillGroup[],
  education: educationSeed as EducationEntry[],
  achievements: achievementsSeed as Achievement[],
};

export function getDatabaseMode() {
  return "Neon PostgreSQL";
}

function profileValues(profile: Profile) {
  return {
    id: 1,
    name: profile.name,
    greeting: profile.greeting,
    role: profile.role,
    tagline: profile.tagline,
    description: profile.description,
    location: profile.location,
    email: profile.email,
    phone: profile.phone,
    resumeUrl: profile.resumeUrl,
    illustration: profile.illustration,
    aboutBody: profile.about.body,
    aboutSeeking: profile.about.seeking,
    contactMessage: profile.contactMessage,
  };
}

function seedQueries(db: ReturnType<typeof getDb>) {
  const seedProfile = seedContent.profile;
  const projectRows = seedContent.projects.map((project, sortOrder) => ({
    id: project.id,
    title: project.title,
    category: project.category,
    demo: project.demo ?? null,
    description: project.description,
    contribution: project.contribution ?? null,
    image: project.image,
    liveUrl: project.liveUrl,
    sourceUrl: project.sourceUrl,
    featured: project.featured,
    sortOrder,
  }));
  const projectTechnologyRows = seedContent.projects.flatMap((project) => project.technologies.map((technology, sortOrder) => ({
    projectId: project.id,
    sortOrder,
    technology,
  })));
  const skillGroupRows = seedContent.skills.map((group, sortOrder) => ({ id: group.id, title: group.title, sortOrder }));
  const skillItemRows = seedContent.skills.flatMap((group) => group.items.map((item, sortOrder) => ({ groupId: group.id, sortOrder, item })));

  return [
    db.insert(portfolioProfile).values(profileValues(seedProfile)).onConflictDoNothing({ target: portfolioProfile.id }),
    ...(seedProfile.languages.length ? [db.insert(profileLanguages).values(seedProfile.languages.map((language, sortOrder) => ({ profileId: 1, sortOrder, ...language }))).onConflictDoNothing()] : []),
    ...(seedProfile.about.interests.length ? [db.insert(profileInterests).values(seedProfile.about.interests.map((interest, sortOrder) => ({ profileId: 1, sortOrder, interest }))).onConflictDoNothing()] : []),
    ...(seedProfile.socialLinks.length ? [db.insert(socialLinks).values(seedProfile.socialLinks.map((link, sortOrder) => ({ ...link, profileId: 1, visible: link.visible !== false, sortOrder }))).onConflictDoNothing()] : []),
    ...(projectRows.length ? [db.insert(portfolioProjects).values(projectRows).onConflictDoNothing()] : []),
    ...(projectTechnologyRows.length ? [db.insert(projectTechnologies).values(projectTechnologyRows).onConflictDoNothing()] : []),
    ...(skillGroupRows.length ? [db.insert(skillGroups).values(skillGroupRows).onConflictDoNothing()] : []),
    ...(skillItemRows.length ? [db.insert(skillItems).values(skillItemRows).onConflictDoNothing()] : []),
    ...(seedContent.education.length ? [db.insert(educationEntries).values(seedContent.education.map((entry, sortOrder) => ({ ...entry, dates: entry.dates ?? null, description: entry.description ?? null, sortOrder }))).onConflictDoNothing()] : []),
    ...(seedContent.achievements.length ? [db.insert(achievements).values(seedContent.achievements.map((entry, sortOrder) => ({ ...entry, value: entry.value ?? null, description: entry.description ?? null, url: entry.url ?? null, sortOrder }))).onConflictDoNothing()] : []),
  ];
}

async function ensureSeedContent() {
  const db = getDb();
  const [profile] = await db.select({ id: portfolioProfile.id }).from(portfolioProfile).where(eq(portfolioProfile.id, 1)).limit(1);
  if (profile) return;

  // The batch runs as one Neon HTTP transaction, so another first request cannot leave a partial seed.
  const queries = seedQueries(db);
  await db.batch(queries as [typeof queries[number], ...typeof queries[number][]]);
}

export async function getPortfolioContent(): Promise<PortfolioContent> {
  const db = getDb();
  await ensureSeedContent();
  const [profiles, languages, interests, links, projectRows, technologyRows, groupRows, itemRows, educationRows, achievementRows] = await db.batch([
    db.select().from(portfolioProfile).where(eq(portfolioProfile.id, 1)).limit(1),
    db.select().from(profileLanguages).orderBy(asc(profileLanguages.sortOrder)),
    db.select().from(profileInterests).orderBy(asc(profileInterests.sortOrder)),
    db.select().from(socialLinks).orderBy(asc(socialLinks.sortOrder)),
    db.select().from(portfolioProjects).orderBy(asc(portfolioProjects.sortOrder)),
    db.select().from(projectTechnologies).orderBy(asc(projectTechnologies.sortOrder)),
    db.select().from(skillGroups).orderBy(asc(skillGroups.sortOrder)),
    db.select().from(skillItems).orderBy(asc(skillItems.sortOrder)),
    db.select().from(educationEntries).orderBy(asc(educationEntries.sortOrder)),
    db.select().from(achievements).orderBy(asc(achievements.sortOrder)),
  ]);

  const [storedProfile] = profiles;
  if (!storedProfile) throw new Error("Portfolio profile could not be initialized.");

  const technologiesByProject = new Map<string, string[]>();
  for (const row of technologyRows) {
    const values = technologiesByProject.get(row.projectId) ?? [];
    values.push(row.technology);
    technologiesByProject.set(row.projectId, values);
  }

  const itemsByGroup = new Map<string, string[]>();
  for (const row of itemRows) {
    const values = itemsByGroup.get(row.groupId) ?? [];
    values.push(row.item);
    itemsByGroup.set(row.groupId, values);
  }

  return {
    profile: {
      name: storedProfile.name,
      greeting: storedProfile.greeting,
      role: storedProfile.role,
      tagline: storedProfile.tagline,
      description: storedProfile.description,
      location: storedProfile.location,
      email: storedProfile.email,
      phone: storedProfile.phone,
      resumeUrl: storedProfile.resumeUrl,
      illustration: storedProfile.illustration,
      languages: languages.map(({ name, proficiency }) => ({ name, proficiency })),
      about: {
        body: storedProfile.aboutBody,
        interests: interests.map((row) => row.interest),
        seeking: storedProfile.aboutSeeking,
      },
      contactMessage: storedProfile.contactMessage,
      socialLinks: links.map(({ id, label, url, visible }) => ({ id, label, url, visible })),
    },
    projects: projectRows.map((row) => ({
      id: row.id,
      title: row.title,
      category: row.category,
      ...(row.demo === null ? {} : { demo: row.demo }),
      description: row.description,
      ...(row.contribution === null ? {} : { contribution: row.contribution }),
      technologies: technologiesByProject.get(row.id) ?? [],
      image: row.image,
      liveUrl: row.liveUrl,
      sourceUrl: row.sourceUrl,
      featured: row.featured,
    })),
    skills: groupRows.map((row) => ({ id: row.id, title: row.title, items: itemsByGroup.get(row.id) ?? [] })),
    education: educationRows.map((row) => ({
      id: row.id,
      institution: row.institution,
      qualification: row.qualification,
      status: row.status,
      ...(row.dates === null ? {} : { dates: row.dates }),
      ...(row.description === null ? {} : { description: row.description }),
    })),
    achievements: achievementRows.map((row) => ({
      id: row.id,
      title: row.title,
      ...(row.value === null ? {} : { value: row.value }),
      ...(row.description === null ? {} : { description: row.description }),
      ...(row.url === null ? {} : { url: row.url }),
    })),
  };
}

export async function savePortfolioContent(content: ValidPortfolioContent) {
  const db = getDb();
  const projectRows = content.projects.map((project, sortOrder) => ({
    id: project.id,
    title: project.title,
    category: project.category,
    demo: project.demo ?? null,
    description: project.description,
    contribution: project.contribution ?? null,
    image: project.image,
    liveUrl: project.liveUrl,
    sourceUrl: project.sourceUrl,
    featured: project.featured,
    sortOrder,
  }));
  const projectTechnologyRows = content.projects.flatMap((project) => project.technologies.map((technology, sortOrder) => ({
    projectId: project.id,
    sortOrder,
    technology,
  })));
  const skillGroupRows = content.skills.map((group, sortOrder) => ({ id: group.id, title: group.title, sortOrder }));
  const skillItemRows = content.skills.flatMap((group) => group.items.map((item, sortOrder) => ({ groupId: group.id, sortOrder, item })));

  const queries = [
    db.insert(portfolioProfile).values({ ...profileValues(content.profile), updatedAt: new Date() }).onConflictDoUpdate({
      target: portfolioProfile.id,
      set: { ...profileValues(content.profile), updatedAt: new Date() },
    }),
    db.delete(profileLanguages),
    db.delete(profileInterests),
    db.delete(socialLinks),
    db.delete(portfolioProjects),
    db.delete(skillGroups),
    db.delete(educationEntries),
    db.delete(achievements),
    ...(content.profile.languages.length ? [db.insert(profileLanguages).values(content.profile.languages.map((language, sortOrder) => ({ profileId: 1, sortOrder, ...language })))] : []),
    ...(content.profile.about.interests.length ? [db.insert(profileInterests).values(content.profile.about.interests.map((interest, sortOrder) => ({ profileId: 1, sortOrder, interest })))] : []),
    ...(content.profile.socialLinks.length ? [db.insert(socialLinks).values(content.profile.socialLinks.map((link, sortOrder) => ({ ...link, profileId: 1, visible: link.visible !== false, sortOrder })))] : []),
    ...(projectRows.length ? [db.insert(portfolioProjects).values(projectRows)] : []),
    ...(projectTechnologyRows.length ? [db.insert(projectTechnologies).values(projectTechnologyRows)] : []),
    ...(skillGroupRows.length ? [db.insert(skillGroups).values(skillGroupRows)] : []),
    ...(skillItemRows.length ? [db.insert(skillItems).values(skillItemRows)] : []),
    ...(content.education.length ? [db.insert(educationEntries).values(content.education.map((entry, sortOrder) => ({ ...entry, dates: entry.dates ?? null, description: entry.description ?? null, sortOrder })))] : []),
    ...(content.achievements.length ? [db.insert(achievements).values(content.achievements.map((entry, sortOrder) => ({ ...entry, value: entry.value ?? null, description: entry.description ?? null, url: entry.url ?? null, sortOrder })))] : []),
  ];
  await db.batch(queries as [typeof queries[number], ...typeof queries[number][]]);
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  const rows = await getDb().select().from(contactMessages).orderBy(desc(contactMessages.createdAt)).limit(200);
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    message: row.message,
    createdAt: row.createdAt.toISOString(),
    isRead: row.readAt !== null,
  }));
}

export async function saveContactMessage(input: { id: string; name: string; email: string; message: string; clientAddress: string }) {
  const rateLimitSecret = process.env.CONTACT_RATE_LIMIT_SECRET || process.env.ADMIN_SESSION_SECRET || process.env.DATABASE_URL;
  if (!rateLimitSecret) throw new Error("DATABASE_URL is required to secure contact rate limiting.");
  const clientKey = createHmac("sha256", rateLimitSecret).update(input.clientAddress).digest("hex");
  const db = getDb();
  const [rate] = await db.insert(contactRateLimits).values({ clientKey, windowStartedAt: new Date(), submissionCount: 1 }).onConflictDoUpdate({
    target: contactRateLimits.clientKey,
    set: {
      submissionCount: sql`case when ${contactRateLimits.windowStartedAt} <= now() - interval '1 hour' then 1 else ${contactRateLimits.submissionCount} + 1 end`,
      windowStartedAt: sql`case when ${contactRateLimits.windowStartedAt} <= now() - interval '1 hour' then now() else ${contactRateLimits.windowStartedAt} end`,
    },
  }).returning({ submissionCount: contactRateLimits.submissionCount });

  if (!rate || rate.submissionCount > 5) return false;

  await db.insert(contactMessages).values({
    id: input.id,
    name: input.name,
    email: input.email,
    message: input.message,
  });
  await db.delete(contactRateLimits).where(and(
    lt(contactRateLimits.windowStartedAt, sql`now() - interval '2 days'`),
    sql`${contactRateLimits.clientKey} <> ${clientKey}`,
  ));
  return true;
}

export async function setContactMessageRead(id: string, isRead: boolean) {
  await getDb().update(contactMessages).set({ readAt: isRead ? new Date() : null }).where(eq(contactMessages.id, id));
}

export async function deleteContactMessage(id: string) {
  await getDb().delete(contactMessages).where(eq(contactMessages.id, id));
}
