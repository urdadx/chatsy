import {
  useRealTimeVisitorHistory,
  useVisitorHistory,
} from "@/hooks/log-visitor-analytics";
import React from "react";
import { Spinner } from "../ui/spinner";

/**
 * Example component showing how to use the real-time visitor analytics integration
 */
export function RealTimeVisitorExample() {
  // Option 1: Use the helper hook with real-time enabled
  const {
    data: realTimeData,
    isLoading: realTimeLoading,
    isConnected,
  } = useVisitorHistory("24h", true);

  // Option 2: Use the specific real-time hook directly
  const {
    data: directData,
    isLoading: directLoading,
    isConnected: directConnected,
    reconnect,
    disconnect,
  } = useRealTimeVisitorHistory("7d");

  // Option 3: Use the original static version (non-real-time)
  const { data: staticData, isLoading: staticLoading } = useVisitorHistory(
    "24h",
    false,
  );

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-xl font-semibold">
        Real-Time Visitor Analytics Integration
      </h2>

      {/* Real-time version using helper hook */}
      <div className="border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-medium">Real-Time (24h) - Helper Hook</h3>
          {isConnected ? (
            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
              ● Live
            </span>
          ) : (
            <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
              ● Disconnected
            </span>
          )}
        </div>
        {realTimeLoading ? (
          <Spinner />
        ) : (
          <p>Visitor count: {realTimeData?.length || 0}</p>
        )}
      </div>

      {/* Real-time version using direct hook */}
      <div className="border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-medium">Real-Time (7d) - Direct Hook</h3>
          {directConnected ? (
            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
              ● Live
            </span>
          ) : (
            <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
              ● Disconnected
            </span>
          )}
          <button
            onClick={reconnect}
            className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
          >
            Reconnect
          </button>
          <button
            onClick={disconnect}
            className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
          >
            Disconnect
          </button>
        </div>
        {directLoading ? (
          <Spinner />
        ) : (
          <p>Visitor count: {directData?.length || 0}</p>
        )}
      </div>

      {/* Static version for comparison */}
      <div className="border rounded-lg p-4">
        <h3 className="font-medium mb-2">Static (24h) - Traditional</h3>
        {staticLoading ? (
          <Spinner />
        ) : (
          <p>Visitor count: {staticData?.length || 0}</p>
        )}
      </div>

      <div className="text-sm text-gray-600">
        <h4 className="font-medium mb-2">How it works:</h4>
        <ul className="space-y-1 list-disc list-inside">
          <li>
            <strong>Real-time versions</strong> automatically update when new
            visitor data arrives via SSE
          </li>
          <li>
            <strong>Static version</strong> only updates on mount, window focus,
            or manual refetch
          </li>
          <li>
            Real-time connection status is shown with green (connected) or red
            (disconnected) indicators
          </li>
          <li>
            Automatic reconnection with exponential backoff handles network
            issues
          </li>
          <li>Connection pauses when tab is hidden to save resources</li>
        </ul>
      </div>
    </div>
  );
}
