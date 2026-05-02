/* ============================
   ROLES
============================ */
export type Role = "user" | "hr" | "admin";

/* ============================
   USER
============================ */
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  site_id: number | null;
  id_lul?: string | null;
  is_active: boolean;
  phone?: string | null;
  address?: string | null;
  created_at: string;
  updated_at: string;
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

  // Per la visibilità multi-sito
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
