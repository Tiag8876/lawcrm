import React, { useState } from 'react';
import { useStore } from '../store';
import { Link } from 'react-router-dom';
import { Search, Plus, Filter, LayoutGrid, List, ChevronRight, Phone, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

export function Leads() {
  const { leads, addLead, updateLead, kanbanStages, areasOfLaw, services } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban');
  const [selectedArea, setSelectedArea] = useState('');

  const filteredLeads = (leads || []).filter(lead => 
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.phone.includes(searchTerm)
  );

  const handleAddLead = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    addLead({
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      cpf: formData.get('cpf') as string,
      legalArea: formData.get('legalArea') as string,
      areaOfLawId: formData.get('areaOfLawId') as string,
      serviceId: formData.get('serviceId') as string,
      estimatedValue: Number(formData.get('estimatedValue')) || 0,
      status: kanbanStages.sort((a, b) => a.order - b.order)[0]?.id || 'novo',
    });
    setIsModalOpen(false);
  };

  const onDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('leadId', id);
  };

  const onDrop = (e: React.DragEvent, status: string) => {
    const leadId = e.dataTransfer.getData('leadId');
    updateLead(leadId, { status });
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const sortedStages = [...kanbanStages].sort((a, b) => a.order - b.order);

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-serif font-bold gold-text-gradient tracking-tight">
            Gestão de Leads
          </h1>
          <p className="text-stone-500 mt-2 font-medium tracking-[0.1em] uppercase text-xs">
            Pipeline de Vendas & Conversão
          </p>
        </div>
        <div className="flex gap-4">
          <div className="flex bg-[#111111] p-1 rounded-xl border border-gold-900/20">
            <button 
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'kanban' ? 'bg-gold-500 text-black shadow-lg' : 'text-stone-500 hover:text-gold-500'}`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-gold-500 text-black shadow-lg' : 'text-stone-500 hover:text-gold-500'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-3 bg-gold-500 text-black px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gold-400 transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Novo Lead
          </button>
        </div>
      </header>

      <div className="bg-[#111111] p-4 rounded-2xl border border-gold-900/20 shadow-2xl flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-gold-500/50 absolute left-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Buscar por nome, telefone ou CPF..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-black/40 border border-gold-900/10 rounded-xl text-stone-200 focus:outline-none focus:ring-2 focus:ring-gold-500/50 transition-all placeholder:text-stone-700"
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-black/40 border border-gold-900/10 rounded-xl text-stone-400 font-bold text-xs uppercase tracking-widest hover:text-gold-500 transition-all">
          <Filter className="w-5 h-5" />
          Filtros Avançados
        </button>
      </div>

      {viewMode === 'kanban' ? (
        <div className="flex gap-6 overflow-x-auto pb-6 custom-scrollbar min-h-[600px]">
          {sortedStages.map(column => (
            <div 
              key={column.id} 
              className="flex-shrink-0 w-80 flex flex-col gap-4"
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, column.id)}
            >
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(212,175,55,0.4)]" style={{ backgroundColor: column.color }}></div>
                  <h3 className="font-serif font-bold text-stone-100 tracking-wide">{column.name}</h3>
                </div>
                <span className="text-[10px] font-black text-gold-500/40 bg-gold-900/10 px-2 py-0.5 rounded-full">
                  {(filteredLeads || []).filter(l => l.status === column.id).length}
                </span>
              </div>
              
              <div className="flex-1 space-y-4 bg-gold-900/5 rounded-2xl p-3 border border-gold-900/10 min-h-[500px]">
                {(filteredLeads || []).filter(l => l.status === column.id).map(lead => (
                  <div 
                    key={lead.id}
                    draggable
                    onDragStart={(e) => onDragStart(e, lead.id)}
                    className="bg-[#1A1A1A] p-5 rounded-xl border border-gold-900/20 shadow-lg cursor-grab active:cursor-grabbing hover:border-gold-500/40 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-serif font-bold text-stone-100 group-hover:text-gold-500 transition-colors">{lead.name}</h4>
                      <Link to={`/leads/${lead.id}`} className="text-gold-500/40 hover:text-gold-500">
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[10px] text-stone-500 font-medium uppercase tracking-tighter">
                        <Phone className="w-3 h-3 text-gold-500/50" />
                        {lead.phone}
                      </div>
                      {lead.areaOfLawId && (
                        <div className="inline-block px-2 py-0.5 bg-gold-900/20 border border-gold-900/30 rounded text-[9px] font-bold text-gold-400 uppercase tracking-widest">
                          {areasOfLaw.find(a => a.id === lead.areaOfLawId)?.name}
                        </div>
                      )}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gold-900/10 flex justify-between items-center">
                      <span className="text-[10px] text-stone-600 font-bold uppercase tracking-widest">
                        {format(new Date(lead.createdAt), 'dd MMM')}
                      </span>
                      {lead.estimatedValue ? (
                        <span className="text-xs font-bold text-emerald-500">
                          R$ {lead.estimatedValue.toLocaleString()}
                        </span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#111111] rounded-2xl border border-gold-900/20 shadow-2xl overflow-hidden">
          <table className="w-full text-left text-sm text-stone-400">
            <thead className="bg-gold-900/5 text-gold-500 font-black text-[10px] uppercase tracking-[0.2em] border-b border-gold-900/10">
              <tr>
                <th className="px-8 py-5">Nome do Cliente</th>
                <th className="px-8 py-5">Área Jurídica</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Valor Est.</th>
                <th className="px-8 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold-900/10">
              {(filteredLeads || []).length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-16 text-center text-stone-600 italic font-serif text-lg">
                    Nenhum lead encontrado no pipeline.
                  </td>
                </tr>
              ) : (
                (filteredLeads || []).map((lead) => (
                  <tr key={lead.id} className="hover:bg-gold-900/5 transition-all group">
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="font-serif font-bold text-stone-100 text-base group-hover:text-gold-500 transition-colors">{lead.name}</span>
                        <span className="text-[10px] text-stone-500 mt-1 font-medium">{lead.phone}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">
                        {areasOfLaw.find(a => a.id === lead.areaOfLawId)?.name || 'Não def.'}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span 
                        className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border"
                        style={{ 
                          backgroundColor: `${kanbanStages.find(s => s.id === lead.status)?.color}20`,
                          color: kanbanStages.find(s => s.id === lead.status)?.color,
                          borderColor: `${kanbanStages.find(s => s.id === lead.status)?.color}40`
                        }}
                      >
                        {kanbanStages.find(s => s.id === lead.status)?.name || lead.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 font-bold text-emerald-500">
                      {lead.estimatedValue ? `R$ ${lead.estimatedValue.toLocaleString()}` : '-'}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <Link 
                        to={`/leads/${lead.id}`}
                        className="text-gold-500 font-black text-[10px] uppercase tracking-widest hover:text-gold-400 transition-colors"
                      >
                        Ver Perfil
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#111111] rounded-2xl p-8 w-full max-w-2xl shadow-2xl border border-gold-900/30">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-serif font-bold gold-text-gradient">Registrar Novo Lead</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-500 hover:text-gold-500">
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            <form onSubmit={handleAddLead} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-gold-500/60 uppercase tracking-widest mb-2">Nome Completo</label>
                  <input required name="name" type="text" className="w-full px-4 py-3 bg-black/40 border border-gold-900/10 rounded-xl text-stone-200 focus:ring-2 focus:ring-gold-500/50 focus:outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gold-500/60 uppercase tracking-widest mb-2">Telefone (WhatsApp)</label>
                  <input required name="phone" type="tel" className="w-full px-4 py-3 bg-black/40 border border-gold-900/10 rounded-xl text-stone-200 focus:ring-2 focus:ring-gold-500/50 focus:outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gold-500/60 uppercase tracking-widest mb-2">E-mail</label>
                  <input name="email" type="email" className="w-full px-4 py-3 bg-black/40 border border-gold-900/10 rounded-xl text-stone-200 focus:ring-2 focus:ring-gold-500/50 focus:outline-none transition-all" />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-gold-500/60 uppercase tracking-widest mb-2">Área de Atuação</label>
                  <select 
                    name="areaOfLawId" 
                    onChange={(e) => setSelectedArea(e.target.value)}
                    className="w-full px-4 py-3 bg-black/40 border border-gold-900/10 rounded-xl text-stone-200 focus:ring-2 focus:ring-gold-500/50 focus:outline-none transition-all"
                  >
                    <option value="">Selecione a Área</option>
                    {areasOfLaw.map(area => (
                      <option key={area.id} value={area.id}>{area.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gold-500/60 uppercase tracking-widest mb-2">Serviço</label>
                  <select name="serviceId" className="w-full px-4 py-3 bg-black/40 border border-gold-900/10 rounded-xl text-stone-200 focus:ring-2 focus:ring-gold-500/50 focus:outline-none transition-all">
                    <option value="">Selecione o Serviço</option>
                    {services.filter(s => s.areaOfLawId === selectedArea).map(service => (
                      <option key={service.id} value={service.id}>{service.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gold-500/60 uppercase tracking-widest mb-2">Valor Estimado do Contrato</label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-gold-500/50 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input name="estimatedValue" type="number" className="w-full pl-10 pr-4 py-3 bg-black/40 border border-gold-900/10 rounded-xl text-stone-200 focus:ring-2 focus:ring-gold-500/50 focus:outline-none transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gold-500/60 uppercase tracking-widest mb-2">CPF</label>
                  <input name="cpf" type="text" className="w-full px-4 py-3 bg-black/40 border border-gold-900/10 rounded-xl text-stone-200 focus:ring-2 focus:ring-gold-500/50 focus:outline-none transition-all" />
                </div>
              </div>
              <div className="md:col-span-2 flex justify-end gap-4 mt-8 pt-6 border-t border-gold-900/10">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-8 py-3 text-stone-500 font-black text-[10px] uppercase tracking-widest hover:text-stone-300 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-10 py-3 bg-gold-500 text-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-gold-400 transition-all shadow-xl"
                >
                  Confirmar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
