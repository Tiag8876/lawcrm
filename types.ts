export interface KanbanStage {
  id: string;
  name: string;
  color: string;
  order: number;
}

export type LeadStatus = string;

export interface AreaOfLaw {
  id: string;
  name: string;
  description?: string;
}

export interface Service {
  id: string;
  areaOfLawId: string;
  name: string;
  description?: string;
  price?: number;
}

export interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'paused';
  areaOfLawId?: string;
  serviceId?: string;
}

export interface AdGroup {
  id: string;
  campaignId: string;
  name: string;
}

export interface Ad {
  id: string;
  adGroupId: string;
  name: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
}

export interface LeadNote {
  id: string;
  type: 'message' | 'call' | 'meeting' | 'other';
  content: string;
  createdAt: string;
}

export interface FollowUp {
  id: string;
  date: string; // ISO string
  type: 'whatsapp' | 'ligacao' | 'email';
  status: 'pendente' | 'concluido';
  notes?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  date: string; // ISO string
  leadId?: string;
  status: 'pendente' | 'concluida';
  isStandard?: boolean;
}

export interface LeadLog {
  id: string;
  type: 'status_change' | 'note_added' | 'followup_scheduled' | 'followup_completed' | 'lead_created' | 'task_added' | 'task_completed';
  content: string;
  timestamp: string; // ISO string in SP time
}

export interface LeadDocument {
  id: string;
  name: string;
  url?: string;
  fileData?: string;
  type: 'pdf' | 'image' | 'doc' | 'other';
  createdAt: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  cpf?: string;
  status: LeadStatus;
  campaignId?: string;
  adGroupId?: string;
  adId?: string;
  areaOfLawId?: string;
  serviceId?: string;
  notes: LeadNote[];
  followUps: FollowUp[];
  tasks: Task[];
  logs: LeadLog[];
  documents: LeadDocument[];
  createdAt: string;
  estimatedValue?: number;
  legalArea?: string; // e.g., Trabalhista, Civil, etc.
  aiInsight?: string;
}
