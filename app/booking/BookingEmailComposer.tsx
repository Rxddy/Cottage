"use client";

import { useEffect, useState } from "react";

type BookingEmailComposerProps = {
  open: boolean;
  subject: string;
  initialBody: string;
  onClose: () => void;
};

export function BookingEmailComposer({ open, subject, initialBody, onClose }: BookingEmailComposerProps) {
  const [body, setBody] = useState(initialBody);
  const [copyLabel, setCopyLabel] = useState("Copy draft");

  useEffect(() => {
    if (open) setBody(initialBody);
  }, [open, initialBody]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  async function copyDraft() {
    try {
      await navigator.clipboard.writeText(`To: lakefrontserenitysupport@gmail.com\nSubject: ${subject}\n\n${body}`);
      setCopyLabel("Copied");
      window.setTimeout(() => setCopyLabel("Copy draft"), 1800);
    } catch {
      setCopyLabel("Select the draft and copy");
    }
  }

  if (!open) return null;

  return <div className="email-composer-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="email-composer" role="dialog" aria-modal="true" aria-labelledby="email-composer-title">
      <div className="email-composer-heading"><div><p className="eyebrow">Booking request</p><h2 id="email-composer-title">Review your email draft.</h2></div><button type="button" className="email-composer-close" onClick={onClose} aria-label="Close email draft">×</button></div>
      <p className="email-composer-note">This draft stays inside the website. Edit anything you need, then copy it into your preferred email service to send it to <strong>lakefrontserenitysupport@gmail.com</strong>.</p>
      <label className="email-composer-field">To<input readOnly value="lakefrontserenitysupport@gmail.com" /></label>
      <label className="email-composer-field">Subject<input value={subject} onChange={() => undefined} readOnly /></label>
      <label className="email-composer-field">Message<textarea value={body} onChange={(event) => setBody(event.target.value)} rows={14} /></label>
      <div className="email-composer-actions"><button type="button" onClick={onClose}>Close</button><button type="button" className="email-composer-primary" onClick={copyDraft}>{copyLabel}</button></div>
    </section>
  </div>;
}
