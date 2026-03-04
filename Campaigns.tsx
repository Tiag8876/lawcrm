import React, { useState, useRef } from 'react';
import { useStore } from '../store';
import { Plus, ChevronDown, ChevronRight, Image as ImageIcon, Video, Folder, Layers, LayoutGrid, X, Upload, Megaphone, Target, MousePointer2, Edit2 } from 'lucide-react';

export function Campaigns() {
  const { campaigns, adGroups, ads, areasOfLaw, services, addCampaign, updateCampaign, addAdGroup, updateAdGroup, addAd, updateAd } = useStore();
  
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newCampaignAreaId, setNewCampaignAreaId] = useState('');
  const [newCampaignServiceId, setNewCampaignServiceId] = useState('');
  const [newAdGroupNames, setNewAdGroupNames] = useState<string[]>([]);
  
  const [expandedCampaigns, setExpandedCampaigns] = useState<Record<string, boolean>>({});
  const [expandedAdGroups, setExpandedAdGroups] = useState<Record<string, boolean>>({});

  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [editingAdId, setEditingAdId] = useState<string | null>(null);
  const [selectedAdGroupIdForAd, setSelectedAdGroupIdForAd] = useState('');
  const [newAdName, setNewAdName] = useState('');
  const [newAdMediaUrl, setNewAdMediaUrl] = useState('');
  const [newAdMediaType, setNewAdMediaType] = useState<'image' | 'video'>('image');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleCampaign = (id: string) => {
    setExpandedCampaigns(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAdGroup = (id: string) => {
    setExpandedAdGroups(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const availableServices = services.filter(s => s.areaOfLawId === newCampaignAreaId);

  const openEditCampaignModal = (campaign: any) => {
    setEditingCampaignId(campaign.id);
    setNewCampaignName(campaign.name);
    setNewCampaignAreaId(campaign.areaOfLawId || '');
    setNewCampaignServiceId(campaign.serviceId || '');
    setNewAdGroupNames([]);
    setIsCampaignModalOpen(true);
  };

  const openEditAdModal = (ad: any) => {
    setEditingAdId(ad.id);
    setSelectedAdGroupIdForAd(ad.adGroupId);
    setNewAdName(ad.name);
    setNewAdMediaUrl(ad.mediaUrl || '');
    setNewAdMediaType(ad.mediaType || 'image');
    setIsAdModalOpen(true);
  };

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-serif font-bold gold-text-gradient tracking-tight">Campanhas Ativas</h1>
          <p className="text-stone-500 mt-2 font-medium tracking-widest uppercase text-[10px]">Arquitetura de Conversão & Criativos</p>
        </div>
        <button 
          onClick={() => {
            setEditingCampaignId(null);
            setNewCampaignName('');
            setNewCampaignAreaId('');
            setNewCampaignServiceId('');
            setNewAdGroupNames([]);
            setIsCampaignModalOpen(true);
          }}
          className="flex items-center gap-3 bg-gold-500 text-black px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gold-400 transition-all shadow-lg shadow-gold-500/20"
        >
          <Plus className="w-5 h-5" />
          Nova Campanha
        </button>
      </header>

      <div className="space-y-6">
        {(campaigns || []).length === 0 ? (
          <div className="p-20 text-center bg-[#111111] rounded-3xl border-2 border-dashed border-gold-900/20">
            <Megaphone className="w-16 h-16 text-gold-900/40 mx-auto mb-6" />
            <p className="text-stone-500 font-serif italic text-xl">Nenhuma campanha estratégica ativa.</p>
            <button 
              onClick={() => {
                setEditingCampaignId(null);
                setNewCampaignName('');
                setNewCampaignAreaId('');
                setNewCampaignServiceId('');
                setNewAdGroupNames([]);
                setIsCampaignModalOpen(true);
              }}
              className="mt-6 text-gold-500 font-black text-[10px] uppercase tracking-widest hover:underline"
            >
              Iniciar Primeira Campanha
            </button>
          </div>
        ) : (
          (campaigns || []).map(campaign => {
            const area = areasOfLaw.find(a => a.id === campaign.areaOfLawId);
            const service = services.find(s => s.id === campaign.serviceId);
            return (
            <div key={campaign.id} className="bg-[#111111] rounded-3xl border border-gold-900/20 shadow-2xl overflow-hidden group">
              <div className="w-full flex items-center justify-between p-6 hover:bg-gold-900/5 transition-all">
                <button 
                  onClick={() => toggleCampaign(campaign.id)}
                  className="flex-1 flex items-center gap-4 text-left"
                >
                  <div className="w-12 h-12 rounded-xl bg-gold-900/10 border border-gold-900/20 flex items-center justify-center text-gold-500">
                    <Folder className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-serif font-bold text-stone-100">{campaign.name}</h2>
                    <div className="flex gap-2 mt-1">
                      <p className="text-[10px] text-gold-500/60 font-black uppercase tracking-widest">
                        {(adGroups || []).filter(ag => ag.campaignId === campaign.id).length} Conjuntos de Anúncios
                      </p>
                      {area && (
                        <span className="text-[10px] bg-gold-900/20 text-gold-500 px-2 rounded uppercase tracking-widest">
                          {area.name}
                        </span>
                      )}
                      {service && (
                        <span className="text-[10px] bg-emerald-900/20 text-emerald-500 px-2 rounded uppercase tracking-widest">
                          {service.name}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditCampaignModal(campaign);
                    }}
                    className="p-2 text-stone-500 hover:text-gold-500 transition-colors"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button onClick={() => toggleCampaign(campaign.id)}>
                    {expandedCampaigns[campaign.id] ? <ChevronDown className="w-6 h-6 text-gold-500" /> : <ChevronRight className="w-6 h-6 text-stone-600" />}
                  </button>
                </div>
              </div>

              {expandedCampaigns[campaign.id] && (
                <div className="p-6 pt-0 space-y-4 bg-black/20 border-t border-gold-900/10">
                  {(adGroups || []).filter(ag => ag.campaignId === campaign.id).map(ag => (
                    <div key={ag.id} className="bg-[#161616] rounded-2xl border border-gold-900/10 overflow-hidden">
                      <div className="w-full flex items-center justify-between p-4 hover:bg-gold-900/5 transition-all">
                        <button 
                          onClick={() => toggleAdGroup(ag.id)}
                          className="flex-1 flex items-center gap-3 text-left"
                        >
                          <Target className="w-5 h-5 text-gold-500/60" />
                          <span className="font-bold text-stone-200 text-sm tracking-wide">{ag.name}</span>
                        </button>
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              const newName = prompt('Editar nome do Conjunto de Anúncios:', ag.name);
                              if (newName && newName.trim()) {
                                updateAdGroup(ag.id, { name: newName.trim() });
                              }
                            }}
                            className="p-1 text-stone-500 hover:text-gold-500 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => toggleAdGroup(ag.id)}>
                            {expandedAdGroups[ag.id] ? <ChevronDown className="w-4 h-4 text-gold-500/50" /> : <ChevronRight className="w-4 h-4 text-stone-700" />}
                          </button>
                        </div>
                      </div>

                      {expandedAdGroups[ag.id] && (
                        <div className="p-4 pt-0 space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                            {(ads || []).filter(a => a.adGroupId === ag.id).map(ad => (
                              <div key={ad.id} className="bg-black/40 p-3 rounded-2xl border border-gold-900/10 flex flex-col gap-3 group/ad hover:border-gold-500/30 transition-all relative">
                                <div className="absolute top-4 right-4 z-20 opacity-0 group-hover/ad:opacity-100 transition-opacity">
                                  <button 
                                    onClick={() => openEditAdModal(ad)}
                                    className="p-2 bg-black/80 rounded-lg text-gold-500 hover:bg-gold-500 hover:text-black transition-all"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                </div>
                                <div className="relative aspect-video rounded-xl overflow-hidden border border-gold-900/20 bg-black">
                                  {ad.mediaUrl ? (
                                    ad.mediaType === 'video' ? (
                                      <video src={ad.mediaUrl} className="w-full h-full object-cover" />
                                    ) : (
                                      <img src={ad.mediaUrl} alt={ad.name} className="w-full h-full object-cover" />
                                    )
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gold-900/20">
                                      <LayoutGrid className="w-8 h-8" />
                                    </div>
                                  )}
                                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/ad:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                    <MousePointer2 className="w-6 h-6 text-gold-500" />
                                  </div>
                                </div>
                                <p className="font-bold text-stone-400 text-[10px] uppercase tracking-widest truncate px-1">{ad.name}</p>
                              </div>
                            ))}
                            
                            <button 
                              onClick={() => {
                                setEditingAdId(null);
                                setSelectedAdGroupIdForAd(ag.id);
                                setNewAdName('');
                                setNewAdMediaUrl('');
                                setNewAdMediaType('image');
                                setIsAdModalOpen(true);
                              }}
                              className="aspect-video border-2 border-dashed border-gold-900/10 rounded-2xl flex flex-col items-center justify-center gap-2 text-gold-900/40 hover:text-gold-500 hover:border-gold-500/30 hover:bg-gold-900/5 transition-all"
                            >
                              <Plus className="w-6 h-6" />
                              <span className="text-[10px] font-black uppercase tracking-widest">Novo Criativo</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  <button 
                    onClick={() => {
                      const name = prompt('Nome do novo Conjunto de Anúncios:');
                      if (name?.trim()) {
                        addAdGroup(campaign.id, name.trim());
                      }
                    }}
                    className="flex items-center gap-2 text-[10px] font-black text-gold-500/60 hover:text-gold-500 uppercase tracking-widest px-4 py-2 rounded-xl border border-gold-900/10 hover:border-gold-500/30 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Conjunto
                  </button>
                </div>
              )}
            </div>
          );
        })
        )}
      </div>

      {/* Campaign Creation/Edit Modal */}
      {isCampaignModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#111111] rounded-3xl p-8 w-full max-w-md shadow-2xl border border-gold-900/30 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-serif font-bold gold-text-gradient">{editingCampaignId ? 'Editar Campanha' : 'Nova Campanha'}</h2>
              <button onClick={() => setIsCampaignModalOpen(false)} className="p-2 text-stone-600 hover:text-gold-500 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              if (newCampaignName.trim()) {
                if (editingCampaignId) {
                  updateCampaign(editingCampaignId, {
                    name: newCampaignName.trim(),
                    areaOfLawId: newCampaignAreaId || undefined,
                    serviceId: newCampaignServiceId || undefined
                  });
                } else {
                  const campaignId = addCampaign(newCampaignName.trim(), newCampaignAreaId || undefined, newCampaignServiceId || undefined);
                  newAdGroupNames.forEach(name => {
                    if (name.trim()) {
                      addAdGroup(campaignId, name.trim());
                    }
                  });
                  setExpandedCampaigns(prev => ({ ...prev, [campaignId]: true }));
                }
                setIsCampaignModalOpen(false);
                setNewCampaignName('');
                setNewCampaignAreaId('');
                setNewCampaignServiceId('');
                setNewAdGroupNames([]);
                setEditingCampaignId(null);
              }
            }} className="space-y-8">
              <div>
                <label className="block text-[10px] font-black text-gold-500/60 uppercase tracking-widest mb-2">Nome da Campanha</label>
                <input 
                  required 
                  value={newCampaignName}
                  onChange={(e) => setNewCampaignName(e.target.value)}
                  type="text" 
                  placeholder="Ex: Captação Trabalhista - Elite"
                  className="w-full px-4 py-3 bg-black/40 border border-gold-900/10 rounded-xl text-stone-200 focus:ring-2 focus:ring-gold-500/50 focus:outline-none transition-all" 
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gold-500/60 uppercase tracking-widest mb-2">Área de Atuação (Opcional)</label>
                <select
                  value={newCampaignAreaId}
                  onChange={(e) => {
                    setNewCampaignAreaId(e.target.value);
                    setNewCampaignServiceId('');
                  }}
                  className="w-full px-4 py-3 bg-black/40 border border-gold-900/10 rounded-xl text-stone-200 focus:ring-2 focus:ring-gold-500/50 focus:outline-none transition-all"
                >
                  <option value="">Selecione uma área</option>
                  {areasOfLaw.map(area => (
                    <option key={area.id} value={area.id}>{area.name}</option>
                  ))}
                </select>
              </div>

              {newCampaignAreaId && (
                <div>
                  <label className="block text-[10px] font-black text-gold-500/60 uppercase tracking-widest mb-2">Serviço (Opcional)</label>
                  <select
                    value={newCampaignServiceId}
                    onChange={(e) => setNewCampaignServiceId(e.target.value)}
                    className="w-full px-4 py-3 bg-black/40 border border-gold-900/10 rounded-xl text-stone-200 focus:ring-2 focus:ring-gold-500/50 focus:outline-none transition-all"
                  >
                    <option value="">Selecione um serviço</option>
                    {availableServices.map(service => (
                      <option key={service.id} value={service.id}>{service.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {!editingCampaignId && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-[10px] font-black text-gold-500/60 uppercase tracking-widest">Conjuntos de Anúncios</label>
                    <button 
                      type="button"
                      onClick={() => setNewAdGroupNames([...newAdGroupNames, ''])}
                      className="text-[10px] font-black text-gold-500 hover:text-gold-400 flex items-center gap-1 uppercase tracking-widest"
                    >
                      <Plus className="w-3 h-3" /> Adicionar
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {newAdGroupNames.map((name, index) => (
                      <div key={index} className="flex gap-2">
                        <input 
                          value={name}
                          onChange={(e) => {
                            const newNames = [...newAdGroupNames];
                            newNames[index] = e.target.value;
                            setNewAdGroupNames(newNames);
                          }}
                          type="text" 
                          placeholder={`Conjunto ${index + 1}`}
                          className="flex-1 px-4 py-3 bg-black/40 border border-gold-900/10 rounded-xl text-stone-200 text-sm focus:ring-2 focus:ring-gold-500/50 focus:outline-none transition-all" 
                        />
                        <button 
                          type="button"
                          onClick={() => setNewAdGroupNames(newAdGroupNames.filter((_, i) => i !== index))}
                          className="p-3 text-stone-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {newAdGroupNames.length === 0 && (
                      <p className="text-xs text-stone-600 italic text-center py-4 border border-dashed border-gold-900/10 rounded-xl">Nenhum conjunto definido.</p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-4 pt-6 border-t border-gold-900/10">
                <button 
                  type="button" 
                  onClick={() => setIsCampaignModalOpen(false)}
                  className="px-6 py-2 text-stone-500 font-black text-[10px] uppercase tracking-widest"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-8 py-3 bg-gold-500 text-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-gold-400 transition-all shadow-xl"
                >
                  {editingCampaignId ? 'Salvar Alterações' : 'Criar Campanha'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ad Creation/Edit Modal */}
      {isAdModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#111111] rounded-3xl p-8 w-full max-w-md shadow-2xl border border-gold-900/30">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-serif font-bold gold-text-gradient">{editingAdId ? 'Editar Criativo' : 'Novo Criativo'}</h2>
              <button onClick={() => {
                setIsAdModalOpen(false);
                setNewAdName('');
                setNewAdMediaUrl('');
                setEditingAdId(null);
              }} className="p-2 text-stone-600 hover:text-gold-500 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              if (newAdName.trim()) {
                if (editingAdId) {
                  updateAd(editingAdId, {
                    name: newAdName.trim(),
                    mediaUrl: newAdMediaUrl,
                    mediaType: newAdMediaType
                  });
                } else {
                  addAd(selectedAdGroupIdForAd, newAdName.trim(), newAdMediaUrl, newAdMediaType);
                }
                setIsAdModalOpen(false);
                setNewAdName('');
                setNewAdMediaUrl('');
                setEditingAdId(null);
              }
            }} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gold-500/60 uppercase tracking-widest mb-2">Nome do Criativo</label>
                <input 
                  required 
                  value={newAdName}
                  onChange={(e) => setNewAdName(e.target.value)}
                  type="text" 
                  placeholder="Ex: AD 01 - Prova Social"
                  className="w-full px-4 py-3 bg-black/40 border border-gold-900/10 rounded-xl text-stone-200 focus:ring-2 focus:ring-gold-500/50 focus:outline-none transition-all" 
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gold-500/60 uppercase tracking-widest mb-4">Formato da Mídia</label>
                
                <div className="flex gap-4 mb-6">
                  <button 
                    type="button" 
                    onClick={() => setNewAdMediaType('image')}
                    className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 border text-[10px] font-black uppercase tracking-widest transition-all ${newAdMediaType === 'image' ? 'bg-gold-500 text-black border-gold-500 shadow-lg shadow-gold-500/20' : 'bg-black/40 text-stone-500 border-gold-900/10 hover:border-gold-500/30'}`}
                  >
                    <ImageIcon className="w-4 h-4" /> Imagem
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setNewAdMediaType('video')}
                    className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 border text-[10px] font-black uppercase tracking-widest transition-all ${newAdMediaType === 'video' ? 'bg-gold-500 text-black border-gold-500 shadow-lg shadow-gold-500/20' : 'bg-black/40 text-stone-500 border-gold-900/10 hover:border-gold-500/30'}`}
                  >
                    <Video className="w-4 h-4" /> Vídeo
                  </button>
                </div>

                <div className="space-y-4">
                  <input 
                    type="url" 
                    value={newAdMediaUrl}
                    onChange={(e) => setNewAdMediaUrl(e.target.value)}
                    placeholder="Cole a URL da mídia (CDN)..."
                    className="w-full px-4 py-3 bg-black/40 border border-gold-900/10 rounded-xl text-stone-200 text-sm focus:ring-2 focus:ring-gold-500/50 focus:outline-none transition-all"
                  />
                  
                  <div className="flex items-center gap-4">
                    <div className="h-px bg-gold-900/10 flex-1"></div>
                    <span className="text-[8px] text-stone-600 font-black uppercase tracking-widest">OU</span>
                    <div className="h-px bg-gold-900/10 flex-1"></div>
                  </div>

                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-4 border-2 border-dashed border-gold-900/10 rounded-2xl flex flex-col items-center justify-center gap-2 text-stone-500 hover:bg-gold-900/5 hover:border-gold-500/30 transition-all"
                  >
                    <Upload className="w-5 h-5 text-gold-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Upload de Arquivo</span>
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden" 
                    accept={newAdMediaType === 'image' ? "image/*" : "video/*"}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setNewAdMediaUrl(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>

                {newAdMediaUrl && (
                  <div className="mt-6 p-3 border border-gold-900/10 rounded-2xl bg-black/40">
                    <p className="text-[8px] font-black text-gold-500/60 uppercase tracking-widest mb-3">Pré-visualização</p>
                    {newAdMediaType === 'video' ? (
                      <video src={newAdMediaUrl} controls className="w-full aspect-video object-cover rounded-xl bg-black border border-gold-900/10" />
                    ) : (
                      <img src={newAdMediaUrl} alt="Preview" className="w-full aspect-video object-cover rounded-xl border border-gold-900/10" />
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-gold-900/10">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsAdModalOpen(false);
                    setNewAdName('');
                    setNewAdMediaUrl('');
                    setEditingAdId(null);
                  }}
                  className="px-6 py-2 text-stone-500 font-black text-[10px] uppercase tracking-widest"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-8 py-3 bg-gold-500 text-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-gold-400 transition-all shadow-xl"
                >
                  {editingAdId ? 'Salvar Alterações' : 'Salvar Criativo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

