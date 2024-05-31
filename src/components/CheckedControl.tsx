"use client";

import { Checkbox } from "@/components/ui/checkbox";

export default function CheckedControl({ checked, setChecked }) {
  return (
    <div className="flex flex-row items-center gap-2">
      <Checkbox
        id="hyperplanes"
        checked={checked}
        onCheckedChange={() => setChecked(!checked)}
      />
      <label htmlFor="hyperplanes" className="text-primary text-lg ">
        Hyperplanes
      </label>
    </div>
  );
}
