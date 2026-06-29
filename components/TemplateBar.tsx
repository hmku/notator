"use client";

import { BEAT_TEMPLATES } from "@/lib/templates";

interface TemplateBarProps {
  onApply: (beats: string[]) => void;
}

export function TemplateBar({ onApply }: TemplateBarProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {BEAT_TEMPLATES.map((template) => (
        <button
          key={template.id}
          type="button"
          onClick={() => onApply(template.beats)}
          className="rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-xs font-medium text-[var(--foreground)] hover:border-[var(--accent-muted)]"
        >
          {template.label}
        </button>
      ))}
    </div>
  );
}
