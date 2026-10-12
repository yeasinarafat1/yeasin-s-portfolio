import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  foreignKey,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const portfolioProfile = pgTable("portfolio_profile", {
  id: integer("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  greeting: text("greeting").notNull(),
  role: text("role").notNull(),
  tagline: text("tagline").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  email: varchar("email", { length: 254 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  resumeUrl: text("resume_url").notNull(),
  illustration: text("illustration").notNull(),
  aboutBody: text("about_body").notNull(),
  aboutSeeking: text("about_seeking").notNull(),
  contactMessage: text("contact_message").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
}, (table) => [
  check("portfolio_profile_singleton_id_check", sql`${table.id} = 1`),
]);

export const profileLanguages = pgTable("profile_languages", {
  profileId: integer("profile_id").notNull(),
  sortOrder: integer("sort_order").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  proficiency: varchar("proficiency", { length: 200 }).notNull(),
}, (table) => [
  primaryKey({ columns: [table.profileId, table.sortOrder], name: "profile_languages_pk" }),
  foreignKey({ columns: [table.profileId], foreignColumns: [portfolioProfile.id], name: "profile_languages_profile_id_fk" }).onDelete("cascade"),
]);

export const profileInterests = pgTable("profile_interests", {
  profileId: integer("profile_id").notNull(),
  sortOrder: integer("sort_order").notNull(),
  interest: text("interest").notNull(),
}, (table) => [
  primaryKey({ columns: [table.profileId, table.sortOrder], name: "profile_interests_pk" }),
  foreignKey({ columns: [table.profileId], foreignColumns: [portfolioProfile.id], name: "profile_interests_profile_id_fk" }).onDelete("cascade"),
]);

export const socialLinks = pgTable("social_links", {
  id: varchar("id", { length: 80 }).primaryKey(),
  profileId: integer("profile_id").notNull(),
  label: varchar("label", { length: 120 }).notNull(),
  url: text("url").notNull(),
  visible: boolean("visible").notNull().default(true),
  sortOrder: integer("sort_order").notNull(),
}, (table) => [
  foreignKey({ columns: [table.profileId], foreignColumns: [portfolioProfile.id], name: "social_links_profile_id_fk" }).onDelete("cascade"),
]);

export const portfolioProjects = pgTable("portfolio_projects", {
  id: varchar("id", { length: 100 }).primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  category: varchar("category", { length: 200 }).notNull(),
  demo: boolean("demo"),
  description: text("description").notNull(),
  contribution: text("contribution"),
  image: text("image").notNull(),
  liveUrl: text("live_url").notNull(),
  sourceUrl: text("source_url").notNull(),
  featured: boolean("featured").notNull().default(false),
  sortOrder: integer("sort_order").notNull(),
});

export const projectTechnologies = pgTable("project_technologies", {
  projectId: varchar("project_id", { length: 100 }).notNull(),
  sortOrder: integer("sort_order").notNull(),
  technology: varchar("technology", { length: 200 }).notNull(),
}, (table) => [
  primaryKey({ columns: [table.projectId, table.sortOrder], name: "project_technologies_pk" }),
  foreignKey({ columns: [table.projectId], foreignColumns: [portfolioProjects.id], name: "project_technologies_project_id_fk" }).onDelete("cascade"),
]);

export const skillGroups = pgTable("skill_groups", {
  id: varchar("id", { length: 100 }).primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  sortOrder: integer("sort_order").notNull(),
});

export const skillItems = pgTable("skill_items", {
  groupId: varchar("group_id", { length: 100 }).notNull(),
  sortOrder: integer("sort_order").notNull(),
  item: varchar("item", { length: 200 }).notNull(),
}, (table) => [
  primaryKey({ columns: [table.groupId, table.sortOrder], name: "skill_items_pk" }),
  foreignKey({ columns: [table.groupId], foreignColumns: [skillGroups.id], name: "skill_items_group_id_fk" }).onDelete("cascade"),
]);

export const educationEntries = pgTable("education_entries", {
  id: varchar("id", { length: 100 }).primaryKey(),
  institution: varchar("institution", { length: 300 }).notNull(),
  qualification: text("qualification").notNull(),
  status: text("status").notNull(),
  dates: text("dates"),
  description: text("description"),
  sortOrder: integer("sort_order").notNull(),
});

export const achievements = pgTable("achievements", {
  id: varchar("id", { length: 100 }).primaryKey(),
  title: varchar("title", { length: 300 }).notNull(),
  value: text("value"),
  description: text("description"),
  url: text("url"),
  sortOrder: integer("sort_order").notNull(),
});

export const contactMessages = pgTable("contact_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 254 }).notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  readAt: timestamp("read_at", { withTimezone: true, mode: "date" }),
}, (table) => [
  index("contact_messages_created_at_idx").on(table.createdAt),
]);

export const contactRateLimits = pgTable("contact_rate_limits", {
  clientKey: varchar("client_key", { length: 64 }).primaryKey(),
  windowStartedAt: timestamp("window_started_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  submissionCount: integer("submission_count").notNull().default(1),
});
