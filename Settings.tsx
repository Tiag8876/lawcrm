import React, { useState } from 'react';
import { useStore } from '../store';
import { Plus, Trash2, Edit2, Save, X, Briefcase, ListTodo, Scale, LayoutGrid, ArrowUp, ArrowDown } from 'lucide-react';

export function Settings() {
  const {
    areasOfLaw,
    services,
    standardTasks,
    kanbanStages,
    addAreaOfLaw,
    updateAreaOfLaw,
    deleteAreaOfLaw,
    addService,
    updateService,
    deleteService,
    addStandardTask,
    deleteStandardTask,
    addKanbanStage,
    updateKanbanStage,
    deleteKanbanStage,
    reorderKanbanStages
  } = useStore();

  const [activeTab, setActiveTab] = useState<'areas' | 'services' | 'tasks' | 'kanban'>('areas');

  // Area of Law State
  const [newAreaName, setNewAreaName] = useState('');
  const [newAreaDesc, setNewAreaDesc] = useState('');

  // Service State
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceDesc, setNewServiceDesc] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [selectedAreaForService, setSelectedAreaForService] = useState('');

  // Task State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');

  // Kanban State
  const [newStageName, setNewStageName] = useState('');
  const [newStageColor, setNewStageColor] = useState('#D4AF37');
  const [editingStageId, setEditingStageId] = useState<string | null>(null);

  const handleAddArea = () => {
    if (newAreaName.trim()) {
      addAreaOfLaw(newAreaName, newAreaDesc);
      setNewAreaName('');
      setNewAreaDesc('');
    }
  };

  const handleAddService = () => {
    if (newServiceName.trim() && selectedAreaForService) {
      addService(selectedAreaForService, newServiceName, newServiceDesc, newServicePrice ? Number(newServicePrice) : undefined);
      setNewServiceName('');
      setNewServiceDesc('');
      setNewServicePrice('');
    }
  };

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      addStandardTask(newTaskTitle, newTaskDesc);
      setNewTaskTitle('');
      setNewTaskDesc('');
    }
  };

  const handleAddStage = () => {
    if (newStageName.trim()) {
      addKanbanStage(newStageName, newStageColor);
      setNewStageName('');
      setNewStageColor('#D4AF37');
    }
  };

  const moveStage = (id: string, direction: 'up' | 'down') => {
    const sortedStages = [...kanbanStages].sort((a, b) => a.order - b.order);
    const index = sortedStages.findIndex(s => s.id === id);
    if (direction === 'up' && index > 0) {
      [sortedStages[index - 1], sortedStages[index]] = [sortedStages[index], sortedStages[index - 1]];
    } else if (direction === 'down' && index < sortedStages.length - 1) {
      [sortedStages[index], sortedStages[index + 1]] = [sortedStages[index + 1], sortedStages[index]];
    }
    reorderKanbanStages(sortedStages.map((s, i) => ({ ...s, order: i })));
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-serif font-bold text-gold-500 mb-2">Configurações do Sistema</h1>
        <p className="text-stone-400">Gerencie áreas de atuação, serviços, tarefas e o fluxo do Kanban.</p>
      </div>

      <div className="flex gap-4 mb-8 border-b border-gold-900/30 pb-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('areas')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold tracking-wider uppercase text-sm transition-all whitespace-nowrap ${
            activeTab === 'areas' ? 'bg-gold-500 text-black' : 'text-stone-400 hover:text-gold-400 hover:bg-gold-900/10'
          }`}
        >
          <Scale className="w-4 h-4" />
          Áreas de Atuação
        </button>
        <button
          onClick={() => setActiveTab('services')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold tracking-wider uppercase text-sm transition-all whitespace-nowrap ${
            activeTab === 'services' ? 'bg-gold-500 text-black' : 'text-stone-400 hover:text-gold-400 hover:bg-gold-900/10'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Serviços
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold tracking-wider uppercase text-sm transition-all whitespace-nowrap ${
            activeTab === 'tasks' ? 'bg-gold-500 text-black' : 'text-stone-400 hover:text-gold-400 hover:bg-gold-900/10'
          }`}
        >
          <ListTodo className="w-4 h-4" />
          Tarefas Padrão
        </button>
        <button
          onClick={() => setActiveTab('kanban')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold tracking-wider uppercase text-sm transition-all whitespace-nowrap ${
            activeTab === 'kanban' ? 'bg-gold-500 text-black' : 'text-stone-400 hover:text-gold-400 hover:bg-gold-900/10'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          Fluxo Kanban
        </button>
      </div>

      {/* Áreas de Atuação */}
      {activeTab === 'areas' && (
        <div className="space-y-6">
          <div className="bg-[#111] p-6 rounded-xl border border-gold-900/20">
            <h2 className="text-xl font-serif text-gold-400 mb-4">Nova Área de Atuação</h2>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Nome da Área (ex: Trabalhista)"
                value={newAreaName}
                onChange={(e) => setNewAreaName(e.target.value)}
                className="flex-1 bg-black border border-gold-900/30 rounded-lg px-4 py-2 text-stone-200 focus:outline-none focus:border-gold-500"
              />
              <input
                type="text"
                placeholder="Descrição (opcional)"
                value={newAreaDesc}
                onChange={(e) => setNewAreaDesc(e.target.value)}
                className="flex-1 bg-black border border-gold-900/30 rounded-lg px-4 py-2 text-stone-200 focus:outline-none focus:border-gold-500"
              />
              <button
                onClick={handleAddArea}
                className="bg-gold-500 text-black px-6 py-2 rounded-lg font-bold hover:bg-gold-400 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Adicionar
              </button>
            </div>
          </div>

          <div className="grid gap-4">
            {areasOfLaw.map(area => (
              <div key={area.id} className="bg-[#111] p-4 rounded-xl border border-gold-900/20 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gold-100 text-lg">{area.name}</h3>
                  {area.description && <p className="text-stone-400 text-sm">{area.description}</p>}
                </div>
                <button
                  onClick={() => deleteAreaOfLaw(area.id)}
                  className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
            {areasOfLaw.length === 0 && (
              <p className="text-stone-500 text-center py-8">Nenhuma área de atuação cadastrada.</p>
            )}
          </div>
        </div>
      )}

      {/* Serviços */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          <div className="bg-[#111] p-6 rounded-xl border border-gold-900/20">
            <h2 className="text-xl font-serif text-gold-400 mb-4">Novo Serviço</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <select
                value={selectedAreaForService}
                onChange={(e) => setSelectedAreaForService(e.target.value)}
                className="bg-black border border-gold-900/30 rounded-lg px-4 py-2 text-stone-200 focus:outline-none focus:border-gold-500"
              >
                <option value="">Selecione a Área de Atuação</option>
                {areasOfLaw.map(area => (
                  <option key={area.id} value={area.id}>{area.name}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Nome do Serviço (ex: Divórcio Litigioso)"
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
                className="bg-black border border-gold-900/30 rounded-lg px-4 py-2 text-stone-200 focus:outline-none focus:border-gold-500"
              />
              <input
                type="text"
                placeholder="Descrição (opcional)"
                value={newServiceDesc}
                onChange={(e) => setNewServiceDesc(e.target.value)}
                className="bg-black border border-gold-900/30 rounded-lg px-4 py-2 text-stone-200 focus:outline-none focus:border-gold-500"
              />
              <input
                type="number"
                placeholder="Valor Estimado (opcional)"
                value={newServicePrice}
                onChange={(e) => setNewServicePrice(e.target.value)}
                className="bg-black border border-gold-900/30 rounded-lg px-4 py-2 text-stone-200 focus:outline-none focus:border-gold-500"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleAddService}
                disabled={!selectedAreaForService || !newServiceName}
                className="bg-gold-500 text-black px-6 py-2 rounded-lg font-bold hover:bg-gold-400 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" /> Adicionar Serviço
              </button>
            </div>
          </div>

          <div className="grid gap-4">
            {services.map(service => {
              const area = areasOfLaw.find(a => a.id === service.areaOfLawId);
              return (
                <div key={service.id} className="bg-[#111] p-4 rounded-xl border border-gold-900/20 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-gold-500 bg-gold-900/20 px-2 py-1 rounded">
                        {area?.name || 'Área Desconhecida'}
                      </span>
                      {service.price && (
                        <span className="text-xs font-mono text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">
                          R$ {service.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-gold-100 text-lg">{service.name}</h3>
                    {service.description && <p className="text-stone-400 text-sm">{service.description}</p>}
                  </div>
                  <button
                    onClick={() => deleteService(service.id)}
                    className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              );
            })}
            {services.length === 0 && (
              <p className="text-stone-500 text-center py-8">Nenhum serviço cadastrado.</p>
            )}
          </div>
        </div>
      )}

      {/* Tarefas Padrão */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          <div className="bg-[#111] p-6 rounded-xl border border-gold-900/20">
            <h2 className="text-xl font-serif text-gold-400 mb-4">Nova Tarefa Padrão</h2>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Título da Tarefa (ex: Enviar Contrato)"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="flex-1 bg-black border border-gold-900/30 rounded-lg px-4 py-2 text-stone-200 focus:outline-none focus:border-gold-500"
              />
              <input
                type="text"
                placeholder="Descrição (opcional)"
                value={newTaskDesc}
                onChange={(e) => setNewTaskDesc(e.target.value)}
                className="flex-1 bg-black border border-gold-900/30 rounded-lg px-4 py-2 text-stone-200 focus:outline-none focus:border-gold-500"
              />
              <button
                onClick={handleAddTask}
                className="bg-gold-500 text-black px-6 py-2 rounded-lg font-bold hover:bg-gold-400 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Adicionar
              </button>
            </div>
          </div>

          <div className="grid gap-4">
            {standardTasks.map(task => (
              <div key={task.id} className="bg-[#111] p-4 rounded-xl border border-gold-900/20 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gold-100 text-lg">{task.title}</h3>
                  {task.description && <p className="text-stone-400 text-sm">{task.description}</p>}
                </div>
                <button
                  onClick={() => deleteStandardTask(task.id)}
                  className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
            {standardTasks.length === 0 && (
              <p className="text-stone-500 text-center py-8">Nenhuma tarefa padrão cadastrada.</p>
            )}
          </div>
        </div>
      )}

      {/* Fluxo Kanban */}
      {activeTab === 'kanban' && (
        <div className="space-y-6">
          <div className="bg-[#111] p-6 rounded-xl border border-gold-900/20">
            <h2 className="text-xl font-serif text-gold-400 mb-4">Nova Etapa do Kanban</h2>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Nome da Etapa (ex: Triagem)"
                value={newStageName}
                onChange={(e) => setNewStageName(e.target.value)}
                className="flex-1 bg-black border border-gold-900/30 rounded-lg px-4 py-2 text-stone-200 focus:outline-none focus:border-gold-500"
              />
              <input
                type="color"
                value={newStageColor}
                onChange={(e) => setNewStageColor(e.target.value)}
                className="w-12 h-10 bg-black border border-gold-900/30 rounded-lg p-1 cursor-pointer"
              />
              <button
                onClick={handleAddStage}
                className="bg-gold-500 text-black px-6 py-2 rounded-lg font-bold hover:bg-gold-400 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Adicionar
              </button>
            </div>
          </div>

          <div className="grid gap-4">
            {[...kanbanStages].sort((a, b) => a.order - b.order).map((stage, index, arr) => (
              <div key={stage.id} className="bg-[#111] p-4 rounded-xl border border-gold-900/20 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col gap-1">
                    <button 
                      disabled={index === 0}
                      onClick={() => moveStage(stage.id, 'up')}
                      className="p-1 text-stone-600 hover:text-gold-500 disabled:opacity-0 transition-all"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button 
                      disabled={index === arr.length - 1}
                      onClick={() => moveStage(stage.id, 'down')}
                      className="p-1 text-stone-600 hover:text-gold-500 disabled:opacity-0 transition-all"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="w-3 h-10 rounded-full" style={{ backgroundColor: stage.color }}></div>
                  {editingStageId === stage.id ? (
                    <div className="flex items-center gap-2">
                      <input 
                        type="text" 
                        defaultValue={stage.name}
                        onBlur={(e) => {
                          updateKanbanStage(stage.id, { name: e.target.value });
                          setEditingStageId(null);
                        }}
                        autoFocus
                        className="bg-black border border-gold-500 rounded px-2 py-1 text-stone-100"
                      />
                      <input 
                        type="color" 
                        defaultValue={stage.color}
                        onChange={(e) => updateKanbanStage(stage.id, { color: e.target.value })}
                        className="w-8 h-8 bg-black border border-gold-900/30 rounded cursor-pointer"
                      />
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-bold text-gold-100 text-lg flex items-center gap-2">
                        {stage.name}
                        <button onClick={() => setEditingStageId(stage.id)} className="opacity-0 group-hover:opacity-100 p-1 text-stone-600 hover:text-gold-500 transition-all">
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </h3>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    if (confirm('Tem certeza que deseja excluir esta etapa? Leads nesta etapa ficarão órfãos.')) {
                      deleteKanbanStage(stage.id);
                    }
                  }}
                  className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
