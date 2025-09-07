export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface User extends BaseEntity {
  email: string;
  name: string;
  role: string;
  avatar?: string;
}

export interface FileUpload {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface Breadcrumb {
  label: string;
  href?: string;
  current?: boolean;
}

export interface MenuItem {
  label: string;
  href: string;
  icon?: string;
  children?: MenuItem[];
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
} 