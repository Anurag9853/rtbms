import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, LayoutDashboard, AlertTriangle, Droplets, Heart,
  BarChart2, Settings, User, Zap, LogOut, Building2,
  Users, Activity, Command, ArrowRight, Clock
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

// ── Command Registry ────────────────────────────────────────────────────────

const COMMANDS = [
  // Navigation
  { id: 'nav-overview',   group: 'Navigate', label: 'Go to Overview',       icon: LayoutDashboard, path: '/dashboard',             shortcut: 'G O' },
  { id: 'nav-emergency',  group: 'Navigate', label: 'Go to Emergency Feed',  icon: AlertTriangle,   path: '/dashboard/emergency',    shortcut: 'G E' },
  { id: 'nav-search',     group: 'Navigate', label: 'Go to Blood Search',    icon: Search,          path: '/dashboard/search',       shortcut: 'G S' },
  { id: 'nav-inventory',  group: 'Navigate', label: 'Go to Inventory',       icon: Droplets,        path: '/dashboard/inventory',    shortcut: 'G I' },
  { id: 'nav-donors',     group: 'Navigate', label: 'Go to Donor Profile',   icon: Heart,           path: '/dashboard/donors',       shortcut: 'G D' },
  { id: 'nav-analytics',  group: 'Navigate', label: 'Go to Analytics',       icon: BarChart2,       path: '/dashboard/analytics',   shortcut: 'G A' },
  { id: 'nav-chat',       group: 'Navigate', label: 'Open AI Assistant',     icon: Zap,             path: '/dashboard/chat',         shortcut: 'G C' },
  { id: 'nav-settings',   group: 'Navigate', label: 'Go to Settings',        icon: Settings,        path: '/dashboard/settings',     shortcut: 'G ,' },
  // Actions
  { id: 'act-request',    group: 'Actions',  label: 'New Blood Request',     icon: Activity,        path: '/dashboard/requests/new', shortcut: '⌘ R' },
  { id: 'act-logout',     group: 'Account',  label: 'Sign Out',              icon: LogOut,          action: 'logout',                shortcut: '' },
];

/**
 * CommandPalette — Cmd+K global search and navigation
 */
export function CommandPalette() {
  const [open, setOpen]       = useState(false);
  const [query, setQuery]     = useState('');
  const [selected, setSelected] = useState(0);
  const [history, setHistory]  = useState([]);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();

  // ── Open on Cmd+K / Ctrl+K ─────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Auto-focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelected(0);
    }
  }, [open]);

  // ── Filtering ──────────────────────────────────────────────────────────
  const filtered = query.trim()
    ? COMMANDS.filter((c) =>
        c.label.toLowerCase().includes(query.toLowerCase()) ||
        c.group.toLowerCase().includes(query.toLowerCase())
      )
    : COMMANDS;

  const grouped = filtered.reduce((acc, cmd) => {
    if (!acc[cmd.group]) acc[cmd.group] = [];
    acc[cmd.group].push(cmd);
    return acc;
  }, {});

  const flatFiltered = Object.values(grouped).flat();

  // ── Keyboard Navigation ────────────────────────────────────────────────
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, flatFiltered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flatFiltered[selected]) executeCommand(flatFiltered[selected]);
    }
  }, [flatFiltered, selected]);

  // ── Execute ────────────────────────────────────────────────────────────
  const executeCommand = useCallback((cmd) => {
    // Save to recent history
    setHistory((h) => [cmd, ...h.filter((c) => c.id !== cmd.id)].slice(0, 5));
    setOpen(false);
    setQuery('');

    if (cmd.action === 'logout') {
      logout().then(() => navigate('/login'));
    } else if (cmd.path) {
      navigate(cmd.path);
    }
  }, [navigate, logout]);

  return (
    <>
      {/* ── Trigger button (shown in TopNavbar) ──────────────────────── */}
      <button
        id="command-palette-trigger"
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/4 border border-white/8 text-white/40 hover:text-white/70 hover:border-white/15 transition-all text-sm"
        aria-label="Open command palette (Ctrl+K)"
      >
        <Search className="w-3.5 h-3.5" />
        <span>Search...</span>
        <kbd className="ml-2 flex items-center gap-0.5 text-xs text-white/20 font-mono">
          <span className="px-1 py-0.5 bg-white/5 rounded">⌘</span>
          <span className="px-1 py-0.5 bg-white/5 rounded">K</span>
        </kbd>
      </button>

      {/* ── Palette modal ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="cp-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
              onClick={() => setOpen(false)}
            />

            {/* Panel */}
            <motion.div
              key="cp-panel"
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: 'spring', stiffness: 500, damping: 40 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 w-full max-w-xl z-[201]"
            >
              <div className="glass-card rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                {/* Search input */}
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/6">
                  <Search className="w-4 h-4 text-white/40 flex-shrink-0" />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setSelected(0); }}
                    onKeyDown={handleKeyDown}
                    placeholder="Search pages, actions..."
                    className="flex-1 bg-transparent text-sm text-white placeholder-white/25 outline-none"
                    aria-label="Command palette search"
                    role="combobox"
                    aria-expanded={true}
                    aria-autocomplete="list"
                  />
                  {query && (
                    <button onClick={() => setQuery('')} className="text-xs text-white/30 hover:text-white/60">
                      Clear
                    </button>
                  )}
                  <kbd className="text-xs text-white/20 px-1.5 py-0.5 bg-white/5 rounded border border-white/8 font-mono">
                    ESC
                  </kbd>
                </div>

                {/* Results */}
                <div className="max-h-80 overflow-y-auto py-2 no-scrollbar" role="listbox">
                  {/* Recent history (when query empty) */}
                  {!query && history.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs font-semibold text-white/30 uppercase tracking-wider px-4 py-1.5 flex items-center gap-1.5">
                        <Clock className="w-3 h-3" /> Recent
                      </p>
                      {history.map((cmd, i) => (
                        <CommandItem
                          key={`recent_${cmd.id}`}
                          cmd={cmd}
                          isSelected={false}
                          onExecute={executeCommand}
                        />
                      ))}
                      <div className="border-t border-white/5 mt-2 mb-1" />
                    </div>
                  )}

                  {/* Grouped commands */}
                  {Object.entries(grouped).map(([group, cmds]) => (
                    <div key={group}>
                      <p className="text-xs font-semibold text-white/30 uppercase tracking-wider px-4 py-1.5">
                        {group}
                      </p>
                      {cmds.map((cmd) => {
                        const globalIdx = flatFiltered.indexOf(cmd);
                        return (
                          <CommandItem
                            key={cmd.id}
                            cmd={cmd}
                            isSelected={selected === globalIdx}
                            onExecute={executeCommand}
                            onHover={() => setSelected(globalIdx)}
                          />
                        );
                      })}
                    </div>
                  ))}

                  {flatFiltered.length === 0 && (
                    <p className="text-sm text-white/30 text-center py-8">
                      No results for "{query}"
                    </p>
                  )}
                </div>

                {/* Footer */}
                <div className="border-t border-white/5 px-4 py-2 flex items-center gap-4 text-xs text-white/25">
                  <span className="flex items-center gap-1"><kbd className="bg-white/5 px-1 rounded">↑↓</kbd> Navigate</span>
                  <span className="flex items-center gap-1"><kbd className="bg-white/5 px-1 rounded">↵</kbd> Select</span>
                  <span className="flex items-center gap-1"><kbd className="bg-white/5 px-1 rounded">ESC</kbd> Close</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function CommandItem({ cmd, isSelected, onExecute, onHover }) {
  const Icon = cmd.icon;
  return (
    <motion.button
      onMouseMove={onHover}
      onClick={() => onExecute(cmd)}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all cursor-pointer ${
        isSelected ? 'bg-electric-600/15 text-white' : 'text-white/60 hover:bg-white/4 hover:text-white/80'
      }`}
      role="option"
      aria-selected={isSelected}
    >
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
        isSelected ? 'bg-electric-600/25' : 'bg-white/6'
      }`}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <span className="flex-1 text-sm font-medium">{cmd.label}</span>
      {cmd.shortcut && (
        <span className="text-xs text-white/20 font-mono">{cmd.shortcut}</span>
      )}
      {isSelected && <ArrowRight className="w-3.5 h-3.5 text-electric-400" />}
    </motion.button>
  );
}
