import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Lead, Campaign, AdGroup, Ad, LeadNote, FollowUp, LeadStatus, LeadLog, LeadDocument, AreaOfLaw, Service, Task, KanbanStage } from './types';

// Helper for SP Time
const getSPTime = () => {
  return new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" });
};

const DEFAULT_STAGES: KanbanStage[] = [
  { id: 'novo', name: 'Novo Lead', color: '#D4AF37', order: 0 },
  { id: 'em_contato', name: 'Em Contato', color: '#3B82F6', order: 1 },
  { id: 'aguardando_resposta', name: 'Aguardando Resposta', color: '#F59E0B', order: 2 },
  { id: 'reuniao_agendada', name: 'Reunião Agendada', color: '#8B5CF6', order: 3 },
  { id: 'fechado', name: 'Contrato Fechado', color: '#10B981', order: 4 },
  { id: 'perdido', name: 'Perdido', color: '#EF4444', order: 5 },
];

interface AppState {
  leads: Lead[];
  campaigns: Campaign[];
  adGroups: AdGroup[];
  ads: Ad[];
  areasOfLaw: AreaOfLaw[];
  services: Service[];
  standardTasks: Omit<Task, 'date' | 'leadId' | 'status' | 'isStandard'>[];
  kanbanStages: KanbanStage[];
  
  // Actions
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'notes' | 'followUps' | 'tasks' | 'logs' | 'documents'>) => void;
  updateLead: (id: string, data: Partial<Lead>) => void;
  addNoteToLead: (leadId: string, type: LeadNote['type'], content: string) => void;
  addDocumentToLead: (leadId: string, document: Omit<LeadDocument, 'id' | 'createdAt'>) => void;
  addFollowUpToLead: (leadId: string, followUp: Omit<FollowUp, 'id' | 'status'>) => void;
  updateFollowUpStatus: (leadId: string, followUpId: string, status: 'pendente' | 'concluido') => void;
  addTaskToLead: (leadId: string, task: Omit<Task, 'id' | 'status' | 'leadId'>) => void;
  updateTaskStatus: (leadId: string, taskId: string, status: 'pendente' | 'concluida') => void;
  addLog: (leadId: string, type: LeadLog['type'], content: string) => void;
  
  addCampaign: (name: string, areaOfLawId?: string, serviceId?: string) => string;
  updateCampaign: (id: string, data: Partial<Campaign>) => void;
  addAdGroup: (campaignId: string, name: string) => void;
  updateAdGroup: (id: string, data: Partial<AdGroup>) => void;
  addAd: (adGroupId: string, name: string, mediaUrl?: string, mediaType?: 'image' | 'video') => void;
  updateAd: (id: string, data: Partial<Ad>) => void;
  
  addAreaOfLaw: (name: string, description?: string) => void;
  updateAreaOfLaw: (id: string, data: Partial<AreaOfLaw>) => void;
  deleteAreaOfLaw: (id: string) => void;
  
  addService: (areaOfLawId: string, name: string, description?: string, price?: number) => void;
  updateService: (id: string, data: Partial<Service>) => void;
  deleteService: (id: string) => void;

  addStandardTask: (title: string, description?: string) => void;
  deleteStandardTask: (id: string) => void;

  addKanbanStage: (name: string, color: string) => void;
  updateKanbanStage: (id: string, data: Partial<KanbanStage>) => void;
  deleteKanbanStage: (id: string) => void;
  reorderKanbanStages: (stages: KanbanStage[]) => void;

  dailyInsight: { date: string; content: string } | null;
  setDailyInsight: (insight: { date: string; content: string }) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      leads: [],
      campaigns: [],
      adGroups: [],
      ads: [],
      areasOfLaw: [],
      services: [],
      standardTasks: [],
      kanbanStages: DEFAULT_STAGES,
      dailyInsight: null,

      addLead: (leadData) => set((state) => {
        const id = uuidv4();
        const timestamp = new Date().toISOString();
        return {
          leads: [...state.leads, {
            ...leadData,
            id,
            createdAt: timestamp,
            notes: [],
            followUps: [],
            tasks: [],
            documents: [],
            logs: [{
              id: uuidv4(),
              type: 'lead_created',
              content: 'Lead registrado no sistema',
              timestamp: getSPTime()
            }]
          }]
        };
      }),

      updateLead: (id, data) => set((state) => ({
        leads: (state.leads || []).map(lead => {
          if (lead.id === id) {
            const logs = [...(lead.logs || [])];
            if (data.status && data.status !== lead.status) {
              const oldStage = state.kanbanStages.find(s => s.id === lead.status);
              const newStage = state.kanbanStages.find(s => s.id === data.status);
              logs.push({
                id: uuidv4(),
                type: 'status_change',
                content: `Status alterado de ${oldStage?.name || lead.status} para ${newStage?.name || data.status}`,
                timestamp: getSPTime()
              });
            }
            return { ...lead, ...data, logs };
          }
          return lead;
        })
      })),

      addNoteToLead: (leadId, type, content) => set((state) => ({
        leads: (state.leads || []).map(lead => {
          if (lead.id === leadId) {
            return {
              ...lead,
              notes: [...(lead.notes || []), { id: uuidv4(), type, content, createdAt: new Date().toISOString() }],
              logs: [...(lead.logs || []), {
                id: uuidv4(),
                type: 'note_added',
                content: `Nova observação adicionada (${type})`,
                timestamp: getSPTime()
              }]
            };
          }
          return lead;
        })
      })),

      addDocumentToLead: (leadId, document) => set((state) => ({
        leads: (state.leads || []).map(lead => {
          if (lead.id === leadId) {
            return {
              ...lead,
              documents: [...(lead.documents || []), { ...document, id: uuidv4(), createdAt: new Date().toISOString() }],
              logs: [...(lead.logs || []), {
                id: uuidv4(),
                type: 'note_added',
                content: `Documento adicionado: ${document.name}`,
                timestamp: getSPTime()
              }]
            };
          }
          return lead;
        })
      })),

      addFollowUpToLead: (leadId, followUpData) => set((state) => ({
        leads: (state.leads || []).map(lead => {
          if (lead.id === leadId) {
            return {
              ...lead,
              followUps: [...(lead.followUps || []), { ...followUpData, id: uuidv4(), status: 'pendente' }],
              logs: [...(lead.logs || []), {
                id: uuidv4(),
                type: 'followup_scheduled',
                content: `Follow-up agendado para ${new Date(followUpData.date).toLocaleDateString()}`,
                timestamp: getSPTime()
              }]
            };
          }
          return lead;
        })
      })),

      updateFollowUpStatus: (leadId, followUpId, status) => set((state) => ({
        leads: (state.leads || []).map(lead => {
          if (lead.id === leadId) {
            const followUp = (lead.followUps || []).find(f => f.id === followUpId);
            return {
              ...lead,
              followUps: (lead.followUps || []).map(fu => fu.id === followUpId ? { ...fu, status } : fu),
              logs: [...(lead.logs || []), {
                id: uuidv4(),
                type: 'followup_completed',
                content: `Follow-up ${followUp?.type} marcado como ${status}`,
                timestamp: getSPTime()
              }]
            };
          }
          return lead;
        })
      })),

      addTaskToLead: (leadId, taskData) => set((state) => ({
        leads: (state.leads || []).map(lead => {
          if (lead.id === leadId) {
            return {
              ...lead,
              tasks: [...(lead.tasks || []), { ...taskData, id: uuidv4(), status: 'pendente', leadId }],
              logs: [...(lead.logs || []), {
                id: uuidv4(),
                type: 'task_added',
                content: `Tarefa adicionada: ${taskData.title}`,
                timestamp: getSPTime()
              }]
            };
          }
          return lead;
        })
      })),

      updateTaskStatus: (leadId, taskId, status) => set((state) => ({
        leads: (state.leads || []).map(lead => {
          if (lead.id === leadId) {
            const task = (lead.tasks || []).find(t => t.id === taskId);
            return {
              ...lead,
              tasks: (lead.tasks || []).map(t => t.id === taskId ? { ...t, status } : t),
              logs: [...(lead.logs || []), {
                id: uuidv4(),
                type: 'task_completed',
                content: `Tarefa "${task?.title}" marcada como ${status}`,
                timestamp: getSPTime()
              }]
            };
          }
          return lead;
        })
      })),

      addLog: (leadId, type, content) => set((state) => ({
        leads: (state.leads || []).map(lead => lead.id === leadId ? {
          ...lead,
          logs: [...(lead.logs || []), { id: uuidv4(), type, content, timestamp: getSPTime() }]
        } : lead)
      })),

      addCampaign: (name, areaOfLawId, serviceId) => {
        const id = uuidv4();
        set((state) => ({
          campaigns: [...state.campaigns, { id, name, status: 'active', areaOfLawId, serviceId }]
        }));
        return id;
      },

      updateCampaign: (id, data) => set((state) => ({
        campaigns: state.campaigns.map(c => c.id === id ? { ...c, ...data } : c)
      })),

      addAdGroup: (campaignId, name) => set((state) => ({
        adGroups: [...state.adGroups, { id: uuidv4(), campaignId, name }]
      })),

      updateAdGroup: (id, data) => set((state) => ({
        adGroups: state.adGroups.map(ag => ag.id === id ? { ...ag, ...data } : ag)
      })),

      addAd: (adGroupId, name, mediaUrl, mediaType) => set((state) => ({
        ads: [...state.ads, { id: uuidv4(), adGroupId, name, mediaUrl, mediaType }]
      })),

      updateAd: (id, data) => set((state) => ({
        ads: state.ads.map(ad => ad.id === id ? { ...ad, ...data } : ad)
      })),

      addAreaOfLaw: (name, description) => set((state) => ({
        areasOfLaw: [...(state.areasOfLaw || []), { id: uuidv4(), name, description }]
      })),

      updateAreaOfLaw: (id, data) => set((state) => ({
        areasOfLaw: (state.areasOfLaw || []).map(a => a.id === id ? { ...a, ...data } : a)
      })),

      deleteAreaOfLaw: (id) => set((state) => ({
        areasOfLaw: (state.areasOfLaw || []).filter(a => a.id !== id)
      })),

      addService: (areaOfLawId, name, description, price) => set((state) => ({
        services: [...(state.services || []), { id: uuidv4(), areaOfLawId, name, description, price }]
      })),

      updateService: (id, data) => set((state) => ({
        services: (state.services || []).map(s => s.id === id ? { ...s, ...data } : s)
      })),

      deleteService: (id) => set((state) => ({
        services: (state.services || []).filter(s => s.id !== id)
      })),

      addStandardTask: (title, description) => set((state) => ({
        standardTasks: [...(state.standardTasks || []), { id: uuidv4(), title, description }]
      })),

      deleteStandardTask: (id) => set((state) => ({
        standardTasks: (state.standardTasks || []).filter(t => t.id !== id)
      })),

      addKanbanStage: (name, color) => set((state) => ({
        kanbanStages: [...state.kanbanStages, { id: uuidv4(), name, color, order: state.kanbanStages.length }]
      })),

      updateKanbanStage: (id, data) => set((state) => ({
        kanbanStages: state.kanbanStages.map(s => s.id === id ? { ...s, ...data } : s)
      })),

      deleteKanbanStage: (id) => set((state) => ({
        kanbanStages: state.kanbanStages.filter(s => s.id !== id)
      })),

      reorderKanbanStages: (stages) => set({ kanbanStages: stages }),

      setDailyInsight: (insight) => set({ dailyInsight: insight })
    }),
    {
      name: 'law-crm-storage',
      version: 4,
      migrate: (persistedState: any, version: number) => {
        const state = persistedState as AppState;
        if (version < 4) {
          return {
            ...state,
            leads: (state.leads || []).map(lead => ({
              ...lead,
              logs: lead.logs || [],
              notes: lead.notes || [],
              followUps: lead.followUps || [],
              tasks: lead.tasks || [],
              documents: lead.documents || [],
            })),
            campaigns: state.campaigns || [],
            adGroups: state.adGroups || [],
            ads: state.ads || [],
            areasOfLaw: state.areasOfLaw || [],
            services: state.services || [],
            standardTasks: state.standardTasks || [],
            kanbanStages: state.kanbanStages || DEFAULT_STAGES,
          };
        }
        return persistedState;
      },
    }
  )
);

