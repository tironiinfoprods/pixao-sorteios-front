import * as React from "react";
import { trackEvent } from "./analytics";

const MILESTONES = [25, 50, 75, 100];

export function usePageEngagement({ onReachPlans } = {}) {
  React.useEffect(() => {
    const fired = new Set();
    let plansReached = false;

    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      if (max <= 0) return;

      const pct = Math.round((window.scrollY / max) * 100);
      for (const m of MILESTONES) {
        if (pct >= m && !fired.has(m)) {
          fired.add(m);
          trackEvent(`scroll_depth_${m}`);
        }
      }

      const plansEl = document.getElementById("planos");
      if (!plansReached && plansEl) {
        const rect = plansEl.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.85) {
          plansReached = true;
          trackEvent("scroll_to_plans");
          onReachPlans?.();
        }
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [onReachPlans]);
}
