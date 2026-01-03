"use client"

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useSWRConfig } from 'swr';

interface WebSocketContextType {
  isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectAttempts = useRef(0);
  const { mutate } = useSWRConfig();
  const MAX_RECONNECT_ATTEMPTS = 10;
  const RECONNECT_INTERVAL_MS = 5000;

  useEffect(() => {
    const connect = () => {
      // Determine WebSocket URL from API_BASE env var, with a fallback for local dev
      let wsUrl;
      if (process.env.NEXT_PUBLIC_WEBSOCKET_URL) {
        wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL;
      } else {
        // Fallback to constructing from NEXT_PUBLIC_API_BASE (or default local)
        const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:9000';
        wsUrl = apiBase.replace(/^http/, 'ws') + '/api/ws/updates';
      }
      
      console.log(`Attempting to connect WebSocket to: ${wsUrl}`);

      const socket = new WebSocket(wsUrl);
      ws.current = socket;

      socket.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        reconnectAttempts.current = 0;
        toast.success('Live updates connected');
        // Revalidate all data on successful reconnect
        mutate(key => true);
      };

      socket.onmessage = (event) => {
        try {
            const message = JSON.parse(event.data);
            if (message.type === 'data_updated') {
                console.log('WebSocket: data_updated received, mutating relevant SWR keys...');
                // Mutate all keys that start with /api to refresh data
                mutate(key => typeof key === 'string' && key.startsWith('/api/'), undefined, { revalidate: true });
                toast.info("Network data has been updated in real-time.");
            }
        } catch (e) {
            console.error("Failed to parse WebSocket message:", e)
        }
      };

      socket.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts.current++;
          setTimeout(connect, RECONNECT_INTERVAL_MS * reconnectAttempts.current); // Exponential backoff
        } else {
          toast.error('Could not reconnect to live updates. Please refresh the page.');
        }
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        socket.close(); // Triggers onclose and reconnect logic
      };
    };

    connect();

    return () => {
      if (ws.current) {
        ws.current.onclose = null; // Prevent reconnect on unmount
        ws.current.close();
      }
    };
  }, [mutate]);


  return (
    <WebSocketContext.Provider value={{ isConnected }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketStatus = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocketStatus must be used within a WebSocketProvider');
  }
  return context;
};
