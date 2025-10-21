import type { Subscription } from "@polar-sh/sdk/models/components/subscription.js";
import { createServerFn } from "@tanstack/react-start";
import { getHeaders } from "@tanstack/react-start/server";
import { auth, polarClient } from "../../auth";
import { getCustomerExternalId } from "./subscription/subscription-functions";

export const getSession = createServerFn().handler(async () => {
  const headers = getHeaders() as unknown as Headers;

  return auth.api.getSession({
    headers: headers,
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
      limit: 10,
      active: true,
      referenceId: activeOrganizationId,
    },
    headers: getHeaders() as unknown as Headers,
  });

  const subscription = result?.items?.[0] as Subscription;
  const status = subscription?.status;
  if (status !== "active") {
    return null;
  }

  return subscription;
});

// get active meter for everyone in the organization
// since polar does not return meter data in subscription for invited users
export const getActiveMeter = createServerFn().handler(async () => {
  const externalCustomerId = (await getCustomerExternalId()) || "";

  const result = await polarClient.customers.getStateExternal({
    externalId: externalCustomerId,
  });

  return result?.activeMeters[0] || [];
});
