-- Portfolio sample data from src/data/*.json.

-- Run after applying the Drizzle migrations. Existing rows are preserved.

BEGIN;

INSERT INTO "portfolio_profile" ("id", "name", "greeting", "role", "tagline", "description", "location", "email", "phone", "resume_url", "illustration", "about_body", "about_seeking", "contact_message")
VALUES
  (1, 'Yeasin Arafat', 'Hello, I''m', 'Computer Science Student & Full-Stack Developer', 'Building useful products with thoughtful engineering.', 'I build full-stack web applications with Next.js, PostgreSQL, and Drizzle ORM, and enjoy solving algorithmic problems with clean, maintainable code.', 'Cumilla, Bangladesh', 'developer.yeasinarafat@gmail.com', '01572938175', '/Yeasin-Arafat-CV.pdf', '/images/developer.svg', 'I''m a Computer Science & Engineering student at Cumilla Polytechnic Institute, currently in my 7th semester, and a full-stack developer focused on building useful, well-structured web applications.', 'I''m seeking an internship where I can apply strong engineering practices and contribute to real-world software projects.', 'I''m currently seeking an internship and would be glad to connect about software development opportunities, projects, or collaboration.')
ON CONFLICT DO NOTHING;

INSERT INTO "profile_languages" ("profile_id", "sort_order", "name", "proficiency")
VALUES
  (1, 0, 'Bengali', 'Native'),
  (1, 1, 'English', 'Professional Working Proficiency')
ON CONFLICT DO NOTHING;

INSERT INTO "profile_interests" ("profile_id", "sort_order", "interest")
VALUES
  (1, 0, 'Full-stack development'),
  (1, 1, 'Algorithmic problem-solving'),
  (1, 2, 'Database design'),
  (1, 3, 'Clean architecture')
ON CONFLICT DO NOTHING;

INSERT INTO "social_links" ("id", "profile_id", "label", "url", "visible", "sort_order")
VALUES
  ('linkedin', 1, 'LinkedIn', 'https://www.linkedin.com/in/yeasinarafat27/', TRUE, 0),
  ('github', 1, 'GitHub', 'https://github.com/yeasinarafat1', TRUE, 1),
  ('codeforces', 1, 'Codeforces', 'https://codeforces.com/profile/yeasin321', TRUE, 2)
ON CONFLICT DO NOTHING;

INSERT INTO "portfolio_projects" ("id", "title", "category", "demo", "description", "contribution", "image", "live_url", "source_url", "featured", "sort_order")
VALUES
  ('bookbazar', 'BookBazar', 'Student marketplace', NULL, 'A full-stack second-hand textbook marketplace for polytechnic students, with listings filtered by category, semester, and department.', 'Designed a four-step QR handoff to help prevent transaction fraud, with role-based access, listing moderation, seller dashboards, and digital receipts.', '/images/bookbazar.svg', 'https://book-bazar-phi.vercel.app/', 'https://github.com/yeasinarafat1/BookBazar', TRUE, 0),
  ('codeshare-demo', 'CodeShare', 'Demo concept', TRUE, 'A concept for saving, organizing, and sharing reusable code snippets.', NULL, '/images/codeshare.svg', '', '', TRUE, 1),
  ('contactvault-demo', 'ContactVault', 'Demo concept', TRUE, 'A browser-based concept for keeping personal contacts organized.', NULL, '/images/contactvault.svg', '', '', TRUE, 2),
  ('taskflow-demo', 'TaskFlow', 'Demo concept', TRUE, 'A lightweight kanban board concept for planning tasks across a small project team.', NULL, '/images/project-preview.svg', '', '', TRUE, 3)
ON CONFLICT DO NOTHING;

INSERT INTO "project_technologies" ("project_id", "sort_order", "technology")
VALUES
  ('bookbazar', 0, 'Next.js'),
  ('bookbazar', 1, 'TypeScript'),
  ('bookbazar', 2, 'Neon PostgreSQL'),
  ('bookbazar', 3, 'Drizzle ORM'),
  ('bookbazar', 4, 'Clerk'),
  ('codeshare-demo', 0, 'Next.js'),
  ('codeshare-demo', 1, 'TypeScript'),
  ('codeshare-demo', 2, 'PostgreSQL'),
  ('contactvault-demo', 0, 'JavaScript'),
  ('contactvault-demo', 1, 'IndexedDB'),
  ('contactvault-demo', 2, 'Vite'),
  ('taskflow-demo', 0, 'React.js'),
  ('taskflow-demo', 1, 'TypeScript'),
  ('taskflow-demo', 2, 'Tailwind CSS')
ON CONFLICT DO NOTHING;

INSERT INTO "skill_groups" ("id", "title", "sort_order")
VALUES
  ('frontend', 'Frontend', 0),
  ('backend', 'Backend', 1),
  ('database', 'Databases', 2),
  ('languages', 'Programming Languages', 3),
  ('tools', 'Tools', 4)
ON CONFLICT DO NOTHING;

INSERT INTO "skill_items" ("group_id", "sort_order", "item")
VALUES
  ('frontend', 0, 'React.js'),
  ('frontend', 1, 'Next.js'),
  ('frontend', 2, 'Tailwind CSS'),
  ('backend', 0, 'Node.js'),
  ('backend', 1, 'Express.js'),
  ('backend', 2, 'REST APIs'),
  ('database', 0, 'PostgreSQL'),
  ('database', 1, 'Drizzle ORM'),
  ('languages', 0, 'C++'),
  ('languages', 1, 'TypeScript'),
  ('languages', 2, 'JavaScript'),
  ('languages', 3, 'Python'),
  ('languages', 4, 'SQL'),
  ('languages', 5, 'Java'),
  ('tools', 0, 'Git'),
  ('tools', 1, 'GitHub'),
  ('tools', 2, 'Linux (Ubuntu/Arch)')
ON CONFLICT DO NOTHING;

INSERT INTO "education_entries" ("id", "institution", "qualification", "status", "dates", "description", "sort_order")
VALUES
  ('diploma-cse', 'Cumilla Polytechnic Institute', 'Diploma in Engineering (Computer Science)', '7th Semester', 'Expected completion: December 2026', 'CGPA: 3.52 / 4.00 (expected).', 0)
ON CONFLICT DO NOTHING;

INSERT INTO "achievements" ("id", "title", "value", "description", "url", "sort_order")
VALUES
  ('programming-champion-2026', 'Programming Champion', 'Java contest winner · April 2026', 'Won the programming contest organized by Cumilla Polytechnic Institute.', NULL, 0),
  ('icpc-asia-dhaka-2025', 'ICPC Asia Dhaka Regional', '2025 participant', 'Competed in the regional programming contest, solving problems collaboratively as a team.', NULL, 1),
  ('competitive-programming', 'Competitive Programming', '300+ problems solved', 'Maximum ratings: 1015 on Codeforces and 1418 on CodeChef, with a focus on data structures and time complexity.', 'https://codeforces.com/profile/yeasin321', 2)
ON CONFLICT DO NOTHING;

COMMIT;



-- Row counts after seeding.

SELECT * FROM (
SELECT 'portfolio_profile' AS table_name, count(*)::int AS row_count FROM "portfolio_profile"
UNION ALL
SELECT 'profile_languages' AS table_name, count(*)::int AS row_count FROM "profile_languages"
UNION ALL
SELECT 'profile_interests' AS table_name, count(*)::int AS row_count FROM "profile_interests"
UNION ALL
SELECT 'social_links' AS table_name, count(*)::int AS row_count FROM "social_links"
UNION ALL
SELECT 'portfolio_projects' AS table_name, count(*)::int AS row_count FROM "portfolio_projects"
UNION ALL
SELECT 'project_technologies' AS table_name, count(*)::int AS row_count FROM "project_technologies"
UNION ALL
SELECT 'skill_groups' AS table_name, count(*)::int AS row_count FROM "skill_groups"
UNION ALL
SELECT 'skill_items' AS table_name, count(*)::int AS row_count FROM "skill_items"
UNION ALL
SELECT 'education_entries' AS table_name, count(*)::int AS row_count FROM "education_entries"
UNION ALL
SELECT 'achievements' AS table_name, count(*)::int AS row_count FROM "achievements"
) AS seed_counts ORDER BY table_name;
