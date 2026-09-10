"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle } from "lucide-react";
import type { ActionResult } from "@/lib/admin-actions";

type Action = (prev: ActionResult, formData: FormData) => Promise<ActionResult>;

/**
 * Enveloppe les formulaires du back-office : l'erreur renvoyée par l'action est
 * affichée dans la page, au lieu de remonter en exception qui produirait en
 * production une page « Application error » opaque, saisie perdue.
 */
export function AdminForm({
  action,
  children,
  className,
}: {
  action: Action;
  children: React.ReactNode;
  className?: string;
}) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className={className}>
      {state.error && (
        <p className="mb-3 flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          {state.error}
        </p>
      )}
      {children}
    </form>
  );
}

/** Bouton qui se désactive et change de libellé pendant l'envoi. */
export function SubmitButton({
  children,
  pendingLabel,
  className = "btn-primary focus-ring",
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? (pendingLabel ?? "Envoi…") : children}
    </button>
  );
}
