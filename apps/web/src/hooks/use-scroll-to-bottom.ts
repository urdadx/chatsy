import { type RefObject, useEffect, useRef } from "react";

export function useScrollToBottom<T extends HTMLElement>(): [
  RefObject<T | null>,
  RefObject<T | null>,
] {
  const containerRef = useRef<T>(null);
  const endRef = useRef<T>(null);
  const userHasScrolledRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const end = endRef.current;

    if (container && end) {
      let lastScrollTop = container.scrollTop;

      // Helper function to check if user is at the bottom
      const isAtBottom = () => {
        if (!container) return false;
        const threshold = 50; // pixels from bottom
        const scrollHeight = container.scrollHeight;
        const scrollTop = container.scrollTop;
        const clientHeight = container.clientHeight;
        return scrollHeight - scrollTop - clientHeight < threshold;
      };

      // Track user scroll events
      const handleScroll = () => {
        const currentScrollTop = container.scrollTop;

        // User scrolled up (not at bottom)
        if (currentScrollTop < lastScrollTop && !isAtBottom()) {
          userHasScrolledRef.current = true;
        }

        // User scrolled back to bottom
        if (isAtBottom()) {
          userHasScrolledRef.current = false;
        }

        lastScrollTop = currentScrollTop;

        // Clear the timeout and set a new one
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }

        // Reset user scroll flag after 2 seconds of no scrolling if at bottom
        scrollTimeoutRef.current = setTimeout(() => {
          if (isAtBottom()) {
            userHasScrolledRef.current = false;
          }
        }, 2000);
      };

      const observer = new MutationObserver((mutations) => {
        const hasChildChange = mutations.some((m) => m.type === "childList");

        // Only auto-scroll if:
        // 1. There was a child change
        // 2. User hasn't manually scrolled up
        // 3. We're at or near the bottom
        if (hasChildChange && !userHasScrolledRef.current && isAtBottom()) {
          end.scrollIntoView({ behavior: "smooth", block: "end" });
        }
      });

      container.addEventListener("scroll", handleScroll, { passive: true });

      observer.observe(container, {
        childList: true,
        subtree: true,
      });

      // Initial scroll to bottom on mount
      requestAnimationFrame(() => {
        end.scrollIntoView({ behavior: "instant", block: "end" });
        userHasScrolledRef.current = false;
      });

      return () => {
        observer.disconnect();
        container.removeEventListener("scroll", handleScroll);
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
      };
    }
  }, []);

  return [containerRef, endRef];
}
