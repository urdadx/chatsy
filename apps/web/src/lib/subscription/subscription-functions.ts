import type { Subscription } from "@polar-sh/sdk/models/components/subscription.js";
import { getHeaders } from "@tanstack/react-start/server";
import { auth } from "../../../auth";

// get the external customer ID from the active subscription
export const getCustomerExternalId = async () => {
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
  const externalCustomerId = subscription?.customer?.externalId || null;
  return externalCustomerId;
};
