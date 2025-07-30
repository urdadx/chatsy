import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

export interface SendVisitorAnalyticsOptions {
  organizationId: string;
  extra?: any;
  triggerOnMount?: boolean;
  triggerOnUnmount?: boolean;
  onLog?: (data: any) => void;
}

export function useSendVisitorAnalytics({
  organizationId,
  extra = {},
  triggerOnMount = true,
  triggerOnUnmount = true,
  onLog,
}: SendVisitorAnalyticsOptions) {
  const mountTimestampRef = useRef<number | null>(null);

  function getVisitorId() {
    let id = sessionStorage.getItem("chatsy_visitor_id");
    if (!id) {
      id = Math.random().toString(36).substring(2) + Date.now();
      sessionStorage.setItem("chatsy_visitor_id", id);
    }
    return id;
  }

  function getDeviceType() {
    const ua = navigator.userAgent;
    if (
      /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
    ) {
      if (/Tablet|iPad/i.test(ua)) return "Tablet";
      return "Mobile";
    }
    return "Desktop";
  }

  function getLocationInfo(cb: (location: any) => void) {
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => {
        cb({
          city: data.city,
          region: data.region,
          country: data.country_name,
          country_code: data.country_code,
          continent: data.continent_code || data.continent || null,
          ip: data.ip,
        });
      })
      .catch(() => cb(null));
  }

  function logVisitorAnalytics(logExtra?: any) {
    if (!organizationId || organizationId === "placeholder") return;
    const visitorId = getVisitorId();
    const userAgent = navigator.userAgent;
    const deviceInfo = {
      platform: navigator.platform,
      deviceType: getDeviceType(),
    };
    const referer = document.referrer || null;
    getLocationInfo((location) => {
      const data = {
        organizationId,
        visitorId,
        userAgent,
        deviceInfo,
        location,
        referer,
        ...extra,
        ...logExtra,
      };
      if (onLog) onLog(data);
      fetch("/api/visitor-analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    });
  }

  useEffect(() => {
    if (triggerOnMount) {
      mountTimestampRef.current = Date.now();
      logVisitorAnalytics();
    }
    function handleBeforeUnload() {
      if (triggerOnUnmount && mountTimestampRef.current) {
        const durationMs = Date.now() - mountTimestampRef.current;
        logVisitorAnalytics({ durationMs, event: "page_unload" });
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Expose for manual logging (e.g., on widget open/close)
  return {
    logVisitorAnalytics,
    mountTimestampRef,
  };
}

export function getVisitorAnalytics(filter: "24h" | "7d" | "30d" | "90d") {
  return useQuery({
    queryKey: ["visitor-analytics", filter],
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    queryFn: async () => {
      const { data } = await api.get("/visitor-analytics");
      if (!Array.isArray(data)) return [];

      const now = new Date();
      const startDate = new Date(now);
      if (filter === "24h") {
        startDate.setDate(now.getDate() - 1);
      } else if (filter === "7d") {
        startDate.setDate(now.getDate() - 7);
      } else if (filter === "30d") {
        startDate.setDate(now.getDate() - 30);
      } else if (filter === "90d") {
        startDate.setDate(now.getDate() - 90);
      }
      return data.filter((item) => {
        const createdAt = new Date(item.createdAt || item.date);
        return createdAt >= startDate;
      });
    },
  });
}
