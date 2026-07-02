import { track } from "@vercel/analytics";

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
  HERO_CTA: "click_hero_cta",
  HOW_IT_WORKS_CTA: "click_how_it_works",
  SCROLL_TO_PLANS: "scroll_to_plans",
  PLAN_CLICK: "click_plan_cta",
  NUMBER_SELECT: "number_selected",
  WHATSAPP_GROUP: "whatsapp_click",
  WHATSAPP_SUPPORT: "whatsapp_click",
  CHECKOUT_START: "checkout_start",
  SELECTION_ERROR: "selection_error",
  STICKY_CTA: "click_sticky_cta",
  EXPAND_NUMBERS: "expand_numbers_board",
  QUICK_PLAN_NAV: "click_quick_plan",
  CADASTRO_HERO: "click_cadastro_hero",
  LOGIN_HERO: "click_login_hero",
};
