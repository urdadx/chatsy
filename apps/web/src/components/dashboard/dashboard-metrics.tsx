import {
  BrainCog,
  Globe,
  MessageCircle,
  Star,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { DashboardCard } from "./dashboard-card";

interface DashboardMetricsProps {
  sourcesCount: number;
  conversationsCount: number;
  voteCounts: { upvotes: number; downvotes: number };
  meter: { balance: number } | undefined;
  visitorData: unknown[] | undefined;
}

export function DashboardMetrics({
  sourcesCount,
  conversationsCount,
  voteCounts,
  meter,
  visitorData,
}: DashboardMetricsProps) {
  const balance = meter?.balance ?? 0;
  const totalVisits = Array.isArray(visitorData) ? visitorData.length : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <DashboardCard
        icon={BrainCog}
        title="Connected sources"
        value={sourcesCount ?? 0}
        gradientFrom="purple-50"
        gradientVia="purple-25"
        href="/admin/knowledge-base"
      />

      <DashboardCard
        icon={MessageCircle}
        title="Total conversations"
        value={conversationsCount ?? 0}
        gradientFrom="slate-50"
        gradientVia="slate-25"
        href="/admin/chat-history"
      />

      <DashboardCard
        icon={Star}
        title="Credits remaining"
        value={balance}
        gradientFrom="orange-50"
        gradientVia="orange-25"
        href="/admin/settings?tab=billing"

      />

      <DashboardCard
        icon={Globe}
        title="Total visits"
        value={totalVisits}
        gradientFrom="blue-50"
        gradientVia="blue-25"
        href="/admin/analytics"
      />

      <DashboardCard
        icon={ThumbsUp}
        title="Positive sentiments"
        value={voteCounts?.upvotes ?? 0}
        gradientFrom="green-50"
        gradientVia="green-25"
        href="/admin/analytics"
      />

      <DashboardCard
        icon={ThumbsDown}
        title="Negative sentiments"
        value={voteCounts?.downvotes ?? 0}
        gradientFrom="red-50"
        gradientVia="red-25"
        href="/admin/analytics"
      />
    </div>
  );
}
