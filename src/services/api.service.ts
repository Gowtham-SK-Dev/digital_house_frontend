/**
 * API Service for backend communication
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { config } from '@config/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: config.apiUrl,
      timeout: 10000,
    });

    // Request interceptor - add auth token
    this.api.interceptors.request.use(
      async (axiosConfig) => {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          axiosConfig.headers.Authorization = `Bearer ${token}`;
        }
        return axiosConfig;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle errors
    this.api.interceptors.response.use(
      (response) => response.data,
      (error: AxiosError<any>) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - clear token and navigate to login
          AsyncStorage.removeItem('authToken');
        }
        throw error.response?.data || error;
      }
    );
  }

  /**
   * Auth endpoints
   */
  async sendOTP(email: string): Promise<ApiResponse<any>> {
    return this.api.post('/auth/send-otp', { email });
  }

  async verifyOTP(
    email: string,
    otp: string,
    firstName?: string,
    lastName?: string
  ): Promise<ApiResponse<any>> {
    return this.api.post('/auth/verify-otp', {
      email,
      otp,
      firstName,
      lastName,
    });
  }

  async logout(): Promise<ApiResponse<any>> {
    return this.api.post('/auth/logout');
  }

  async getProfile(): Promise<ApiResponse<any>> {
    return this.api.get('/auth/profile');
  }

  /**
   * User endpoints
   */
  async getUserProfile(userId: string): Promise<ApiResponse<any>> {
    return this.api.get(`/users/${userId}`);
  }

  async updateProfile(data: any): Promise<ApiResponse<any>> {
    return this.api.put('/users/profile', data);
  }

  async followUser(userId: string): Promise<ApiResponse<any>> {
    return this.api.post(`/users/${userId}/follow`);
  }

  async unfollowUser(userId: string): Promise<ApiResponse<any>> {
    return this.api.delete(`/users/${userId}/follow`);
  }

  async getUserFollowers(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<any>> {
    return this.api.get(`/users/${userId}/followers`, {
      params: { page, limit },
    });
  }

  async getUserFollowing(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<any>> {
    return this.api.get(`/users/${userId}/following`, {
      params: { page, limit },
    });
  }

  /**
   * Post endpoints
   */
  async getFeed(page: number = 1, limit: number = 20): Promise<PaginatedResponse<any>> {
    return this.api.get('/posts/feed', { params: { page, limit } });
  }

  async createPost(data: {
    content: string;
    images?: string[];
  }): Promise<ApiResponse<any>> {
    return this.api.post('/posts', data);
  }

  async getPost(postId: string): Promise<ApiResponse<any>> {
    return this.api.get(`/posts/${postId}`);
  }

  async updatePost(postId: string, data: any): Promise<ApiResponse<any>> {
    return this.api.put(`/posts/${postId}`, data);
  }

  async deletePost(postId: string): Promise<ApiResponse<any>> {
    return this.api.delete(`/posts/${postId}`);
  }

  async likePost(postId: string): Promise<ApiResponse<any>> {
    return this.api.post(`/posts/${postId}/like`);
  }

  async unlikePost(postId: string): Promise<ApiResponse<any>> {
    return this.api.delete(`/posts/${postId}/like`);
  }

  async getPostComments(
    postId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<any>> {
    return this.api.get(`/posts/${postId}/comments`, {
      params: { page, limit },
    });
  }

  async addComment(
    postId: string,
    content: string
  ): Promise<ApiResponse<any>> {
    return this.api.post(`/posts/${postId}/comments`, { content });
  }

  /**
   * Chat endpoints
   */
  async getConversations(
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<any>> {
    return this.api.get('/chat/conversations', { params: { page, limit } });
  }

  async getConversationMessages(
    conversationId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<any>> {
    return this.api.get(
      `/chat/conversations/${conversationId}/messages`,
      { params: { page, limit } }
    );
  }

  async createConversation(participantId: string): Promise<ApiResponse<any>> {
    return this.api.post('/chat/conversations', { participantId });
  }

  async deleteConversation(conversationId: string): Promise<ApiResponse<any>> {
    return this.api.delete(`/chat/conversations/${conversationId}`);
  }

  async getConversationStatus(
    conversationId: string
  ): Promise<ApiResponse<any>> {
    return this.api.get(`/chat/conversations/${conversationId}/status`);
  }
}

export const apiService = new ApiService();
