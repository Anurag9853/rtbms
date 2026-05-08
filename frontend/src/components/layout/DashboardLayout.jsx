import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Heart, Droplets, AlertTriangle, Search,
  BarChart2, Settings, Bell, Menu, X, ChevronLeft, ChevronRight,
  Zap, LogOut, Building2, Users, MessageSquare
} from 'lucide-react';
import { PulseDot } from '../ui/PulseDot';
import { ChatInterface } from '../chat/ChatInterface';
import { CommandPalette } from '../ui/CommandPalette';
import { useAuthStore } from '../../stores/authStore';
import { subscribeToEmergencies } from '../../services/echoService';

const navItems = [
  { path: '/dashboard',           icon: LayoutDashboard, label: 'Overview',      roles: ['admin', 'donor', 'hospital', 'blood_bank'] },
  { path: '/dashboard/donors',    icon: Heart,           label: 'Donors',        roles: ['admin', 'donor'] },
  { path: '/dashboard/inventory', icon: Droplets,        label: 'Inventory',     roles: ['admin', 'blood_bank'] },
  { path: '/dashboard/requests',  icon: Building2,       label: 'Requests',      roles: ['admin', 'hospital', 'blood_bank'] },
  { path: '/dashboard/emergency', icon: AlertTriangle,   label: 'Emergency',     roles: ['admin', 'donor', 'hospital', 'blood_bank'] },
  { path: '/dashboard/search',    icon: Search,          label: 'Blood Search',  roles: ['admin', 'donor', 'hospital', 'blood_bank'] },
  { path: '/dashboard/analytics', icon: BarChart2,       label: 'Analytics',     roles: ['admin', 'blood_bank'] },
  { path: '/dashboard/chat',      icon: MessageSquare,   label: 'AI Assistant',  roles: ['admin', 'donor', 'hospital', 'blood_bank'] },
  { path: '/dashboard/users',     icon: Users,           label: 'Users',         roles: ['admin'] },
  { path: '/dashboard/settings',  icon: Settings,        label: 'Settings',      roles: ['admin', 'donor', 'hospital', 'blood_bank'] },
];

// Fallback user for demo (pre-auth)
const DEMO_USER = { name: 'Dr. Priya Sharma', role: 'hospital', initials: 'PS', unreadNotifications: 3 };

export function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen]             = useState(false);
  const [aiOpen, setAiOpen]                     = useState(false);
  const [newEmergency, setNewEmergency]          = useState(false);
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user: authUser, logout } = useAuthStore();

  // Use real user or fall back to demo
  const user = authUser
    ? {
        name:    authUser.name,
        role:    authUser.role,
        initials: authUser.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'U',
        unreadNotifications: 0,
      }
    : DEMO_USER;

  const activeNavItems = navItems.filter((item) =>
    item.roles.includes(user.role) || user.role === 'admin'
  );

  // ── Real-time emergency listener ─────────────────────────────────────
  useEffect(() => {
    const cleanup = subscribeToEmergencies(() => {
      setNewEmergency(true);
      // Auto-clear pulse after 10s
      setTimeout(() => setNewEmergency(false), 10000);
    });
    return cleanup;
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-base-900 dark flex">
      {/* ── Command Palette (global) ─────────────────────────────────────── */}
      <CommandPalette />

      {/* ── Mobile overlay ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ── */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 72 : 240 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className={`
          fixed left-0 top-0 h-full z-50 flex flex-col
          bg-base-950 border-r border-white/6
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          transition-transform lg:transition-none
        `}
        style={{ minWidth: sidebarCollapsed ? 72 : 240, maxWidth: sidebarCollapsed ? 72 : 240 }}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 p-5 border-b border-white/6 ${sidebarCollapsed ? 'justify-center' : ''}`}>
          <div className="pulse-ring w-8 h-8 bg-crimson-700 rounded-full flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4"><path d="M12 2C12 2 5 9.5 5 14a7 7 0 0014 0C19 9.5 12 2 12 2z" /></svg>
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-base font-bold text-white whitespace-nowrap"
              >
                RTBMS
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 overflow-y-auto no-scrollbar">
          <div className="space-y-1 px-2">
            {activeNavItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path ||
                (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
              const isEmergency = item.path.includes('emergency');
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative
                    ${active
                      ? 'bg-crimson-700/20 text-crimson-400 border border-crimson-700/30'
                      : 'text-white/50 hover:text-white hover:bg-white/5 border border-transparent'
                    }
                    ${sidebarCollapsed ? 'justify-center' : ''}
                  `}
                  title={sidebarCollapsed ? item.label : undefined}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-crimson-400' : ''}`} />
                  <AnimatePresence>
                    {!sidebarCollapsed && (
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="whitespace-nowrap">
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {/* Emergency pulse */}
                  {isEmergency && (newEmergency || true) && (
                    <span className={`${sidebarCollapsed ? 'absolute top-1 right-1' : 'ml-auto'}`}>
                      <PulseDot status="critical" size="xs" />
                    </span>
                  )}
                  {/* Tooltip on collapsed */}
                  {sidebarCollapsed && (
                    <span className="absolute left-full ml-3 px-2.5 py-1 glass rounded-lg text-xs font-medium text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 border border-white/10">
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout + User */}
        <div className={`p-3 border-t border-white/6`}>
          <div className={`flex items-center gap-3 p-2 rounded-lg ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-crimson-700 to-crimson-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user.initials}
            </div>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                  <p className="text-xs text-white/40 capitalize">{user.role?.replace('_', ' ')}</p>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.button
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={handleLogout}
                  className="p-1.5 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all flex-shrink-0"
                  aria-label="Sign out"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Collapse toggle (desktop) */}
        <button
          onClick={() => setSidebarCollapsed((p) => !p)}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-base-800 border border-white/10 rounded-full items-center justify-center text-white/50 hover:text-white transition-colors z-10"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </motion.aside>

      {/* ── Main content ── */}
      <div
        className="flex-1 flex flex-col min-h-screen transition-all duration-300"
        style={{ marginLeft: `${sidebarCollapsed ? 72 : 240}px` }}
      >
        {/* ── Top navbar ── */}
        <header className="sticky top-0 z-30 bg-base-900/90 backdrop-blur-md border-b border-white/6 px-6 py-3.5 flex items-center gap-4">
          {/* Mobile menu */}
          <button
            onClick={() => setMobileOpen((p) => !p)}
            className="lg:hidden text-white/60 hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Cmd+K trigger (uses CommandPalette's built-in button) */}
          <div id="cmdpalette-slot" className="hidden md:block">
            {/* CommandPalette renders its own trigger button at #command-palette-trigger */}
            <button
              onClick={() => {
                const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true });
                window.dispatchEvent(event);
              }}
              className="flex items-center gap-2 glass border border-white/10 rounded-input px-3 py-2 text-sm text-white/40 hover:text-white/60 hover:bg-white/5 transition-all w-64"
              aria-label="Open command palette (Ctrl+K)"
            >
              <Search className="w-4 h-4" />
              <span className="flex-1 text-left">Search...</span>
              <kbd className="flex items-center gap-0.5 text-xs text-white/20 font-mono">
                <span className="px-1 py-0.5 bg-white/5 rounded border border-white/8">⌘</span>
                <span className="px-1 py-0.5 bg-white/5 rounded border border-white/8">K</span>
              </kbd>
            </button>
          </div>

          <div className="ml-auto flex items-center gap-3">
            {/* Notification bell */}
            <button
              className="relative p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              aria-label={`${user.unreadNotifications} notifications`}
            >
              <Bell className="w-4 h-4" />
              {user.unreadNotifications > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-crimson-500 rounded-full border border-base-900" />
              )}
            </button>

            {/* AI assistant button */}
            <button
              onClick={() => setAiOpen((p) => !p)}
              className="flex items-center gap-2 bg-electric-600/15 border border-electric-600/25 hover:bg-electric-600/25 text-electric-300 text-xs font-medium px-3 py-2 rounded-input transition-all"
              aria-label="Open AI assistant"
            >
              <Zap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">AI Assistant</span>
            </button>

            {/* Avatar */}
            <button
              className="w-8 h-8 rounded-full bg-gradient-to-br from-crimson-700 to-crimson-500 flex items-center justify-center text-white text-xs font-bold"
              aria-label="User menu"
            >
              {user.initials}
            </button>
          </div>
        </header>

        {/* ── Page content ── */}
        <main className="flex-1 p-6 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* ── Floating AI bubble (when chat closed) ── */}
      <AnimatePresence>
        {!aiOpen && (
          <motion.button
            key="ai-bubble"
            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
            onClick={() => setAiOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-electric-600 rounded-full flex items-center justify-center shadow-glow-blue z-50 hover:scale-110 transition-transform lg:flex hidden"
            aria-label="Open AI assistant"
            style={{ boxShadow: '0 0 30px rgba(37,99,235,0.5)' }}
          >
            <Zap className="w-6 h-6 text-white" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── AI chat overlay ── */}
      <AnimatePresence>
        {aiOpen && (
          <motion.div
            key="ai-overlay"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            className="fixed bottom-6 right-6 w-80 md:w-[420px] z-50"
          >
            <ChatInterface onClose={() => setAiOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mobile bottom nav ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-base-950/95 backdrop-blur-md border-t border-white/6 flex items-center justify-around py-2 z-40">
        {activeNavItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          return (
            <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${active ? 'text-crimson-400' : 'text-white/35 hover:text-white/60'}`}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
