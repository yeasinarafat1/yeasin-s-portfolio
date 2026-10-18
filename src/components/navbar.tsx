"use client";

import { useEffect, useRef, useState } from "react";

interface NavbarProps {
  name: string;
  visibleSections: string[];
  isNowPage?: boolean;
}

const navigation = [
  { label: "Home", href: "#home", section: "home" },
  { label: "About", href: "#about", section: "about" },
  { label: "Projects", href: "#projects", section: "projects" },
  { label: "Skills", href: "#skills", section: "skills" },
  { label: "Education", href: "#education", section: "education" },
  { label: "Now", href: "/now", section: "now" },
  { label: "Contact", href: "#contact", section: "contact" },
];

export function Navbar({ name, visibleSections, isNowPage = false }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let previousY = Math.max(0, window.scrollY);
    let previousDirection = 0;
    let directionDistance = 0;

    const handleScroll = () => {
      const currentY = Math.max(0, window.scrollY);
      setIsScrolled(currentY > 8);

      if (isMenuOpen || headerRef.current?.querySelector(":focus-visible")) {
        setIsHidden(false);
        previousY = currentY;
        previousDirection = 0;
        directionDistance = 0;
        return;
      }

      const delta = currentY - previousY;
      if (currentY <= 72) {
        setIsHidden(false);
        previousDirection = 0;
        directionDistance = 0;
      } else if (delta !== 0) {
        const direction = Math.sign(delta);
        directionDistance = direction === previousDirection ? directionDistance + Math.abs(delta) : Math.abs(delta);
        previousDirection = direction;

        if (directionDistance >= 8) setIsHidden(direction > 0);
      }

      previousY = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMenuOpen]);

  return (
    <header
      ref={headerRef}
      className={`site-header${isScrolled ? " site-header--scrolled" : ""}${isHidden ? " site-header--hidden" : ""}`}
    >
      <nav className="nav-inner" aria-label="Main navigation">
        <a className="wordmark" href={isNowPage ? "/" : "#top"} aria-label={`${name}, ${isNowPage ? "home" : "back to top"}`}>
          <span aria-hidden="true">&lt;/</span>{name}<span className="wordmark-dot text-coral">&gt;</span>
        </a>
        <ul id="primary-navigation" className={`nav-links${isMenuOpen ? " nav-links--open" : ""}`}>
          {navigation.filter((item) => item.section === "home" || item.section === "contact" || item.section === "now" || visibleSections.includes(item.section)).map((item) => {
            const href = isNowPage && item.section !== "now"
              ? item.section === "home" ? "/" : `/#${item.section}`
              : item.href;
            return (
              <li key={item.href}><a href={href} aria-current={isNowPage && item.section === "now" ? "page" : undefined} onClick={() => setIsMenuOpen(false)}>{item.label}</a></li>
            );
          })}
        </ul>
        <a className="nav-cta" href={isNowPage ? "/#contact" : "#contact"} onClick={() => setIsMenuOpen(false)}>Let&apos;s Talk <span aria-hidden="true">↗</span></a>
        <button
          className="nav-toggle"
          type="button"
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-controls="primary-navigation"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <span className="nav-toggle-lines" aria-hidden="true"><span /><span /><span /></span>
        </button>
      </nav>
    </header>
  );
}
