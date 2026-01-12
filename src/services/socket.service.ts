/**
 * Socket.io Service for real-time communication
 */

import { io, Socket } from 'socket.io-client';
import { config } from '@config/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface MessageData {
  conversationId: string;
  recipientId: string;
  content: string;
  images?: string[];
}

type SocketEventListener = (data: any) => void;

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, SocketEventListener[]> = new Map();

  /**
   * Initialize socket connection
   */
  async connect(): Promise<void> {
    try {
      const token = await AsyncStorage.getItem('authToken');

      if (!token) {
        console.error('No auth token available');
        return;
      }

      this.socket = io(config.socketUrl, {
        auth: {
          token,
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      this.setupEventListeners();
    } catch (error) {
      console.error('Socket connection error:', error);
    }
  }

  /**
   * Disconnect socket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Setup socket event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.emit('socket_connected', { status: 'connected' });
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.emit('socket_disconnected', { status: 'disconnected' });
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      this.emit('socket_error', { error });
    });

    this.socket.on('new_message', (data) => {
      this.emit('new_message', data);
    });

    this.socket.on('message_sent', (data) => {
      this.emit('message_sent', data);
    });

    this.socket.on('user_typing', (data) => {
      this.emit('user_typing', data);
    });

    this.socket.on('message_read', (data) => {
      this.emit('message_read', data);
    });

    this.socket.on('user_online', (data) => {
      this.emit('user_online', data);
    });

    this.socket.on('user_offline', (data) => {
      this.emit('user_offline', data);
    });

    this.socket.on('notification', (data) => {
      this.emit('notification', data);
    });
  }

  /**
   * Send private message
   */
  sendMessage(data: MessageData): void {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }
    this.socket.emit('send_message', data);
  }

  /**
   * Emit typing indicator
   */
  emitTyping(conversationId: string, recipientId: string): void {
    if (!this.socket) return;
    this.socket.emit('user_typing', { conversationId, recipientId });
  }

  /**
   * Mark message as read
   */
  markMessageAsRead(messageId: string, conversationId: string, senderId: string): void {
    if (!this.socket) return;
    this.socket.emit('message_read', { messageId, conversationId, senderId });
  }

  /**
   * Subscribe to socket events
   */
  subscribe(event: string, callback: SocketEventListener): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  /**
   * Unsubscribe from socket events
   */
  unsubscribe(event: string, callback: SocketEventListener): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to listeners
   */
  private emit(event: string, data: any): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach((callback) => callback(data));
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const socketService = new SocketService();
