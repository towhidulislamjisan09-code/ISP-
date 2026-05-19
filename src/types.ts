export interface User {
  id: number;
  username: string;
  name: string;
  phone: string;
  address?: string;
  role: 'admin' | 'customer';
  package_id?: number | null;
  status: 'Active' | 'Suspended' | 'Expired' | 'Pending';
  ip_address?: string;
  mac_address?: string;
  pppoe_username?: string;
  total_due: number;
  expiry_date?: string;
  created_at: string;
  package_name?: string;
  package_speed?: number;
}

export interface Package {
  id: number;
  name: string;
  speed: number;
  price: number;
  fup_limit?: string;
  mikrotik_profile?: string;
  description?: string;
  created_at: string;
}

export interface Bill {
  id: number;
  user_id: number;
  user_name?: string;
  user_username?: string;
  amount: number;
  billing_month: string;
  due_date: string;
  status: 'Paid' | 'Unpaid' | 'Partially Paid';
  created_at: string;
}

export interface Payment {
  id: number;
  user_id: number;
  user_name?: string;
  amount: number;
  transaction_id: string;
  payment_method: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  payment_date: string;
  notes?: string;
}

export interface Ticket {
  id: number;
  user_id: number;
  user_name?: string;
  subject: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  created_at: string;
  updated_at: string;
}

export interface Stats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  totalRevenue: number;
  totalDue: number;
  openTickets: number;
}
