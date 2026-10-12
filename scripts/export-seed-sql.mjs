import { readFile, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);

async function readJson(fileName) {
  return JSON.parse(await readFile(new URL(`../src/data/${fileName}.json`, import.meta.url), "utf8"));
}

function valueToSql(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  if (typeof value === "number") return String(value);
  return `'${String(value).replaceAll("'", "''")}'`;
}

function insert(table, columns, rows) {
  if (rows.length === 0) return `-- No sample rows for ${table}.`;
  const columnList = columns.map((column) => `"${column}"`).join(", ");
  const values = rows.map((row) => `  (${columns.map((column) => valueToSql(row[column])).join(", ")})`).join(",\n");
  return `INSERT INTO "${table}" (${columnList})\nVALUES\n${values}\nON CONFLICT DO NOTHING;`;
}

async function main() {
  const [profile, projects, skills, education, achievements] = await Promise.all([
    readJson("profile"),
    readJson("projects"),
    readJson("skills"),
    readJson("education"),
    readJson("achievements"),
  ]);

  const profileId = 1;
  const statements = [
    insert("portfolio_profile", [
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
    insert("profile_languages", ["profile_id", "sort_order", "name", "proficiency"],
      profile.languages.map((language, sortOrder) => ({ profile_id: profileId, sort_order: sortOrder, ...language }))),
    insert("profile_interests", ["profile_id", "sort_order", "interest"],
      profile.about.interests.map((interest, sortOrder) => ({ profile_id: profileId, sort_order: sortOrder, interest }))),
    insert("social_links", ["id", "profile_id", "label", "url", "visible", "sort_order"],
      profile.socialLinks.map((link, sortOrder) => ({
        id: link.id,
        profile_id: profileId,
        label: link.label,
        url: link.url,
        visible: link.visible !== false,
        sort_order: sortOrder,
      }))),
    insert("portfolio_projects", [
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
    insert("project_technologies", ["project_id", "sort_order", "technology"],
      projects.flatMap((project) => project.technologies.map((technology, sortOrder) => ({
        project_id: project.id,
        sort_order: sortOrder,
        technology,
      })))),
    insert("skill_groups", ["id", "title", "sort_order"],
      skills.map((group, sortOrder) => ({ id: group.id, title: group.title, sort_order: sortOrder }))),
    insert("skill_items", ["group_id", "sort_order", "item"],
      skills.flatMap((group) => group.items.map((item, sortOrder) => ({ group_id: group.id, sort_order: sortOrder, item })))),
    insert("education_entries", ["id", "institution", "qualification", "status", "dates", "description", "sort_order"],
      education.map((entry, sortOrder) => ({
        id: entry.id,
        institution: entry.institution,
        qualification: entry.qualification,
        status: entry.status,
        dates: entry.dates ?? null,
        description: entry.description ?? null,
        sort_order: sortOrder,
      }))),
    insert("achievements", ["id", "title", "value", "description", "url", "sort_order"],
      achievements.map((entry, sortOrder) => ({
        id: entry.id,
        title: entry.title,
        value: entry.value ?? null,
        description: entry.description ?? null,
        url: entry.url ?? null,
        sort_order: sortOrder,
      }))),
  ];

  const tables = [
    "portfolio_profile", "profile_languages", "profile_interests", "social_links", "portfolio_projects",
    "project_technologies", "skill_groups", "skill_items", "education_entries", "achievements",
  ];
  const counts = tables.map((table) => `SELECT '${table}' AS table_name, count(*)::int AS row_count FROM "${table}"`).join("\nUNION ALL\n");
  const output = [
    "-- Portfolio sample data from src/data/*.json.",
    "-- Run after applying the Drizzle migrations. Existing rows are preserved.",
    "BEGIN;",
    ...statements,
    "COMMIT;",
    "",
    "-- Row counts after seeding.",
    `SELECT * FROM (\n${counts}\n) AS seed_counts ORDER BY table_name;`,
  ].join("\n\n") + "\n";

  await writeFile(new URL("../drizzle/seed.sql", import.meta.url), output, "utf8");
  console.log("Generated drizzle/seed.sql from src/data/*.json.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
