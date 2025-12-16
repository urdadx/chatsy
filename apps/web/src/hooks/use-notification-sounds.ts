import { useCallback, useRef } from "react";

import connectedSound from "@/assets/sounds/connected-notification.wav";
import disconnectedSound from "@/assets/sounds/disconnected-notification.wav";
import messageSound from "@/assets/sounds/message-notification.wav";

export function useNotificationSounds() {
  const connectedAudioRef = useRef<HTMLAudioElement | null>(null);
  const disconnectedAudioRef = useRef<HTMLAudioElement | null>(null);
  const messageAudioRef = useRef<HTMLAudioElement | null>(null);

  const playConnectedSound = useCallback(() => {
    try {
      if (!connectedAudioRef.current) {
        connectedAudioRef.current = new Audio(connectedSound);
        connectedAudioRef.current.volume = 0.5;
      }
      connectedAudioRef.current.currentTime = 0;
      connectedAudioRef.current.play().catch((err) => {
        console.warn("Could not play connected sound:", err);
      });
    } catch (err) {
      console.warn("Error playing connected sound:", err);
    }
  }, []);

  const playDisconnectedSound = useCallback(() => {
    try {
      if (!disconnectedAudioRef.current) {
        disconnectedAudioRef.current = new Audio(disconnectedSound);
        disconnectedAudioRef.current.volume = 0.5;
      }
      disconnectedAudioRef.current.currentTime = 0;
      disconnectedAudioRef.current.play().catch((err) => {
        console.warn("Could not play disconnected sound:", err);
      });
    } catch (err) {
      console.warn("Error playing disconnected sound:", err);
    }
  }, []);

  const playMessageSound = useCallback(() => {
    try {
      if (!messageAudioRef.current) {
        messageAudioRef.current = new Audio(messageSound);
        messageAudioRef.current.volume = 0.5;
      }
      messageAudioRef.current.currentTime = 0;
      messageAudioRef.current.play().catch((err) => {
        console.warn("Could not play message sound:", err);
      });
    } catch (err) {
      console.warn("Error playing message sound:", err);
    }
  }, []);

  return {
    playConnectedSound,
    playDisconnectedSound,
    playMessageSound,
  };
}
