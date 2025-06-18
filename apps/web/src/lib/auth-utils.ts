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
