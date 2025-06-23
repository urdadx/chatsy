import { QueryClient } from "@tanstack/react-query";
import { createRouter as createTanstackRouter } from "@tanstack/react-router";
import { routerWithQueryClient } from "@tanstack/react-router-with-query";
import { DefaultCatchBoundary } from "./components/default-catch-boundary";
import { routeTree } from "./routeTree.gen";

export function createRouter() {
  const queryClient = new QueryClient();

  return routerWithQueryClient(
    createTanstackRouter({
      routeTree,
      context: { queryClient },
      defaultPreload: "intent",
      scrollRestoration: true,
      defaultErrorComponent: DefaultCatchBoundary,
      defaultNotFoundComponent: () => <div>Not Found</div>,
      Wrap: ({ children }) => <>{children}</>,
    }),
    queryClient,
  );
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
