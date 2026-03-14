'use client';
import { useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { connectSocket } from '@/lib/socket';

export function useSocket(handlers: Record<string, (...args: any[]) => void>) {
  const socketRef = useRef<Socket | null>(null);
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    const socket = connectSocket();
    socketRef.current = socket;

    for (const [event, handler] of Object.entries(handlersRef.current)) {
      socket.on(event, handler);
    }

    return () => {
      for (const [event, handler] of Object.entries(handlersRef.current)) {
        socket.off(event, handler);
      }
    };
  }, []);

  return socketRef;
}
