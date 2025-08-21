import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";

type ScrollFlag = ScrollBehavior | false;

export function useScrollToBottom() {
  const containerRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: isAtBottom = false } = useQuery({
    queryKey: ["messages", "is-at-bottom"],
    queryFn: () => false,
    initialData: false,
    staleTime: Number.POSITIVE_INFINITY,
  });

  const { data: scrollBehavior = false } = useQuery<ScrollFlag>({
    queryKey: ["messages", "should-scroll"],
    queryFn: () => false as ScrollFlag,
    initialData: false as ScrollFlag,
    staleTime: Number.POSITIVE_INFINITY,
  });

  const setIsAtBottom = useCallback(
    (value: boolean) => {
      queryClient.setQueryData(["messages", "is-at-bottom"], value);
    },
    [queryClient],
  );

  const setScrollBehavior = useCallback(
    (value: ScrollFlag) => {
      queryClient.setQueryData(["messages", "should-scroll"], value);
    },
    [queryClient],
  );

  useEffect(() => {
    if (scrollBehavior) {
      endRef.current?.scrollIntoView({ behavior: scrollBehavior });
      setScrollBehavior(false);
    }
  }, [setScrollBehavior, scrollBehavior]);

  const scrollToBottom = useCallback(
    (scrollBehavior: ScrollBehavior = "smooth") => {
      setScrollBehavior(scrollBehavior);
    },
    [setScrollBehavior],
  );

  function onViewportEnter() {
    setIsAtBottom(true);
  }

  function onViewportLeave() {
    setIsAtBottom(false);
  }

  return {
    containerRef,
    endRef,
    isAtBottom,
    scrollToBottom,
    onViewportEnter,
    onViewportLeave,
  };
}
