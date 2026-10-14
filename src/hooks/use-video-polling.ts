import { useRef, useCallback, useEffect } from "react";
import type { Video } from "@/db";

interface UseVideoPollingOptions {
  pollInterval?: number;
  maxConsecutiveErrors?: number;
  maxBackoffMs?: number;
  onCompleted?: (video: Video) => void;
  onFailed?: (args: { videoId: string; error?: string }) => void;
}

export function useVideoPolling(options: UseVideoPollingOptions = {}) {
  const {
    pollInterval = 15000,
    maxConsecutiveErrors = 5,
    maxBackoffMs = 120000,
    onCompleted,
    onFailed,
  } = options;

  const pollingTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  );
  const pollingState = useRef<Map<string, { consecutiveErrors: number; nextDelay: number }>>(
    new Map()
  );

  const fetchVideoDetail = useCallback(async (videoId: string) => {
    const detailResponse = await fetch(`/api/v1/video/${videoId}`);
    if (!detailResponse.ok) {
      throw new Error("Failed to fetch video detail");
    }
    const detailResult = await detailResponse.json();
    return detailResult.data as Video;
  }, []);

  const stopPolling = useCallback((videoId: string) => {
    const timerId = pollingTimers.current.get(videoId);
    if (timerId) {
      clearTimeout(timerId);
      pollingTimers.current.delete(videoId);
    }
    pollingState.current.delete(videoId);
  }, []);

  const startPolling = useCallback(
    (videoId: string) => {
      if (!videoId) return;

      if (pollingState.current.has(videoId)) {
        stopPolling(videoId);
      }

      pollingState.current.set(videoId, {
        consecutiveErrors: 0,
        nextDelay: pollInterval,
      });

      const pollStatus = async () => {
        if (!pollingState.current.has(videoId)) return;
        try {
          const response = await fetch(`/api/v1/video/${videoId}/status`);
          if (!response.ok) {
            throw new Error("Failed to fetch video status");
          }

          const result = await response.json();
          const status = result?.data?.status;
          const error = result?.data?.error;

          if (status === "COMPLETED") {
            try {
              const video = await fetchVideoDetail(videoId);
              stopPolling(videoId);
              onCompleted?.(video);
            } catch (detailError) {
              console.error("Failed to fetch completed video:", detailError);
              stopPolling(videoId);
              onFailed?.({ videoId, error: "Failed to fetch video detail" });
            }
          } else if (status === "FAILED") {
            stopPolling(videoId);
            onFailed?.({ videoId, error });
          } else {
            const state = pollingState.current.get(videoId);
            if (state) {
              state.consecutiveErrors = 0;
              state.nextDelay = pollInterval;
            }
          }
        } catch (pollError) {
          console.error("Polling error:", pollError);
          const state = pollingState.current.get(videoId);
          if (state) {
            state.consecutiveErrors += 1;
            const backoff = Math.min(
              maxBackoffMs,
              pollInterval * 2 ** state.consecutiveErrors
            );
            state.nextDelay = backoff;
            if (state.consecutiveErrors >= maxConsecutiveErrors) {
              console.warn(`Polling stopped for ${videoId} after repeated errors`);
              stopPolling(videoId);
              return;
            }
          }
        }

        const state = pollingState.current.get(videoId);
        if (!state) return;
        const timerId = setTimeout(pollStatus, state.nextDelay);
        pollingTimers.current.set(videoId, timerId);
      };

      pollStatus();
    },
    [
      pollInterval,
      maxConsecutiveErrors,
      maxBackoffMs,
      onCompleted,
      onFailed,
      fetchVideoDetail,
      stopPolling,
    ]
  );

  const stopAllPolling = useCallback(() => {
    pollingTimers.current.forEach((timerId) => clearTimeout(timerId));
    pollingTimers.current.clear();
    pollingState.current.clear();
  }, []);

  const isPolling = useCallback((videoId: string) => {
    return pollingState.current.has(videoId);
  }, []);

  useEffect(() => {
    return () => stopAllPolling();
  }, [stopAllPolling]);

  return {
    startPolling,
    stopPolling,
    stopAllPolling,
    isPolling,
  };
}
