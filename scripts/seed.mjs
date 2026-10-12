import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";
import { config as loadEnv } from "dotenv";

const projectRoot = new URL("../", import.meta.url);
loadEnv({ path: fileURLToPath(new URL(".env.local", projectRoot)) });
loadEnv({ path: fileURLToPath(new URL(".env", projectRoot)) });

function getNeonConnectionString() {
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) {
    throw new Error("DATABASE_URL is missing. Add the Neon PostgreSQL connection URL to .env.local.");
  }

  let url;
  try {
    url = new URL(connectionString);
  } catch {
    throw new Error("DATABASE_URL must contain only a PostgreSQL URL, without a psql command or shell quotes.");
  }

  if (!["postgres:", "postgresql:"].includes(url.protocol)) {
    throw new Error("DATABASE_URL must use the postgres:// or postgresql:// protocol.");
  }
  if (!url.hostname.endsWith(".neon.tech")) {
    throw new Error("The seed command is restricted to a Neon PostgreSQL host.");
  }

  return connectionString;
}

async function readJson(fileName) {
  const path = new URL(`src/data/${fileName}.json`, projectRoot);
  return JSON.parse(await readFile(path, "utf8"));
}

function makeInsert(sql, table, columns, rows) {
  if (rows.length === 0) return null;

  const placeholders = rows.map((_, rowIndex) => {
    const start = rowIndex * columns.length + 1;
    return `(${columns.map((__, columnIndex) => `$${start + columnIndex}`).join(", ")})`;
  });
  const columnList = columns.map((column) => `"${column}"`).join(", ");
  const query = `INSERT INTO "${table}" (${columnList}) VALUES ${placeholders.join(", ")} ON CONFLICT DO NOTHING`;
  const params = rows.flatMap((row) => columns.map((column) => row[column]));

  return sql.query(query, params);
}

async function main() {
  const [profile, projects, skills, education, achievements] = await Promise.all([
    readJson("profile"),
    readJson("projects"),
    readJson("skills"),
    readJson("education"),
    readJson("achievements"),
  ]);

  const sql = neon(getNeonConnectionString());
  const profileId = 1;
  const inserts = [
    makeInsert(sql, "portfolio_profile", [
      "id", "name", "greeting", "role", "tagline", "description", "location", "email", "phone",
      "resume_url", "illustration", "about_body", "about_seeking", "contact_message",
    ], [{
      id: profileId,
      name: profile.name,
      greeting: profile.greeting,
      role: profile.role,
      tagline: profile.tagline,
      description: profile.description,
      location: profile.location,
      email: profile.email,
      phone: profile.phone,
      resume_url: profile.resumeUrl,
      illustration: profile.illustration,
      about_body: profile.about.body,
      about_seeking: profile.about.seeking,
      contact_message: profile.contactMessage,
    }]),
    makeInsert(sql, "profile_languages", ["profile_id", "sort_order", "name", "proficiency"],
      profile.languages.map((language, sortOrder) => ({ profile_id: profileId, sort_order: sortOrder, ...language }))),
    makeInsert(sql, "profile_interests", ["profile_id", "sort_order", "interest"],
      profile.about.interests.map((interest, sortOrder) => ({ profile_id: profileId, sort_order: sortOrder, interest }))),
    makeInsert(sql, "social_links", ["id", "profile_id", "label", "url", "visible", "sort_order"],
      profile.socialLinks.map((link, sortOrder) => ({
        id: link.id,
        profile_id: profileId,
        label: link.label,
        url: link.url,
        visible: link.visible !== false,
        sort_order: sortOrder,
      }))),
    makeInsert(sql, "portfolio_projects", [
      "id", "title", "category", "demo", "description", "contribution", "image", "live_url", "source_url", "featured", "sort_order",
    ], projects.map((project, sortOrder) => ({
      id: project.id,
      title: project.title,
      category: project.category,
      demo: project.demo ?? null,
      description: project.description,
      contribution: project.contribution ?? null,
      image: project.image,
      live_url: project.liveUrl,
      source_url: project.sourceUrl,
      featured: project.featured,
      sort_order: sortOrder,
    }))),
    makeInsert(sql, "project_technologies", ["project_id", "sort_order", "technology"],
      projects.flatMap((project) => project.technologies.map((technology, sortOrder) => ({
        project_id: project.id,
        sort_order: sortOrder,
        technology,
      })))),
    makeInsert(sql, "skill_groups", ["id", "title", "sort_order"],
      skills.map((group, sortOrder) => ({ id: group.id, title: group.title, sort_order: sortOrder }))),
    makeInsert(sql, "skill_items", ["group_id", "sort_order", "item"],
      skills.flatMap((group) => group.items.map((item, sortOrder) => ({ group_id: group.id, sort_order: sortOrder, item })))),
    makeInsert(sql, "education_entries", ["id", "institution", "qualification", "status", "dates", "description", "sort_order"],
      education.map((entry, sortOrder) => ({
        id: entry.id,
        institution: entry.institution,
        qualification: entry.qualification,
        status: entry.status,
        dates: entry.dates ?? null,
        description: entry.description ?? null,
        sort_order: sortOrder,
      }))),
    makeInsert(sql, "achievements", ["id", "title", "value", "description", "url", "sort_order"],
      achievements.map((entry, sortOrder) => ({
        id: entry.id,
        title: entry.title,
        value: entry.value ?? null,
        description: entry.description ?? null,
        url: entry.url ?? null,
        sort_order: sortOrder,
      }))),
  ].filter(Boolean);

  try {
    await sql.transaction(inserts);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message.replace(/postgres(?:ql)?:\/\/[^\s"'`]+/gi, "[database URL redacted]"));
    process.exitCode = 1;
    return;
  }

  const tableNames = [
    "portfolio_profile", "profile_languages", "profile_interests", "social_links", "portfolio_projects",
    "project_technologies", "skill_groups", "skill_items", "education_entries", "achievements",
  ];
  const countQueries = tableNames.map((table) => sql.query(`SELECT count(*)::int AS count FROM "${table}"`));
  const counts = await sql.transaction(countQueries);

  console.log("Seed complete. Existing rows were preserved; counts now present in Neon:");
  tableNames.forEach((table, index) => console.log(`  ${table}: ${counts[index][0].count}`));
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message.replace(/postgres(?:ql)?:\/\/[^\s"'`]+/gi, "[database URL redacted]"));
  process.exitCode = 1;
});
