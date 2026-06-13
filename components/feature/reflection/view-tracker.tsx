"use client";

import {useEffect} from "react";
import {apiClient} from "@/lib/api/client";

type ViewTrackerProps = {
  entryId: string;
};

const trackedViews = new Set<string>();

export function ViewTracker({ entryId }: ViewTrackerProps) {
  useEffect(() => {
    const trackingKey = entryId;

    if (trackedViews.has(trackingKey)) {
      return;
    }

    trackedViews.add(trackingKey);

    void apiClient
      .post("/api/reflections/views", {
        entryId,
      })
      .catch(() => {
        trackedViews.delete(trackingKey);
      });
  }, [entryId]);

  return null;
}
