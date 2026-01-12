/**
 * Custom Hooks
 */

import { useEffect, useState } from 'react';
import { apiService } from '@services/api.service';
import { socketService } from '@services/socket.service';

/**
 * Hook to fetch paginated data
 */
export function usePaginatedData<T>(
  fetchFunction: (page: number, limit: number) => Promise<any>,
  limit: number = 20
) {
  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (pageNum: number) => {
    try {
      setIsLoading(true);
      const response = await fetchFunction(pageNum, limit);
      
      if (pageNum === 1) {
        setData(response.data);
      } else {
        setData((prev) => [...prev, ...response.data]);
      }
      
      setHasMore(response.pagination.page < response.pagination.totalPages);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
  }, []);

  const loadMore = () => {
    if (hasMore && !isLoading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchData(nextPage);
    }
  };

  const refresh = () => {
    setPage(1);
    fetchData(1);
  };

  return { data, isLoading, hasMore, error, loadMore, refresh };
}

/**
 * Hook for socket connection
 */
export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    socketService.connect();

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socketService.subscribe('socket_connected', handleConnect);
    socketService.subscribe('socket_disconnected', handleDisconnect);

    return () => {
      socketService.unsubscribe('socket_connected', handleConnect);
      socketService.unsubscribe('socket_disconnected', handleDisconnect);
    };
  }, []);

  return { isConnected };
}

/**
 * Hook for real-time messages
 */
export function useRealTimeMessages(conversationId: string) {
  const [messages, setMessages] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const handleNewMessage = (data: any) => {
      if (data.conversationId === conversationId) {
        setMessages((prev) => [...prev, data]);
      }
    };

    const handleUserTyping = (data: any) => {
      if (data.conversationId === conversationId) {
        setIsTyping(data.isTyping);
      }
    };

    socketService.subscribe('new_message', handleNewMessage);
    socketService.subscribe('user_typing', handleUserTyping);

    return () => {
      socketService.unsubscribe('new_message', handleNewMessage);
      socketService.unsubscribe('user_typing', handleUserTyping);
    };
  }, [conversationId]);

  return { messages, isTyping };
}

/**
 * Hook for notifications
 */
export function useNotifications() {
  const [notification, setNotification] = useState<any>(null);

  useEffect(() => {
    const handleNotification = (data: any) => {
      setNotification(data);
      // Auto clear after 5 seconds
      setTimeout(() => setNotification(null), 5000);
    };

    socketService.subscribe('notification', handleNotification);

    return () => {
      socketService.unsubscribe('notification', handleNotification);
    };
  }, []);

  return { notification };
}
