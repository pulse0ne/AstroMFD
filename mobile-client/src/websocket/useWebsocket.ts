import { useCallback, useEffect, useRef, useState } from "react";

const INITIAL_RETRY_MS = 500;
const MAX_RETRY_MS = 10000;

export function useWebsocket(url: string) {
  const socketRef = useRef<WebSocket | null>(null);
  const retryDelayRef = useRef(INITIAL_RETRY_MS);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const msgBuffer = useRef<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);

  const connect = useCallback(() => {
    if (
      socketRef.current &&
      socketRef.current.readyState !== WebSocket.CLOSED
    ) {
      return;
    }

    const socket = new WebSocket(url);
    socketRef.current = socket;

    socket.onopen = () => {
      setIsConnected(true);
      retryDelayRef.current = INITIAL_RETRY_MS;
      if (msgBuffer.current.length) {
        msgBuffer.current.forEach((msg) => socket.send(msg));
        msgBuffer.current = [];
      }
    };

    socket.onclose = () => {
      setIsConnected(false);
      scheduleReconnect();
    };

    socket.onerror = () => {
      socket.close();
    };

    socket.onmessage = (event) => {
      try {
        setLastMessage(JSON.parse(event.data));
      } catch {
        setLastMessage(event.data);
      }
    };
  }, [url]);

  const scheduleReconnect = useCallback(() => {
    if (retryTimerRef.current) return;
    retryTimerRef.current = setTimeout(() => {
      retryTimerRef.current = null;
      connect();
      retryDelayRef.current = Math.min(retryDelayRef.current * 2, MAX_RETRY_MS);
    }, retryDelayRef.current);
  }, [connect]);

  useEffect(() => {
    connect();

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        if (!socketRef.current || socketRef.current.readyState === WebSocket.CLOSED) {
          retryDelayRef.current = INITIAL_RETRY_MS;
          connect();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
      socketRef.current?.close();
    };
  }, [connect]);

  const sendMessage = useCallback((msg: any) => {
    const payload = JSON.stringify(msg);
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(payload);
    } else {
      msgBuffer.current.push(payload);
    }
  }, []);

  const reconnect = useCallback(() => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
    retryDelayRef.current = INITIAL_RETRY_MS;
    socketRef.current?.close();
    connect();
  }, [connect]);

  return { isConnected, lastMessage, sendMessage, reconnect };
}
