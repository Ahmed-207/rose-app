export interface NotificationState {
  isLoading: boolean;
  error: string | null;
  unreadCount: number;
  totalResults: number;
  searchQuery: string;
}
