"use client";

import { Button } from "@/components/ui/button";

export default function PausePlayButton({ paused, setPaused }) {
  return (
    <Button
      onClick={() => setPaused(!paused)}
      className="bg-primary text-white rounded-md p-2 w-14"
    >
      {paused ? "Play" : "Pause"}
    </Button>
  );
}
