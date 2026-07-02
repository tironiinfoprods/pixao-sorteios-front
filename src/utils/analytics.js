import { track } from "@vercel/analytics";

/**
 * Eventos front-end seguros — não quebra se analytics indisponível.
 */
export function trackEvent(name, properties = {}) {
  try {
    if (typeof track === "function") {
      track(name, properties);
      return;
    }
    if (typeof window !== "undefined" && window.dataLayer) {
      window.dataLayer.push({ event: name, ...properties });
    }
  } catch {
    /* silencioso */
  }
}

export const AnalyticsEvents = {
  HERO_CTA: "hero_cta_click",
  HOW_IT_WORKS_CTA: "how_it_works_cta_click",
  SCROLL_TO_PLANS: "scroll_to_plans",
  PLAN_CLICK: "plan_click",
  NUMBER_SELECT: "number_select",
  WHATSAPP_GROUP: "whatsapp_group_click",
  WHATSAPP_SUPPORT: "whatsapp_support_click",
  CHECKOUT_START: "checkout_start",
  SELECTION_ERROR: "selection_error",
  STICKY_CTA: "sticky_cta_click",
};
