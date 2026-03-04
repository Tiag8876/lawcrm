import React, { useEffect, useState } from 'react';
import { useStore } from '../store';
import { Users, PhoneCall, CheckCircle2, AlertCircle, Sparkles, MessageCircle, History, ArrowRight, ListTodo, Calendar } from 'lucide-react';
import { format, isToday } from 'date-fns';
import { Link } from 'react-router-dom';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';

export function Dashboard() {
  const { leads, services, areasOfLaw, dailyInsight, setDailyInsight } = useStore();
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);

  const totalLeads = leads.length;
  const closedLeads = leads.filter(l => l.status === 'fechado').length;
  const conversionRate = totalLeads > 0 ? Math.round((closedLeads / totalLeads) * 100) : 0;

  const todayFollowUps = leads.flatMap(lead => 
    (lead.followUps || [])
      .filter(fu => isToday(new Date(fu.date)) && fu.status === 'pendente')
      .map(fu => ({ ...fu, lead }))
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const todayTasks = leads.flatMap(lead => 
    (lead.tasks || [])
      .filter(task => isToday(new Date(task.date)) && task.status === 'pendente')
      .map(task => ({ ...task, lead }))
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Get all logs from all leads and sort by date
  const recentActivities = leads.flatMap(lead => 
    (lead.logs || []).map(log => ({ ...log, leadName: lead.name, leadId: lead.id }))
  ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  .slice(0, 10);

  useEffect(() => {
    const generateInsight = async () => {
      const today = new Date().toISOString().split('T')[0];
      if (dailyInsight?.date === today || leads.length === 0 || isGeneratingInsight) return;

      setIsGeneratingInsight(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
        
        const leadsData = leads.map(l => ({
          nome: l.name,
          status: l.status,
          valorEstimado: l.estimatedValue || 0,
          servico: services.find(s => s.id === l.serviceId)?.name || 'Não definido',
          area: areasOfLaw.find(a => a.id === l.areaOfLawId)?.name || 'Não definida',
          ultimaInteracao: l.logs?.[l.logs.length - 1]?.content || 'Nenhuma',
          insightAnteriorIA: l.aiInsight || 'Nenhum'
        }));

        const prompt = `Você é um estrategista de vendas e inteligência artificial para um escritório de advocacia.
Analise os seguintes leads e forneça um insight estratégico abrangente.
Seu insight deve:
1. Identificar os clientes mais importantes e mais engajados (maior probabilidade de conversão ou maior valor).
2. Sugerir o que fazer para cada cliente prioritário.
3. Se o cliente já tiver um 'insightAnteriorIA', reforce o que a IA já disse e construa em cima disso.
4. Analisar matematicamente/estrategicamente quais serviços são mais viáveis/lucrativos para o escritório com base nestes leads.
5. Dizer quais clientes o escritório precisa priorizar hoje.
Seja específico com nomes e baseado APENAS nos dados fornecidos. Não invente informações.
Formate a resposta em Markdown, usando tópicos curtos e diretos.
Dados: ${JSON.stringify(leadsData)}`;

        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: prompt,
        });

        if (response.text) {
          setDailyInsight({ date: today, content: response.text });
        }
      } catch (error) {
        console.error("Error generating insight:", error);
      } finally {
        setIsGeneratingInsight(false);
      }
    };

    generateInsight();
  }, [leads, dailyInsight, setDailyInsight, isGeneratingInsight]);

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-serif font-bold gold-text-gradient tracking-tight">
            Central de Comando
          </h1>
          <p className="text-stone-500 mt-2 font-medium tracking-[0.1em] uppercase text-xs">
            Performance & Gestão de Elite • Escritório de Advocacia
          </p>
        </div>
        <div className="flex gap-4">
          <div className="px-6 py-3 bg-[#111111] border border-gold-900/20 rounded-xl shadow-lg">
            <p className="text-[10px] text-gold-500/60 uppercase tracking-widest font-bold">Status do Sistema</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
              <span className="text-stone-200 text-sm font-semibold">Operacional</span>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="group bg-[#111111] p-8 rounded-2xl border border-gold-900/20 shadow-2xl hover:border-gold-500/50 transition-all duration-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold-900/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-gold-500/10 transition-colors"></div>
          <div className="relative z-10 flex items-center gap-6">
            <div className="p-4 bg-gold-900/10 text-gold-500 rounded-2xl border border-gold-900/20 group-hover:scale-110 transition-transform">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs font-bold text-gold-500/60 uppercase tracking-[0.2em]">Total de Leads</p>
              <h3 className="text-4xl font-serif font-bold text-stone-100 mt-1">{totalLeads}</h3>
            </div>
          </div>
        </div>

        <div className="group bg-[#111111] p-8 rounded-2xl border border-gold-900/20 shadow-2xl hover:border-gold-500/50 transition-all duration-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold-900/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-gold-500/10 transition-colors"></div>
          <div className="relative z-10 flex items-center gap-6">
            <div className="p-4 bg-gold-900/10 text-gold-500 rounded-2xl border border-gold-900/20 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs font-bold text-gold-500/60 uppercase tracking-[0.2em]">Contratos</p>
              <h3 className="text-4xl font-serif font-bold text-stone-100 mt-1">{closedLeads}</h3>
            </div>
          </div>
        </div>

        <div className="group bg-[#111111] p-8 rounded-2xl border border-gold-900/20 shadow-2xl hover:border-gold-500/50 transition-all duration-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold-900/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-gold-500/10 transition-colors"></div>
          <div className="relative z-10 flex items-center gap-6">
            <div className="p-4 bg-gold-900/10 text-gold-500 rounded-2xl border border-gold-900/20 group-hover:scale-110 transition-transform">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs font-bold text-gold-500/60 uppercase tracking-[0.2em]">Conversão</p>
              <h3 className="text-4xl font-serif font-bold text-stone-100 mt-1">{conversionRate}%</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Missions Column */}
        <div className="lg:col-span-2 bg-[#111111] rounded-2xl border border-gold-900/20 shadow-2xl overflow-hidden">
          <div className="p-8 border-b border-gold-900/10 flex items-center justify-between bg-gold-900/5">
            <h2 className="text-xl font-serif font-bold text-gold-100 flex items-center gap-3">
              <PhoneCall className="w-6 h-6 text-gold-500" />
              Follow-ups para Hoje
            </h2>
            <span className="bg-gold-500 text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
              {todayFollowUps.length} Pendentes
            </span>
          </div>
          
          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {todayFollowUps.length === 0 ? (
              <div className="p-16 text-center">
                <p className="text-stone-500 font-serif italic text-lg">Nenhuma missão estratégica para hoje.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gold-900/10">
                {todayFollowUps.map((fu) => (
                  <li key={fu.id} className="p-6 hover:bg-gold-900/5 transition-all duration-300 group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gold-900/10 border border-gold-900/20 flex items-center justify-center group-hover:bg-gold-500 group-hover:text-black transition-all">
                          {fu.type === 'whatsapp' ? <MessageCircle className="w-6 h-6" /> : <PhoneCall className="w-6 h-6" />}
                        </div>
                        <div>
                          <Link to={`/leads/${fu.lead.id}`} className="text-lg font-serif font-bold text-stone-100 hover:text-gold-500 transition-colors block">
                            {fu.lead.name}
                          </Link>
                          <p className="text-xs text-stone-500 mt-1 font-semibold tracking-widest uppercase">
                            {format(new Date(fu.date), "HH:mm")} • {fu.type === 'whatsapp' ? 'WhatsApp' : 'Ligação Direta'}
                          </p>
                        </div>
                      </div>
                      <Link 
                        to={`/leads/${fu.lead.id}`}
                        className="px-6 py-2.5 bg-transparent border border-gold-500/30 text-gold-500 text-[10px] font-black rounded-lg hover:bg-gold-500 hover:text-black transition-all uppercase tracking-widest"
                      >
                        Assumir Lead
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* AI Insights Column */}
        <div className="bg-[#111111] rounded-2xl border border-gold-900/20 shadow-2xl overflow-hidden flex flex-col">
          <div className="p-8 border-b border-gold-900/10 bg-gold-900/5">
            <h2 className="text-xl font-serif font-bold text-gold-100 flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-gold-500" />
              Insights da IA
            </h2>
          </div>
          <div className="p-8 flex-1 flex flex-col items-center justify-start text-left space-y-6 overflow-y-auto custom-scrollbar max-h-[600px]">
            {!dailyInsight && (
              <div className="w-full flex flex-col items-center justify-center text-center space-y-6 py-10">
                <div className="w-20 h-20 gold-gradient rounded-full flex items-center justify-center animate-pulse shadow-[0_0_30px_rgba(212,175,55,0.2)]">
                  <Sparkles className="w-10 h-10 text-black" />
                </div>
                <div>
                  <h3 className="text-2xl font-serif font-bold text-stone-100">Inteligência Preditiva</h3>
                  <p className="text-stone-300 mt-3 max-w-sm mx-auto leading-relaxed text-sm">
                    {isGeneratingInsight ? 'Analisando o pipeline...' : 'A IA está analisando seu pipeline para identificar quais leads têm maior probabilidade de fechamento imediato.'}
                  </p>
                </div>
              </div>
            )}
            
            {dailyInsight && (
              <div className="w-full">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gold-900/10">
                  <div className="w-12 h-12 gold-gradient rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                    <Sparkles className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <h3 className="text-lg font-serif font-bold text-stone-100">Análise Estratégica</h3>
                    <p className="text-xs text-gold-500/60 uppercase tracking-widest font-black">Gerado Hoje</p>
                  </div>
                </div>
                <div className="markdown-body text-stone-300 text-sm leading-relaxed space-y-4">
                  <Markdown>{dailyInsight.content}</Markdown>
                </div>
              </div>
            )}
            
            <div className="w-full flex justify-center pt-6 border-t border-gold-900/10 mt-auto">
              <Link to="/leads" className="px-8 py-3 bg-gold-500 text-black text-xs font-black rounded-xl hover:bg-gold-400 transition-all uppercase tracking-[0.2em] shadow-lg">
                Ver Todos os Leads
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Tasks Feed */}
      <section className="bg-[#111111] rounded-2xl border border-gold-900/20 shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-gold-900/10 bg-gold-900/5 flex items-center justify-between">
          <h2 className="text-xl font-serif font-bold text-gold-100 flex items-center gap-3">
            <ListTodo className="w-6 h-6 text-gold-500" />
            Tarefas de Hoje
          </h2>
          <span className="bg-gold-500 text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
            {todayTasks.length} Pendentes
          </span>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            {todayTasks.length === 0 ? (
              <p className="text-stone-500 italic md:col-span-2 text-center py-10">Nenhuma tarefa pendente para hoje.</p>
            ) : (
              todayTasks.map((task, idx) => (
                <div key={idx} className="flex gap-4 group bg-black/40 p-4 rounded-2xl border border-gold-900/10 hover:border-gold-500/30 transition-all">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-xl bg-gold-900/10 border border-gold-900/20 flex items-center justify-center text-gold-500">
                      <ListTodo className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <Link to={`/leads/${task.lead.id}`} className="text-[10px] text-stone-400 font-bold hover:text-gold-500 transition-colors uppercase tracking-widest">
                        {task.lead.name}
                      </Link>
                      {task.isStandard && (
                        <span className="text-[8px] bg-gold-900/20 text-gold-500 px-2 py-0.5 rounded uppercase tracking-widest">
                          Padrão
                        </span>
                      )}
                    </div>
                    <p className="text-stone-200 text-sm font-bold group-hover:text-gold-100 transition-colors">{task.title}</p>
                    {task.description && <p className="text-stone-500 text-xs mt-1 line-clamp-2">{task.description}</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Recent Activity Feed */}
      <section className="bg-[#111111] rounded-2xl border border-gold-900/20 shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-gold-900/10 bg-gold-900/5 flex items-center justify-between">
          <h2 className="text-xl font-serif font-bold text-gold-100 flex items-center gap-3">
            <History className="w-6 h-6 text-gold-500" />
            Atividade Recente do Pipeline
          </h2>
          <Link to="/leads" className="text-gold-500 text-[10px] font-black uppercase tracking-widest hover:underline flex items-center gap-2">
            Ver Todos <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            {recentActivities.length === 0 ? (
              <p className="text-stone-500 italic md:col-span-2 text-center py-10">Nenhuma atividade registrada ainda.</p>
            ) : (
              recentActivities.map((activity, idx) => (
                <div key={idx} className="flex gap-4 group">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-gold-500 shadow-[0_0_8px_rgba(212,175,55,0.5)]"></div>
                    <div className="w-px flex-1 bg-gold-900/20 mt-2"></div>
                  </div>
                  <div className="pb-4">
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] text-gold-500/60 font-black uppercase tracking-widest">{activity.timestamp}</p>
                      <span className="text-stone-600">•</span>
                      <Link to={`/leads/${activity.leadId}`} className="text-[10px] text-stone-400 font-bold hover:text-gold-500 transition-colors uppercase tracking-widest">
                        {activity.leadName}
                      </Link>
                    </div>
                    <p className="text-stone-200 text-sm mt-1 group-hover:text-gold-100 transition-colors">{activity.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
