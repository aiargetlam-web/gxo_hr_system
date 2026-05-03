/* ============================
   ROLES (oggetto completo)
============================ */
export interface Role {
  id: number;
  name: string;
  description?: string;
}

/* ============================
   USER
============================ */
export interface User {
  id: number;

  email: string;
  first_name: string;
  last_name: string;

  // 🔥 NUOVO: ruolo tramite FK
  role_id: number;
  role?: Role | null;

  // 🔥 Sito
  site_id: number | null;
  site?: {
    id: number;
    name: string;
  } | null;

  id_lul: string;
  phone: string;
  address: string;

  is_active: boolean;
  first_access: boolean;

  created_at: string;
  updated_at: string;
}

/* ============================
   USER CREATE
============================ */
export interface UserCreate {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  id_lul: string;

  role_id: number;
  site_id: number;

  password?: string; // default: Password123!
}

/* ============================
   USER UPDATE
============================ */
export interface UserUpdate {
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
  id_lul?: string;

  role_id?: number;
  site_id?: number;

  password?: string;
}

/* ============================
   SITES
============================ */
export interface Site {
  id: number;
  name: string;
}

/* ============================
   BOARD FILES
============================ */
export interface BoardFile {
  id: number;
  file_name: string;
  file_path: string;
  hr_author_id: number;
  upload_date: string;
  is_active: boolean;

  site_ids?: number[];
  sites?: Site[];
}

/* ============================
   COMMUNICATIONS
============================ */
export interface CommunicationType {
  id: number;
  name: string;
  description?: string;
  requires_attachment: boolean;
  default_priority: string;
}

export interface CommunicationMessage {
  id: number;
  communication_id: number;
  author_id: number;
  content: string;
  created_at: string;
  author?: User;
}

export interface Communication {
  id: number;
  user_id: number;
  type_id: number;
  status: string;
  priority: string;
  notes?: string;
  created_at: string;

  user?: User;
  messages?: CommunicationMessage[];
}

/* ============================
   TICKETS
============================ */
export interface TicketType {
  id: number;
  name: string;
  description?: string;
  default_priority: number;
}

export interface TicketMessage {
  id: number;
  ticket_id: number;
  author_id: number;
  content: string;
  created_at: string;
  author?: User;
}

export interface Ticket {
  id: number;
  user_id: number;
  type_id: number;
  status: string;
  priority: number;
  created_at: string;

  user?: User;
  messages?: TicketMessage[];
}

/* ============================
   LOGS
============================ */
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
