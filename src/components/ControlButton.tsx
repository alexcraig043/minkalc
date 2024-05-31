"use client";

import { Button } from "@/components/ui/button";

export default function ControlButton({ on, setOn, onText, offText }) {
  return (
    <Button
      onClick={() => setOn(!on)}
      className="bg-primary text-white rounded-md h-8 w-14"
    >
      {on ? onText : offText}
    </Button>
  );
}
