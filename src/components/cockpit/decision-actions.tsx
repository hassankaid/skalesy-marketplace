"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setDecisionStatus } from "@/app/actions/cockpit";

export function DecisionActions({ decisionId }: { decisionId: string }) {
  const [pending, start] = useTransition();

  function set(status: "validated" | "rejected") {
    start(async () => {
      const r = await setDecisionStatus(decisionId, status);
      if (!r.ok) toast.error("Échec", { description: r.error });
      else
        toast.success(
          status === "validated" ? "Décision validée" : "Décision écartée",
        );
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Button size="sm" onClick={() => set("validated")} disabled={pending}>
        {pending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Check className="size-4" />
        )}
        Valider
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => set("rejected")}
        disabled={pending}
      >
        <X className="size-4" />
        Écarter
      </Button>
    </div>
  );
}
