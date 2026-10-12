import type { Metadata } from "next";
import profile from "@/data/profile.json";
import "./globals.css";

export const metadata: Metadata = {
  title: `${profile.name} | Developer Portfolio`,
  description: profile.description,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
