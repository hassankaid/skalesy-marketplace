"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Compass, ArrowRight, X } from "lucide-react";

const KEY = "skalesy-welcome-dismissed-v1";

export function WelcomeBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      setShow(localStorage.getItem(KEY) !== "1");
    } catch {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  function dismiss() {
    try {
      localStorage.setItem(KEY, "1");
    } catch {}
    setShow(false);
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-brand/20 bg-accent/60 p-4 sm:p-5">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-10 size-40 rounded-full opacity-30 blur-3xl"
        style={{
          background: "radial-gradient(closest-side, var(--color-brand), transparent)",
        }}
      />
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand text-white">
            <Compass className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">Première visite ? Suivez le guide.</p>
            <p className="text-sm text-muted-foreground">
              Découvrez et testez la plateforme en quelques minutes, étape par étape.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 pl-12 sm:pl-0">
          <Link
            href="/guide"
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Ouvrir le guide
            <ArrowRight className="size-4" />
          </Link>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Masquer"
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
