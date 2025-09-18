"use client";

import { useEffect, useState } from "react";

export function DueDate({ dateString }: { dateString: string }) {
  const [formattedDate, setFormattedDate] = useState("");

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const date = new Date(dateString);
    setFormattedDate(
      date.toLocaleString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: tz
      })
    );
  }, [dateString]);

  return <span>{formattedDate}</span>;
}