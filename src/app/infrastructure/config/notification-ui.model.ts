export type NotificationPosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

export interface PositionConfig {
  position?: NotificationPosition;
}
