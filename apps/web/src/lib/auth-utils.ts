import { createServerFn } from "@tanstack/react-start";
import { getHeaders } from "@tanstack/react-start/server";
import { auth } from "auth";

export const getSession = createServerFn().handler(async () => {
  return auth.api.getSession({
    headers: getHeaders() as unknown as Headers,
  });
});

export const getUser = async () => {
  const session = await getSession();
  if (!session) {
    return null;
  }
  return session.user;
};

export const getActiveSubscription = createServerFn().handler(async () => {
  const session = await auth.api.getSession({
    headers: getHeaders() as unknown as Headers,
  });

  const activeOrganizationId = session?.session.activeOrganizationId || "";
  if (!activeOrganizationId) {
    return null;
  }

  const { result } = await auth.api.subscriptions({
    query: {
      page: 1,
      limit: 1,
      active: true,
      referenceId: activeOrganizationId,
    },
    headers: getHeaders() as unknown as Headers,
  });

  const status = result?.items?.[0]?.status;
  if (status !== "active") {
    return null;
  }

  return status;
});
