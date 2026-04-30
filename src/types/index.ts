export type Role = 'user' | 'hr' | 'admin';

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: Role;
  site_id?: number;
  site_name?: string;
  id_lul?: string;
  is_active: boolean;
  created_at?: string;
}

export interface Site {
  id: number;
  name: string;
}

export interface BoardFile {
  id: number;
  file_name: string;
  file_path: string;
  hr_author_id: number;
  upload_date: string;
  site_ids?: number[];
  sites?: Site[];
}

export interface Communication {
  id: number;
  user_id: number;
  type_id: number;
  status: string;
  priority: string;
  created_at: string;
  user?: User;
}

export interface Ticket {
  id: number;
  user_id: number;
  type_id: number;
  status: string;
  priority: string;
  created_at: string;
  user?: User;
}

export interface ActivityLog {
  id: number;
  user_id: number;
  role: string;
  action: string;
  entity_type: string;
  entity_id: number;
  created_at: string;
}

export interface UserHistoryLog {
  id: number;
  target_user_id: number;
  modified_by_id: number;
  field_name: string;
  old_value: string;
  new_value: string;
  created_at: string;
}
