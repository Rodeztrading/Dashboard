import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { VisualTrade } from '../types';

interface ImageViewerProps {
  trades: VisualTrade[];
  startIndex: number;
  onClose: () => void;
  onOpenContextMenu: (e: React.MouseEvent, trade: VisualTrade) => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ trades, startIndex, onClose, onOpenContextMenu }) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setCurrentIndex(prev => (prev + 1) % trades.length);
      } else if (e.key === 'ArrowLeft') {
        setCurrentIndex(prev => (prev - 1 + trades.length) % trades.length);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [trades.length, onClose]);

  const selectedTrade = trades[currentIndex];

  if (!selectedTrade) return null;

  const navigate = (direction: 'next' | 'prev') => {
    if (direction === 'next') {
        setCurrentIndex(prev => (prev + 1) % trades.length);
    } else {
        setCurrentIndex(prev => (prev - 1 + trades.length) % trades.length);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="relative w-full max-w-6xl h-full max-h-[90vh] flex items-center justify-center" 
        onClick={(e) => e.stopPropagation()}
        onContextMenu={(e) => onOpenContextMenu(e, selectedTrade)}
      >
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 text-white bg-red-600 rounded-full w-8 h-8 flex items-center justify-center z-20 text-xl font-bold hover:bg-red-500 transition-colors"
          aria-label="Cerrar visor de imagen"
        >
          &times;
        </button>
        
        {trades.length > 1 && (
            <>
                <button onClick={() => navigate('prev')} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-2 rounded-full z-10 text-white">&lt;</button>
                <button onClick={() => navigate('next')} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-2 rounded-full z-10 text-white">&gt;</button>
            </>
        )}

        <img
          src={`data:${selectedTrade.tradeImage.mimeType};base64,${selectedTrade.tradeImage.base64}`}
          alt={`Trade ${selectedTrade.id}`}
          className="w-auto h-auto max-w-full max-h-full object-contain rounded-lg"
        />
        <div className="absolute bottom-4 text-white bg-black/50 px-2 py-1 rounded-md text-sm">
            {currentIndex + 1} / {trades.length}
        </div>
      </div>
    </div>
  );
};


interface TradeGroup {
    id: string;
    name: string;
    tradeIds: string[];
}

interface SniperProps {
  trades: VisualTrade[];
}

const Sniper: React.FC<SniperProps> = ({ trades }) => {
  const [groups, setGroups] = useState<TradeGroup[]>(() => {
    try {
        const savedGroups = localStorage.getItem('visual-ai-journal-sniper-groups');
        return savedGroups ? JSON.parse(savedGroups) : [];
    } catch {
        return [];
    }
  });
  const [newGroupName, setNewGroupName] = useState('');
  const [viewingTradesInfo, setViewingTradesInfo] = useState<{ trades: VisualTrade[]; startIndex: number } | null>(null);
  const [activeFilterId, setActiveFilterId] = useState<string>('unclassified'); // 'all', 'unclassified', or group.id
  const [editingGroup, setEditingGroup] = useState<TradeGroup | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, trade: VisualTrade } | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('visual-ai-journal-sniper-groups', JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    if (editingGroup && editInputRef.current) {
        editInputRef.current.focus();
    }
  }, [editingGroup]);

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    if (contextMenu) {
        window.addEventListener('click', handleClickOutside);
    }
    return () => window.removeEventListener('click', handleClickOutside);
  }, [contextMenu]);

  const allGroupedTradeIds = useMemo(() => new Set(groups.flatMap(g => g.tradeIds)), [groups]);
  const unclassifiedTrades = useMemo(() => trades.filter(t => !allGroupedTradeIds.has(t.id)), [trades, allGroupedTradeIds]);
  
  const tradesById = useMemo(() => {
    const map = new Map<string, VisualTrade>();
    trades.forEach(trade => map.set(trade.id, trade));
    return map;
  }, [trades]);

  const filteredTrades = useMemo(() => {
    if (activeFilterId === 'all') return trades;
    if (activeFilterId === 'unclassified') return unclassifiedTrades;
    const group = groups.find(g => g.id === activeFilterId);
    return group ? group.tradeIds.map(id => tradesById.get(id)).filter((t): t is VisualTrade => !!t) : [];
  }, [activeFilterId, trades, groups, unclassifiedTrades, tradesById]);

  const handleCreateGroup = () => {
    if (newGroupName.trim() === '') return;
    const newGroup: TradeGroup = {
      id: `group-${Date.now()}`,
      name: newGroupName.trim(),
      tradeIds: [],
    };
    setGroups([...groups, newGroup]);
    setNewGroupName('');
  };
  
  const handleViewImage = (trades: VisualTrade[], startIndex: number) => {
    setViewingTradesInfo({ trades, startIndex });
  };
  
  const handleOpenContextMenu = (e: React.MouseEvent, trade: VisualTrade) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, trade });
  };
  
  const handleMoveTradeToGroup = (tradeId: string, groupId: string | null) => {
    setGroups(prev => {
        // Remove from any old group
        const updatedGroups = prev.map(g => ({
            ...g,
            tradeIds: g.tradeIds.filter(id => id !== tradeId)
        }));

        // Add to new group if one is selected
        if (groupId) {
            const targetGroup = updatedGroups.find(g => g.id === groupId);
            if (targetGroup) {
                targetGroup.tradeIds.push(tradeId);
            }
        }
        return updatedGroups;
    });
    setContextMenu(null);
  };

  const handleSaveGroupName = () => {
    if (!editingGroup) return;
    setGroups(prev => prev.map(g => g.id === editingGroup.id ? editingGroup : g));
    setEditingGroup(null);
  };

  const handleDeleteGroup = (groupId: string) => {
    if (window.confirm("¿Seguro que quieres eliminar este grupo? Las operaciones volverán a 'Sin Clasificar'.")) {
      setGroups(prev => prev.filter(g => g.id !== groupId));
    }
  };

  const renderTradeThumbnail = (trade: VisualTrade, onClick: () => void, onContextMenu: (e: React.MouseEvent) => void) => (
    <div
      key={trade.id}
      className="group relative cursor-pointer aspect-video"
      onClick={onClick}
      onContextMenu={onContextMenu}
    >
      <img
        src={`data:${trade.tradeImage.mimeType};base64,${trade.tradeImage.base64}`}
        alt={`Trade ${trade.id}`}
        className="w-full h-full object-cover rounded-lg border-2 border-transparent group-hover:border-cyan transition-all duration-300"
      />
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-lg">
        <p className="text-white font-bold text-lg uppercase tracking-wider">Ver</p>
      </div>
    </div>
  );
  
  const FilterButton: React.FC<{id: string, label: string, count: number}> = ({ id, label, count }) => {
    const isActive = activeFilterId === id;
    return (
      <button 
        onClick={() => setActiveFilterId(id)}
        className={`px-3 py-1 text-sm rounded-full transition-colors ${isActive ? 'bg-cyan text-background-dark font-bold' : 'bg-slate-700 hover:bg-slate-600'}`}
      >
        {label} <span className="text-xs opacity-70">{count}</span>
      </button>
    );
  };

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Controls */}
      <div className="futuristic-panel flex-shrink-0">
         <h2 className="text-xl font-bold text-glow-cyan uppercase">Organizador de Patrones</h2>
         <p className="text-sm text-text-secondary mb-3">Crea grupos, filtra tus operaciones y organízalas con clic derecho.</p>
         <div className="flex gap-2 mb-4">
            <input 
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Nombre del nuevo patrón (ej: Ruptura de Rango)"
                className="futuristic-input w-full rounded-md p-2"
                onKeyDown={(e) => e.key === 'Enter' && handleCreateGroup()}
            />
            <button onClick={handleCreateGroup} className="futuristic-button font-bold py-2 px-4 rounded-lg whitespace-nowrap">+ Crear</button>
         </div>
         <div className="flex flex-wrap items-center gap-2 border-t border-border-color pt-3">
            <span className="text-sm font-bold mr-2">Filtrar:</span>
            <FilterButton id="all" label="Todas" count={trades.length} />
            <FilterButton id="unclassified" label="Sin Clasificar" count={unclassifiedTrades.length} />
            {groups.map(group => (
                <div key={group.id} className="group relative flex items-center">
                    {editingGroup?.id === group.id ? (
                        <input
                            ref={editInputRef}
                            type="text"
                            value={editingGroup.name}
                            onChange={(e) => setEditingGroup({...editingGroup, name: e.target.value})}
                            onBlur={handleSaveGroupName}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveGroupName()}
                            className="futuristic-input text-sm !p-1 !rounded-md"
                        />
                    ) : (
                        <FilterButton id={group.id} label={group.name} count={group.tradeIds.length} />
                    )}
                    <div className="absolute -top-2 -right-2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                            onClick={() => setEditingGroup(group)} 
                            className="bg-slate-600 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center mr-1" 
                            title="Editar nombre">&#9998;</button>
                        <button 
                            onClick={() => handleDeleteGroup(group.id)} 
                            className="bg-red-600 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center"
                            title="Eliminar grupo">&times;</button>
                    </div>
                </div>
            ))}
         </div>
      </div>

      {/* Grid */}
      <div className="flex-grow overflow-y-auto pr-2">
        {filteredTrades.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {filteredTrades.map((trade, index) => renderTradeThumbnail(
                trade, 
                () => handleViewImage(filteredTrades, index),
                (e) => handleOpenContextMenu(e, trade)
              ))}
            </div>
        ) : (
            <div className="flex items-center justify-center h-full">
                <p className="text-center text-text-secondary py-4">No hay operaciones que coincidan con este filtro.</p>
            </div>
        )}
      </div>

      {/* Viewer Modal */}
      {viewingTradesInfo && (
        <ImageViewer 
          trades={viewingTradesInfo.trades}
          startIndex={viewingTradesInfo.startIndex}
          onClose={() => setViewingTradesInfo(null)}
          onOpenContextMenu={handleOpenContextMenu}
        />
      )}
      
      {/* Context Menu */}
      {contextMenu && (
        <div 
          className="fixed z-[100] bg-[#0c1322] border border-border-color rounded-md shadow-lg p-2 text-sm"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <p className="font-bold px-2 pb-1 border-b border-border-color mb-1">Mover a:</p>
          <ul className="space-y-1">
            <li>
                <button onClick={() => handleMoveTradeToGroup(contextMenu.trade.id, null)} className="w-full text-left px-2 py-1 rounded hover:bg-cyan/20">Sin Clasificar</button>
            </li>
            {groups.map(g => (
              <li key={g.id}>
                <button onClick={() => handleMoveTradeToGroup(contextMenu.trade.id, g.id)} className="w-full text-left px-2 py-1 rounded hover:bg-cyan/20">{g.name}</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Sniper;