"use client";

import { useEffect } from "react";
import { trackBlogViewAction, trackVisitorAction } from "@/actions/analytics";

export function VisitorTracker() {
  useEffect(() => {
    const key = "hf-visitor-tracked";
    if (sessionStorage.getItem(key)) {
      return;
    }
    sessionStorage.setItem(key, "1");
    void trackVisitorAction();
  }, []);
  return null;
}

export function BlogViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `hf-blog-view-${slug}`;
    if (sessionStorage.getItem(key)) {
      return;
    }
    sessionStorage.setItem(key, "1");
    void trackBlogViewAction(slug);
  }, [slug]);
  return null;
}
