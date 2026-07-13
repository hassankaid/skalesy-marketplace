"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, MessageSquareReply } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MentionTextarea } from "@/components/cockpit/mentions";
import { answerQuestion } from "@/app/actions/cockpit";

export function AnswerQuestionDialog({
  questionId,
  question,
  defaultAnswer,
  label = "Répondre",
}: {
  questionId: string;
  question: string;
  defaultAnswer?: string | null;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [answer, setAnswer] = useState(defaultAnswer ?? "");
  const [pending, start] = useTransition();

  function submit() {
    if (!answer.trim()) {
      toast.error("La réponse ne peut pas être vide.");
      return;
    }
    start(async () => {
      const r = await answerQuestion(questionId, answer);
      if (!r.ok) {
        toast.error("Échec", { description: r.error });
        return;
      }
      toast.success("Réponse enregistrée");
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>
        <MessageSquareReply className="size-4" />
        {label}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Répondre à la question</DialogTitle>
          <DialogDescription>{question}</DialogDescription>
        </DialogHeader>
        <MentionTextarea
          value={answer}
          onChange={setAnswer}
          rows={4}
          placeholder="Votre réponse… (tapez @ pour mentionner)"
          autoFocus
        />
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Annuler</DialogClose>
          <Button onClick={submit} disabled={pending}>
            {pending && <Loader2 className="size-4 animate-spin" />}
            Enregistrer la réponse
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
