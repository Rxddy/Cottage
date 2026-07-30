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
  const [replyTo, setReplyTo] = useState("");
  const [sendLabel, setSendLabel] = useState("Send email");
  const [sendMessage, setSendMessage] = useState("");

  useEffect(() => {
    if (open) {
      setBody(initialBody);
      setSendLabel("Send email");
      setSendMessage("");
    }
  }, [open, initialBody]);

  useEffect(() => {
    if (!open) return;
    const scrollY = window.scrollY;
    const previousBodyPosition = document.body.style.position;
    const previousBodyTop = document.body.style.top;
    const previousBodyWidth = document.body.style.width;
    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.position = previousBodyPosition;
      document.body.style.top = previousBodyTop;
      document.body.style.width = previousBodyWidth;
      document.body.style.overflow = previousBodyOverflow;
      window.scrollTo(0, scrollY);
    };
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

  async function sendDraft() {
    setSendLabel("Sending...");
    setSendMessage("");
    try {
      const response = await fetch("/api/booking-email", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ subject, body, replyTo, website: "" }),
      });
      const result = await response.json() as { error?: string; message?: string };
      if (!response.ok) throw new Error(result.error || "The email could not be sent.");
      setSendLabel("Sent");
      setSendMessage(result.message || "Email sent to Lakefront Serenity support.");
    } catch (error) {
      setSendLabel("Send email");
      setSendMessage(error instanceof Error ? error.message : "The email could not be sent. Copy the draft and email the host directly.");
    }
  }

  if (!open) return null;

  return <div className="email-composer-backdrop" role="presentation">
    <section className="email-composer" role="dialog" aria-modal="true" aria-labelledby="email-composer-title">
      <div className="email-composer-heading"><div><p className="eyebrow">Booking request</p><h2 id="email-composer-title">Review your email draft.</h2></div><button type="button" className="email-composer-close" onClick={onClose} aria-label="Close email draft">×</button></div>
      <p className="email-composer-note">This draft stays inside the website. Edit anything you need, then copy it into your preferred email service to send it to <strong>lakefrontserenitysupport@gmail.com</strong>.</p>
      <label className="email-composer-field">To<input readOnly value="lakefrontserenitysupport@gmail.com" /></label>
      <label className="email-composer-field">Your email for replies<input value={replyTo} onChange={(event) => setReplyTo(event.target.value)} inputMode="email" autoComplete="email" placeholder="you@example.com" /></label>
      <label className="email-composer-field">Subject<input value={subject} onChange={() => undefined} readOnly /></label>
      <label className="email-composer-field">Message<textarea value={body} onChange={(event) => setBody(event.target.value)} rows={14} /></label>
      {sendMessage ? <p className="email-composer-status" role="status">{sendMessage}</p> : null}
      <div className="email-composer-actions"><button type="button" onClick={onClose}>Close</button><button type="button" onClick={copyDraft}>{copyLabel}</button><button type="button" className="email-composer-primary" onClick={sendDraft}>{sendLabel}</button></div>
    </section>
  </div>;
}
