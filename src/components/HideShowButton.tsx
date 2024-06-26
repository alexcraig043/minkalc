"use client";

import { Button } from "@/components/ui/button";

export default function HideShowButton({ paused, setPaused }) {
  return (
    <Button
      onClick={() => setPaused(!paused)}
      className="bg-primary text-white rounded-md h-8 w-14"
    >
      {paused ? "Play" : "Pause"}
    </Button>
  );
}
