"use client";

import { useEffect, useState } from "react";
import TargetCursor from "./TargetCursor";

export default function CursorProvider() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <TargetCursor
      targetSelector=".cursor-target"
      cursorColor="#ffffff"
      cursorColorOnTarget="#9fef00"
      spinDuration={2}
      hideDefaultCursor
      hoverDuration={0.2}
      parallaxOn
    />
  );
}
