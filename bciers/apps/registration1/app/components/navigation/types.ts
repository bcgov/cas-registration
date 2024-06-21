export interface IconMap {
  Inbox: JSX.Element;
  Layers: JSX.Element;
  Wrench: JSX.Element;
  Users: JSX.Element;
}

export interface Notification {
  count: number;
  message: string;
}

export interface NotificationMap {
  industryOperator: (operatorStatus: string | undefined) => Notification;
}
