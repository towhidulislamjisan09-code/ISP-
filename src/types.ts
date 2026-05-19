export interface Package {
  id: string;
  name: string;
  speed: string; // e.g. "20 Mbps"
  price: number;
  features: string[];
}

export interface Invoice {
  id: string;
  month: string;
  amount: number;
  status: 'Paid' | 'Unpaid' | 'Pending';
  dueDate: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  status: 'Open' | 'Closed' | 'In Progress';
  date: string;
  lastUpdate: string;
}

export interface AppState {
  user: {
    name: string;
    id: string;
    status: 'Active' | 'Inactive';
    currentPackage: string;
    balance: number;
  };
  usage: {
    total: number;
    limit: number | null;
    history: { date: string; value: number }[];
  };
}
