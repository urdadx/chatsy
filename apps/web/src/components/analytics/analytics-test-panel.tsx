import {
  formatDuration,
  useRealTimeAnalytics,
} from "@/hooks/use-real-time-analytics";
import React from "react";

export function AnalyticsTestPanel() {
  const { data, isConnected, error, reconnect, disconnect } =
    useRealTimeAnalytics();

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-white p-4 rounded-lg shadow-lg border max-w-sm">
      <h3 className="font-semibold mb-2">Analytics Debug Panel</h3>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span>Connection:</span>
          <div
            className={`size-2 rounded-full ${
              isConnected
                ? "bg-green-500"
                : error
                  ? "bg-red-500"
                  : "bg-yellow-500"
            }`}
          />
          <span>
            {isConnected ? "Connected" : error ? "Error" : "Connecting"}
          </span>
        </div>

        {error && <div className="text-red-600 text-xs">Error: {error}</div>}

        <div className="grid grid-cols-2 gap-2 mt-3">
          <div>
            <div className="font-medium">Total Visits</div>
            <div className="text-lg">{data.totalVisits}</div>
          </div>
          <div>
            <div className="font-medium">Active Now</div>
            <div className="text-lg">{data.activeVisitors}</div>
          </div>
          <div>
            <div className="font-medium">Avg Session</div>
            <div className="text-lg">
              {formatDuration(data.averageSessionTime)}
            </div>
          </div>
          <div>
            <div className="font-medium">Total Sessions</div>
            <div className="text-lg">{data.totalSessions}</div>
          </div>
        </div>

        <div className="mt-3">
          <div className="font-medium">Recent Activity (24h)</div>
          <div className="text-xs text-gray-600">
            {data.recentActivity.length} data points
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          <button
            onClick={reconnect}
            className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
          >
            Reconnect
          </button>
          <button
            onClick={disconnect}
            className="px-2 py-1 bg-red-500 text-white rounded text-xs"
          >
            Disconnect
          </button>
        </div>
      </div>
    </div>
  );
}

// Only show in development
export function ConditionalAnalyticsTestPanel() {
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return <AnalyticsTestPanel />;
}
