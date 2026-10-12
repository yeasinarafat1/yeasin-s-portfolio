export interface SocialLink {
  id: string;
  label: string;
  url: string;
  visible?: boolean;
}

export interface Profile {
  name: string;
  greeting: string;
  role: string;
  tagline: string;
  description: string;
  location: string;
  email: string;
  phone: string;
  resumeUrl: string;
  illustration: string;
  languages: { name: string; proficiency: string }[];
  about: {
    body: string;
    interests: string[];
    seeking: string;
  };
  contactMessage: string;
  socialLinks: SocialLink[];
}

export interface Project {
  id: string;
  title: string;
  category: string;
  demo?: boolean;
  description: string;
  contribution?: string;
  technologies: string[];
  image: string;
  liveUrl: string;
  sourceUrl: string;
  featured: boolean;
}

export interface SkillGroup {
  id: string;
  title: string;
  items: string[];
}

export interface EducationEntry {
  id: string;
  institution: string;
  qualification: string;
  status: string;
  dates?: string;
  description?: string;
}

export interface Achievement {
  id: string;
  title: string;
  value?: string;
  description?: string;
  url?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}
