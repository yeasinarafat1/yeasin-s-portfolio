import { z } from "zod";

const string = z.string().max(10_000);

const profileSchema = z.object({
  name: z.string().min(1).max(120),
  greeting: string,
  role: string,
  tagline: string,
  description: string,
  location: string,
  email: z.string().max(254),
  phone: z.string().max(50),
  resumeUrl: z.string().max(2_000),
  illustration: z.string().max(2_000),
  languages: z.array(z.object({ name: z.string().max(200), proficiency: z.string().max(200) }).strict()).max(50),
  about: z.object({
    body: string,
    interests: z.array(string).max(100),
    seeking: string,
  }).strict(),
  contactMessage: string,
  socialLinks: z.array(z.object({
    id: z.string().min(1).max(80),
    label: z.string().min(1).max(120),
    url: z.string().max(2_000),
    visible: z.boolean().optional(),
  }).strict()).max(100),
}).strict();

const projectSchema = z.object({
  id: z.string().min(1).max(100),
  title: z.string().min(1).max(200),
  category: z.string().max(200),
  demo: z.boolean().optional(),
  description: string,
  contribution: string.optional(),
  technologies: z.array(z.string().max(200)).max(100),
  image: z.string().max(2_000),
  liveUrl: z.string().max(2_000),
  sourceUrl: z.string().max(2_000),
  featured: z.boolean(),
}).strict();

const skillGroupSchema = z.object({
  id: z.string().min(1).max(100),
  title: z.string().min(1).max(200),
  items: z.array(z.string().max(200)).max(200),
}).strict();

const educationSchema = z.object({
  id: z.string().min(1).max(100),
  institution: z.string().min(1).max(300),
  qualification: string,
  status: string,
  dates: string.optional(),
  description: string.optional(),
}).strict();

const achievementSchema = z.object({
  id: z.string().min(1).max(100),
  title: z.string().min(1).max(300),
  value: string.optional(),
  description: string.optional(),
  url: z.string().max(2_000).optional(),
}).strict();

export const portfolioContentSchema = z.object({
  profile: profileSchema,
  projects: z.array(projectSchema).max(500),
  skills: z.array(skillGroupSchema).max(100),
  education: z.array(educationSchema).max(200),
  achievements: z.array(achievementSchema).max(500),
}).strict();

export type ValidPortfolioContent = z.infer<typeof portfolioContentSchema>;
