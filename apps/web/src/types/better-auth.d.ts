declare module "better-auth" {
  interface Session {
    activeOrganizationId: string | null;
    activeChatbotId: string | null;
  }
}
