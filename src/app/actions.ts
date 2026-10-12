"use server";

import { randomUUID } from "node:crypto";
import { headers, cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ADMIN_COOKIE, adminAuthConfigured, createAdminSession, verifyAdminPassword, verifyAdminSession } from "@/lib/admin-auth";
import { deleteContactMessage, saveContactMessage, savePortfolioContent, setContactMessageRead } from "@/lib/portfolio-db";
import { portfolioContentSchema } from "@/lib/portfolio-validation";

const messageIdSchema = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function isAdmin() {
  const cookieStore = await cookies();
  return verifyAdminSession(cookieStore.get(ADMIN_COOKIE)?.value);
}

export async function submitContactMessage(formData: FormData): Promise<{ ok: true } | { ok: false; error: string }> {
  const nameValue = formData.get("name");
  const emailValue = formData.get("email");
  const messageValue = formData.get("message");
  const websiteValue = formData.get("website");

  // Hidden honeypot: respond as if successful without persisting bot submissions.
  if (typeof websiteValue === "string" && websiteValue.trim()) return { ok: true };

  const name = typeof nameValue === "string" ? nameValue.trim() : "";
  const email = typeof emailValue === "string" ? emailValue.trim().toLowerCase() : "";
  const message = typeof messageValue === "string" ? messageValue.trim() : "";
  if (name.length < 1 || name.length > 100) return { ok: false, error: "Enter a name between 1 and 100 characters." };
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return { ok: false, error: "Enter a valid email address." };
  if (message.length < 5 || message.length > 5_000) return { ok: false, error: "Your message must be between 5 and 5,000 characters." };

  try {
    const requestHeaders = await headers();
    const forwardedFor = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();
    const clientAddress = requestHeaders.get("x-real-ip")?.trim() || forwardedFor || "local";
    const id = randomUUID();
    const saved = await saveContactMessage({ id, name, email, message, clientAddress });
    if (!saved) return { ok: false, error: "Please wait before sending another message." };
    return { ok: true };
  } catch (error) {
    console.error("Failed to save contact message", error);
    return { ok: false, error: "Your message could not be saved right now. Please try again later." };
  }
}

export async function loginAdmin(password: unknown): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!adminAuthConfigured()) {
    return { ok: false, error: "Admin sign-in is not configured. Set ADMIN_PASSWORD and ADMIN_SESSION_SECRET." };
  }
  if (!verifyAdminPassword(password)) return { ok: false, error: "That password did not match." };

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, createAdminSession(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
  return { ok: true };
}

export async function logoutAdmin(): Promise<{ ok: true }> {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return { ok: true };
}

export async function savePortfolioContentAction(content: unknown): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!(await isAdmin())) return { ok: false, error: "Please sign in again to save changes." };
  const parsed = portfolioContentSchema.safeParse(content);
  if (!parsed.success) {
    return { ok: false, error: "Some portfolio content has an invalid format. Review your edits and try again." };
  }

  try {
    await savePortfolioContent(parsed.data);
    revalidatePath("/");
    revalidatePath("/admin");
    return { ok: true };
  } catch (error) {
    console.error("Failed to save portfolio content", error);
    return { ok: false, error: "The database could not save your changes. Check DATABASE_URL and try again." };
  }
}

export async function setMessageReadAction(id: unknown, isRead: unknown): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!(await isAdmin())) return { ok: false, error: "Please sign in again." };
  if (typeof id !== "string" || !messageIdSchema.test(id) || typeof isRead !== "boolean") {
    return { ok: false, error: "Invalid message status." };
  }

  try {
    await setContactMessageRead(id, isRead);
    revalidatePath("/admin");
    return { ok: true };
  } catch (error) {
    console.error("Failed to update contact message", error);
    return { ok: false, error: "Could not update this message." };
  }
}

export async function deleteMessageAction(id: unknown): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!(await isAdmin())) return { ok: false, error: "Please sign in again." };
  if (typeof id !== "string" || !messageIdSchema.test(id)) return { ok: false, error: "Invalid message id." };

  try {
    await deleteContactMessage(id);
    revalidatePath("/admin");
    return { ok: true };
  } catch (error) {
    console.error("Failed to delete contact message", error);
    return { ok: false, error: "Could not delete this message." };
  }
}
