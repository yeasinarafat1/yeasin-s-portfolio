import type { SocialLink } from "@/types/portfolio";
import { safeEmail, safeHttpUrl } from "@/lib/portfolio-utils";

interface SocialLinksProps {
  links: SocialLink[];
  email: string;
  placement?: "rail" | "inline";
}

function SocialIcon({ id }: { id: string }) {
  if (id === "github") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.61-3.37-1.18-3.37-1.18-.46-1.16-1.11-1.47-1.11-1.47-.91-.63.07-.62.07-.62 1 .07 1.52 1.02 1.52 1.02.9 1.51 2.35 1.07 2.92.82.09-.65.35-1.08.64-1.33-2.22-.25-4.55-1.11-4.55-4.95 0-1.09.39-1.99 1.02-2.69-.1-.25-.44-1.27.1-2.65 0 0 .83-.27 2.75 1.03A9.6 9.6 0 0 1 12 6.9c.85 0 1.7.11 2.5.34 1.92-1.3 2.74-1.03 2.74-1.03.55 1.38.21 2.4.11 2.65.64.7 1.02 1.6 1.02 2.69 0 3.85-2.33 4.7-4.56 4.95.36.31.68.92.68 1.86v2.65c0 .26.18.57.69.48A10 10 0 0 0 12 2Z" /></svg>;
  }
  if (id === "linkedin") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.2 8.6a2.1 2.1 0 1 0 0-4.2 2.1 2.1 0 0 0 0 4.2ZM3.4 10h3.7v10.6H3.4V10Zm5.9 0h3.5v1.45h.05c.49-.92 1.68-1.89 3.45-1.89 3.7 0 4.38 2.43 4.38 5.6v5.44H17V15.8c0-1.14-.02-2.6-1.59-2.6-1.6 0-1.84 1.24-1.84 2.52v4.88H9.3V10Z" /></svg>;
  }
  if (id === "email") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5.5h18v13H3v-13Zm1.5 1.4 7.5 5.7 7.5-5.7" /></svg>;
  }
  return <span className="social-monogram" aria-hidden="true">{id === "codeforces" ? "CF" : id === "codechef" ? "CC" : id.slice(0, 2).toUpperCase()}</span>;
}

export function SocialLinks({ links, email, placement = "rail" }: SocialLinksProps) {
  const items: { id: string; label: string; url: string; external: boolean }[] = links.flatMap((link) => {
    if (link.visible === false) return [];
    const url = safeHttpUrl(link.url);
    return url ? [{ id: link.id, label: link.label, url, external: true }] : [];
  });
  const validatedEmail = safeEmail(email);
  if (validatedEmail) items.push({ id: "email", label: "Email", url: `mailto:${validatedEmail}`, external: false });
  if (items.length === 0) return null;

  return (
    <aside className={`social-links social-links--${placement}`} aria-label="Social profiles">
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={item.url}
              aria-label={item.label}
              title={item.label}
              {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              <SocialIcon id={item.id} />
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
