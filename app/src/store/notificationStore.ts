/**
 * Notification Store - Zustand 알림 관리 스토어
 * 실시간 알림 및 읽음/삭제 관리
 */

import { create } from 'zustand';

export type NotificationType = 'crisis_alert' | 'reminder' | 'milestone' | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  soulId?: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

interface NotificationStore {
  // 상태
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;

  // 액션
  unreadCount: () => number;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => void;
  clearError: () => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  // 초기 상태
  notifications: [],
  isLoading: false,
  error: null,

  // 읽지 않은 알림 수 계산
  unreadCount: () => {
    return get().notifications.filter((n) => !n.isRead).length;
  },

  // 모든 알림 가져오기 (현재는 placeholder)
  fetchNotifications: async () => {
    set({ isLoading: true, error: null });
    try {
      // TODO: DB 마이그레이션 완료 후 실제 API 호출로 대체
      // const notifications = await getNotifications();

      // Placeholder: 빈 배열 반환
      set({ notifications: [], isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch notifications';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // 알림을 읽음으로 표시 (Optimistic Update)
  markAsRead: async (id: string) => {
    const previousNotifications = get().notifications;

    // Optimistic update
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
      isLoading: true,
      error: null,
    }));

    try {
      // TODO: DB 마이그레이션 완료 후 실제 API 호출로 대체
      // await markNotificationAsRead(id);

      set({ isLoading: false });
    } catch (error) {
      // 실패 시 롤백
      set({
        notifications: previousNotifications,
        error: error instanceof Error ? error.message : 'Failed to mark as read',
        isLoading: false,
      });
      throw error;
    }
  },

  // 모든 알림을 읽음으로 표시 (Optimistic Update)
  markAllAsRead: async () => {
    const previousNotifications = get().notifications;

    // Optimistic update
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      isLoading: true,
      error: null,
    }));

    try {
      // TODO: DB 마이그레이션 완료 후 실제 API 호출로 대체
      // await markAllNotificationsAsRead();

      set({ isLoading: false });
    } catch (error) {
      // 실패 시 롤백
      set({
        notifications: previousNotifications,
        error: error instanceof Error ? error.message : 'Failed to mark all as read',
        isLoading: false,
      });
      throw error;
    }
  },

  // 알림 삭제 (Optimistic Update)
  deleteNotification: async (id: string) => {
    const previousNotifications = get().notifications;

    // Optimistic update
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
      isLoading: true,
      error: null,
    }));

    try {
      // TODO: DB 마이그레이션 완료 후 실제 API 호출로 대체
      // await deleteNotificationRepo(id);

      set({ isLoading: false });
    } catch (error) {
      // 실패 시 롤백
      set({
        notifications: previousNotifications,
        error: error instanceof Error ? error.message : 'Failed to delete notification',
        isLoading: false,
      });
      throw error;
    }
  },

  // 새 알림 추가 (로컬 상태)
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `local-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    set((state) => ({
      notifications: [newNotification, ...state.notifications],
      error: null,
    }));
  },

  // 에러 초기화
  clearError: () => {
    set({ error: null });
  },
}));
