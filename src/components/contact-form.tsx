"use client";

import { useState, type FormEvent } from "react";
import { submitContactMessage } from "@/app/actions";

export function ContactForm() {
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    setIsSubmitting(true);
    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const result = await submitContactMessage(formData);
      if (!result.ok) {
        setStatus(result.error ?? "Your message could not be sent. Please try again.");
        return;
      }
      form.reset();
      setStatus("Thanks for reaching out. Your message has been sent.");
    } catch {
      setStatus("Could not reach the message service. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="public-contact-form" onSubmit={submit}>
      <div className="public-contact-fields">
        <label className="public-contact-field">
          <span>Your name</span>
          <input name="name" autoComplete="name" maxLength={100} required placeholder="Name" />
        </label>
        <label className="public-contact-field">
          <span>Email address</span>
          <input name="email" type="email" autoComplete="email" maxLength={254} required placeholder="you@example.com" />
        </label>
        <label className="public-contact-field public-contact-field--wide">
          <span>Message</span>
          <textarea name="message" minLength={5} maxLength={5000} required rows={6} placeholder="What would you like to talk about?" />
        </label>
        <label className="public-contact-honeypot" aria-hidden="true">
          Leave this field empty
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className="public-contact-form-footer">
        <p className={`public-contact-status${status && !status.startsWith("Thanks") ? " is-error" : ""}`} role="status" aria-live="polite">{status}</p>
        <button className="button button--primary public-contact-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? "Sending..." : "Send message"}</button>
      </div>
    </form>
  );
}
