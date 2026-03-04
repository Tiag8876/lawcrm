import React, { useState } from 'react';
import { useStore } from '../store';
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MessageCircle, PhoneCall, Clock, Plus, X, ListTodo } from 'lucide-react';
import { Link } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Calendar() {
  const { leads, addFollowUpToLead, addTaskToLead, kanbanStages } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [modalType, setModalType] = useState<'followup' | 'task'>('followup');

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarDays = eachDayOfInterval({
    start: startOfWeek(monthStart, { weekStartsOn: 0 }),
    end: addDays(startOfWeek(monthEnd, { weekStartsOn: 0 }), 6),
  });

  const allFollowUps = leads.flatMap(lead => 
    (lead.followUps || []).map(fu => ({ ...fu, leadName: lead.name, leadId: lead.id, itemType: 'followup' }))
  );

  const allTasks = leads.flatMap(lead => 
    (lead.tasks || []).map(task => ({ ...task, leadName: lead.name, leadId: lead.id, itemType: 'task' }))
  );

  const allItems = [...allFollowUps, ...allTasks];

  const prevMonth = () => setCurrentDate(addDays(monthStart, -1));
  const nextMonth = () => setCurrentDate(addDays(monthEnd, 1));

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setIsModalOpen(true);
  };

  // Group leads by status for the dropdown
  const groupedLeads = kanbanStages
    .sort((a, b) => a.order - b.order)
    .map(stage => ({
      stage,
      leads: leads.filter(l => l.status === stage.id)
    }))
    .filter(group => group.leads.length > 0);

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-serif font-bold gold-text-gradient tracking-tight">Agenda</h1>
          <p className="text-stone-500 mt-2 font-medium tracking-widest uppercase text-[10px]">Gestão de Compromissos & Tarefas</p>
        </div>
        <div className="flex items-center gap-4 bg-[#111111] p-2 rounded-2xl border border-gold-900/20 shadow-xl">
          <button onClick={prevMonth} className="p-2 text-gold-500 hover:bg-gold-900/10 rounded-xl transition-all">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <span className="text-stone-100 font-serif font-bold text-lg min-w-[180px] text-center uppercase tracking-widest">
            {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
          </span>
          <button onClick={nextMonth} className="p-2 text-gold-500 hover:bg-gold-900/10 rounded-xl transition-all">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Calendar Grid */}
        <div className="lg:col-span-3 bg-[#111111] rounded-3xl border border-gold-900/20 shadow-2xl overflow-hidden">
          <div className="grid grid-cols-7 border-b border-gold-900/10 bg-gold-900/5">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
              <div key={day} className="py-4 text-center text-[10px] font-black text-gold-500/60 uppercase tracking-widest">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {calendarDays.map((day, idx) => {
              const dayItems = allItems.filter(item => isSameDay(new Date(item.date), day));
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();
              
              return (
                <div 
                  key={idx} 
                  onClick={() => handleDayClick(day)}
                  className={`min-h-[140px] p-3 border-r border-b border-gold-900/10 transition-all hover:bg-gold-900/5 cursor-pointer group relative ${!isCurrentMonth ? 'opacity-20' : ''}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-sm font-bold ${isToday(day) ? 'w-8 h-8 gold-gradient text-black rounded-full flex items-center justify-center shadow-lg shadow-gold-500/20' : 'text-stone-500'}`}>
                      {format(day, 'd')}
                    </span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-gold-500/20 rounded-md text-gold-500">
                      <Plus className="w-3 h-3" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    {dayItems.slice(0, 3).map((item: any) => (
                      <div 
                        key={item.id}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link 
                          to={`/leads/${item.leadId}`}
                          className={cn(
                            "block p-1.5 rounded-lg text-[9px] font-bold uppercase tracking-tighter truncate border",
                            item.itemType === 'followup' 
                              ? (item.status === 'concluido' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-gold-500/10 border-gold-500/30 text-gold-500')
                              : (item.status === 'concluida' ? 'bg-blue-500/10 border-blue-500/30 text-blue-500' : 'bg-stone-500/10 border-stone-500/30 text-stone-400')
                          )}
                        >
                          {item.itemType === 'followup' ? 'F' : 'T'} • {format(new Date(item.date), 'HH:mm')} • {item.leadName}
                        </Link>
                      </div>
                    ))}
                    {dayItems.length > 3 && (
                      <p className="text-[8px] text-stone-600 font-black uppercase tracking-widest text-center mt-1">
                        + {dayItems.length - 3} mais
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar: Upcoming */}
        <div className="space-y-8">
          <section className="bg-[#111111] rounded-3xl border border-gold-900/20 shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gold-900/10 bg-gold-900/5">
              <h2 className="text-lg font-serif font-bold text-gold-100 flex items-center gap-3">
                <Clock className="w-5 h-5 text-gold-500" />
                Próximos Passos
              </h2>
            </div>
            <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
              {allItems
                .filter(item => new Date(item.date) >= new Date() && (item.status === 'pendente'))
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 8)
                .map((item: any) => (
                  <Link 
                    key={item.id}
                    to={`/leads/${item.leadId}`}
                    className="block p-4 bg-black/40 rounded-2xl border border-gold-900/10 hover:border-gold-500/30 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-black text-gold-500/60 uppercase tracking-widest">
                        {format(new Date(item.date), "dd 'de' MMM • HH:mm", { locale: ptBR })}
                      </span>
                      {item.itemType === 'followup' ? (
                        item.type === 'whatsapp' ? <MessageCircle className="w-4 h-4 text-emerald-500" /> : <PhoneCall className="w-4 h-4 text-gold-500" />
                      ) : (
                        <ListTodo className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                    <p className="text-stone-100 font-bold group-hover:text-gold-500 transition-colors">
                      {item.leadName}
                    </p>
                    <p className="text-[10px] text-stone-500 mt-1 italic line-clamp-1">
                      {item.itemType === 'followup' ? item.notes : (item.title || item.description)}
                    </p>
                  </Link>
                ))}
              {allItems.filter(item => new Date(item.date) >= new Date() && (item.status === 'pendente')).length === 0 && (
                <p className="text-stone-600 text-center italic py-10">Nenhum compromisso agendado.</p>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Item Modal */}
      {isModalOpen && selectedDate && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#111111] rounded-3xl p-8 w-full max-w-md shadow-2xl border border-gold-900/30">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif font-bold gold-text-gradient">
                Agendar {modalType === 'followup' ? 'Follow-up' : 'Tarefa'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-stone-600 hover:text-gold-500 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex gap-2 mb-6 p-1 bg-black/40 rounded-xl border border-gold-900/10">
              <button 
                onClick={() => setModalType('followup')}
                className={cn(
                  "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                  modalType === 'followup' ? "bg-gold-500 text-black shadow-lg" : "text-stone-500 hover:text-stone-300"
                )}
              >
                Follow-up
              </button>
              <button 
                onClick={() => setModalType('task')}
                className={cn(
                  "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                  modalType === 'task' ? "bg-gold-500 text-black shadow-lg" : "text-stone-500 hover:text-stone-300"
                )}
              >
                Tarefa
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const leadId = formData.get('leadId') as string;
              const time = formData.get('time') as string;
              const dateStr = format(selectedDate, 'yyyy-MM-dd');
              
              if (modalType === 'followup') {
                addFollowUpToLead(leadId, {
                  type: formData.get('type') as any,
                  date: `${dateStr}T${time}`,
                  notes: formData.get('notes') as string,
                });
              } else {
                addTaskToLead(leadId, {
                  title: formData.get('title') as string,
                  description: formData.get('notes') as string,
                  date: `${dateStr}T${time}`,
                });
              }
              setIsModalOpen(false);
            }} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gold-500/60 uppercase tracking-widest mb-2">Lead (Organizado por Kanban)</label>
                <select required name="leadId" className="w-full px-4 py-3 bg-black/40 border border-gold-900/10 rounded-xl text-stone-200 focus:ring-2 focus:ring-gold-500/50 focus:outline-none transition-all">
                  <option value="">Selecione o Lead</option>
                  {groupedLeads.map(group => (
                    <optgroup key={group.stage.id} label={group.stage.name.toUpperCase()} className="bg-[#111111] text-gold-500 font-black">
                      {group.leads.map(l => (
                        <option key={l.id} value={l.id} className="text-stone-200 font-normal">
                          {l.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {modalType === 'followup' ? (
                <div>
                  <label className="block text-[10px] font-black text-gold-500/60 uppercase tracking-widest mb-2">Canal de Contato</label>
                  <select name="type" className="w-full px-4 py-3 bg-black/40 border border-gold-900/10 rounded-xl text-stone-200 focus:ring-2 focus:ring-gold-500/50 focus:outline-none transition-all">
                    <option value="whatsapp">WhatsApp</option>
                    <option value="ligacao">Ligação Direta</option>
                    <option value="email">E-mail</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-[10px] font-black text-gold-500/60 uppercase tracking-widest mb-2">Título da Tarefa</label>
                  <input required name="title" type="text" placeholder="Ex: Enviar minuta de contrato" className="w-full px-4 py-3 bg-black/40 border border-gold-900/10 rounded-xl text-stone-200 focus:ring-2 focus:ring-gold-500/50 focus:outline-none transition-all" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gold-500/60 uppercase tracking-widest mb-2">Data</label>
                  <input type="text" value={format(selectedDate, 'dd/MM/yyyy')} disabled className="w-full px-4 py-3 bg-black/40 border border-gold-900/10 rounded-xl text-stone-500 focus:outline-none transition-all cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gold-500/60 uppercase tracking-widest mb-2">Hora</label>
                  <input required name="time" type="time" className="w-full px-4 py-3 bg-black/40 border border-gold-900/10 rounded-xl text-stone-200 focus:ring-2 focus:ring-gold-500/50 focus:outline-none transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gold-500/60 uppercase tracking-widest mb-2">Observações / Descrição</label>
                <textarea name="notes" placeholder="Detalhes importantes..." className="w-full px-4 py-3 bg-black/40 border border-gold-900/10 rounded-xl text-stone-200 focus:ring-2 focus:ring-gold-500/50 focus:outline-none transition-all h-24 resize-none" />
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-stone-500 font-black text-[10px] uppercase tracking-widest">Cancelar</button>
                <button type="submit" className="px-8 py-3 bg-gold-500 text-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-gold-400 transition-all shadow-xl">Agendar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
