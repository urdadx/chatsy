export const PLAN_PRODUCT_IDS = {
  starter: {
    monthly: import.meta.env.VITE_MONTHLY_STARTER_PLAN,
    yearly: import.meta.env.VITE_YEARLY_STARTER_PLAN,
  },
  growth: {
    monthly: import.meta.env.VITE_MONTHLY_GROWTH_PLAN,
    yearly: import.meta.env.VITE_YEARLY_GROWTH_PLAN,
  },
  professional: {
    monthly: import.meta.env.VITE_MONTHLY_PRO_PLAN,
    yearly: import.meta.env.VITE_YEARLY_PRO_PLAN,
  },
};

export const ADDON_PRODUCT_IDS = {
  messages: import.meta.env.VITE_EXTRA_MESSAGE_CREDITS_ADDON,
  branding: import.meta.env.VITE_REMOVE_BRANDING_ADDON,
  chatbot: import.meta.env.VITE_EXTRA_CHATBOT_ADDON,
  member: import.meta.env.VITE_EXTRA_TEAM_MEMBER_ADDON,
};
