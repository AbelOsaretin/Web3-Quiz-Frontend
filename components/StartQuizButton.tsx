"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

export default function StartQuizButton() {
  return (
    <Link href="/quiz/new" passHref>
      <Button
        size="lg"
        className="gap-2"
        onClick={() => console.log("Start Quiz button clicked")}
      >
        <Zap className="h-5 w-5" />
        Start Coding Quiz
      </Button>
    </Link>
  );
}
