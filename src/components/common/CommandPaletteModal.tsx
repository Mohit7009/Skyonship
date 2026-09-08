import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  Package,
  Building2,
  Receipt,
  Scale,
  PlusCircle,
  FileSpreadsheet,
  Calculator,
  Wallet,
  Smartphone,
  Bell,
  ArrowRight,
  Clock,
  Trash2,
  CornerDownLeft,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import {
  GlobalSearchEngineService,
  type SearchResultItem,
  type SearchResponse,
} from '../../services/globalSearchEngineService';

export interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  portalName?: string;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  portalName = 'Customer Portal',
}) => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const role = portalName.toLowerCase().includes('admin') ? 'ADMIN' : 'CUSTOMER';
  const tenantId = 'tenant-demo-01';

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Recent Searches State
  const [recentSearches, setRecentSearches] = useState<string[]>(() =>
    GlobalSearchEngineService.getRecentSearches()
  );

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Execute Search
  const searchResponse: SearchResponse = useMemo(() => {
    return GlobalSearchEngineService.search({
      query,
      role,
      tenantId,
    });
  }, [query, role, tenantId]);

  const resultsList = searchResponse.flatResults;

  // Handle Result Select & Navigation
  const handleSelectResult = (item: SearchResultItem) => {
    if (query.trim()) {
      GlobalSearchEngineService.addRecentSearch('current-user', query);
      setRecentSearches(GlobalSearchEngineService.getRecentSearches());
    }
    onClose();
    navigate(item.route);
  };

  const handleSelectRecentSearch = (qText: string) => {
    setQuery(qText);
  };

  const handleClearHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    GlobalSearchEngineService.clearRecentSearches();
    setRecentSearches([]);
  };

  // Keyboard Shortcuts Handler (Arrow Up/Down, Enter, Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (resultsList.length > 0 ? (prev + 1) % resultsList.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (resultsList.length > 0 ? (prev - 1 + resultsList.length) % resultsList.length : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (resultsList.length > 0 && resultsList[selectedIndex]) {
          handleSelectResult(resultsList[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, resultsList, selectedIndex]);

  // Icon Helper Map
  const renderIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Package':
        return <Package size={16} style={{ color: 'var(--color-violet-main)' }} />;
      case 'Building2':
        return <Building2 size={16} style={{ color: 'var(--color-violet-main)' }} />;
      case 'Receipt':
        return <Receipt size={16} style={{ color: 'var(--color-violet-main)' }} />;
      case 'Scale':
        return <Scale size={16} style={{ color: 'var(--color-violet-main)' }} />;
      case 'PlusCircle':
        return <PlusCircle size={16} style={{ color: 'var(--color-violet-main)' }} />;
      case 'FileSpreadsheet':
        return <FileSpreadsheet size={16} style={{ color: 'var(--color-violet-main)' }} />;
      case 'Calculator':
        return <Calculator size={16} style={{ color: 'var(--color-violet-main)' }} />;
      case 'Wallet':
        return <Wallet size={16} style={{ color: 'var(--color-violet-main)' }} />;
      case 'Smartphone':
        return <Smartphone size={16} style={{ color: 'var(--color-violet-main)' }} />;
      case 'Bell':
        return <Bell size={16} style={{ color: 'var(--color-violet-main)' }} />;
      default:
        return <Search size={16} style={{ color: 'var(--color-violet-main)' }} />;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '80px',
        paddingLeft: '16px',
        paddingRight: '16px',
      }}
    >
      {/* Command Palette Card Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '640px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
          border: '1px solid var(--color-border-main)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '80vh',
        }}
      >
        {/* Search Input Box */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--color-border-main)', gap: '12px' }}>
          <Search size={20} style={{ color: 'var(--color-violet-main)' }} />
          <input
            ref={inputRef}
            type="text"
            placeholder={role === 'ADMIN' ? 'Search AWB, Order ID, Customer, GSTIN, pages...' : 'Search AWB, Order ID, Rate Calculator, GST Invoices...'}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '16px',
              fontWeight: '500',
              color: '#0f172a',
              backgroundColor: 'transparent',
            }}
          />

          <kbd style={{ backgroundColor: '#f1f5f9', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '2px 6px', fontSize: '11px', fontWeight: 'bold' }}>
            ESC
          </kbd>

          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Results / Empty / Quick Actions Scroll Container */}
        <div style={{ padding: '12px 16px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* WHEN QUERY IS EMPTY: SHOW RECENT SEARCHES & QUICK ACTIONS */}
          {!query.trim() && (
            <>
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', padding: '0 4px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={13} /> Recent Searches
                    </span>
                    <button onClick={handleClearHistory} style={{ border: 'none', background: 'none', color: 'var(--color-danger-main)', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Trash2 size={12} /> Clear History
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {recentSearches.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectRecentSearch(item)}
                        style={{
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          padding: '4px 10px',
                          fontSize: '12px',
                          color: '#334155',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <Search size={12} style={{ color: '#94a3b8' }} />
                        <span>{item}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions Shortcuts */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', padding: '0 4px' }}>
                  Recommended Shortcuts
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {resultsList.map((item, idx) => {
                    const isSelected = idx === selectedIndex;
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelectResult(item)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '8px',
                          backgroundColor: isSelected ? 'var(--color-bg-secondary)' : 'transparent',
                          borderLeft: isSelected ? '3px solid var(--color-violet-main)' : '3px solid transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {renderIcon(item.iconName)}
                          <div>
                            <strong style={{ fontSize: '13px', display: 'block', color: '#0f172a' }}>{item.title}</strong>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>{item.subtitle}</span>
                          </div>
                        </div>
                        <ArrowRight size={14} style={{ color: isSelected ? 'var(--color-violet-main)' : '#cbd5e1' }} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* WHEN QUERY HAS TEXT: SHOW CATEGORIZED SEARCH RESULTS */}
          {query.trim() && (
            <>
              {resultsList.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {resultsList.map((item, idx) => {
                    const isSelected = idx === selectedIndex;
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelectResult(item)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '8px',
                          backgroundColor: isSelected ? '#f1f5f9' : '#ffffff',
                          borderLeft: isSelected ? '3px solid var(--color-violet-main)' : '3px solid transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                          {renderIcon(item.iconName)}
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <strong style={{ fontSize: '13px', color: '#0f172a' }}>{item.title}</strong>
                              {item.score === 100 && <Badge variant="brand" style={{ fontSize: '9px', padding: '1px 5px' }}>EXACT MATCH</Badge>}
                              {item.statusLabel && <Badge variant={item.statusVariant || 'neutral'} style={{ fontSize: '10px' }}>{item.statusLabel}</Badge>}
                            </div>
                            <span style={{ fontSize: '11px', color: '#64748b', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {item.subtitle}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold' }}>{item.categoryLabel}</span>
                          <CornerDownLeft size={14} style={{ color: isSelected ? 'var(--color-violet-main)' : '#cbd5e1' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* EMPTY NO RESULTS STATE */
                <div style={{ textAlign: 'center', padding: '32px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <Search size={32} style={{ color: '#cbd5e1' }} />
                  <strong style={{ fontSize: '14px', color: '#0f172a' }}>No results found for "{query}"</strong>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                    Try searching by AWB number, Order ID, GSTIN, or page title.
                  </p>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <button onClick={() => setQuery('Rate Calculator')} style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>
                      Try "Rate Calculator"
                    </button>
                    <button onClick={() => setQuery('DEL847192031')} style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>
                      Try AWB "DEL847192031"
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Shortcut Hints */}
        <div style={{ backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', padding: '8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#64748b' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <kbd style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', padding: '1px 4px', borderRadius: '3px' }}><ChevronUp size={11} /><ChevronDown size={11} /></kbd> Navigate
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <kbd style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', padding: '1px 4px', borderRadius: '3px' }}><CornerDownLeft size={11} /></kbd> Select
            </span>
          </div>

          <div>
            Powered by <strong>Courrier3 Search Engine</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
