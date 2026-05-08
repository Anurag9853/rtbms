import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// ── Layout ──────────────────────────────────────────────────────────────────
import { DashboardLayout } from './components/layout/DashboardLayout';

import { ProtectedRoute, GuestRoute } from './components/auth/ProtectedRoute';

// ── Eager-loaded (critical path) ────────────────────────────────────────────
import { LandingPage }    from './pages/LandingPage';
import { LoginPage }      from './pages/auth/LoginPage';
import { RegisterPage }   from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { DashboardOverview } from './pages/dashboard/DashboardOverview';

// ── Lazy-loaded routes (code splitting) ──────────────────────────────────────
const BloodSearch    = lazy(() => import('./pages/dashboard/BloodSearch').then(m => ({ default: m.BloodSearch })));
const EmergencyFeed  = lazy(() => import('./pages/dashboard/EmergencyFeed').then(m => ({ default: m.EmergencyFeed })));
const DonorProfile   = lazy(() => import('./pages/dashboard/DonorProfile').then(m => ({ default: m.DonorProfile })));
const InventoryPage  = lazy(() => import('./pages/dashboard/InventoryPage').then(m => ({ default: m.InventoryPage })));
const RequestsPage   = lazy(() => import('./pages/dashboard/RequestsPage').then(m => ({ default: m.RequestsPage })));
const AnalyticsPage  = lazy(() => import('./pages/dashboard/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const SettingsPage   = lazy(() => import('./pages/dashboard/SettingsPage').then(m => ({ default: m.SettingsPage })));
const ChatPage       = lazy(() => import('./pages/dashboard/ChatPage').then(m => ({ default: m.ChatPage })));
const UsersPage      = lazy(() => import('./pages/dashboard/UsersPage').then(m => ({ default: m.UsersPage })));

// ── Loading fallback ─────────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="pulse-ring w-12 h-12 bg-crimson-700 rounded-full flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
            <path d="M12 2C12 2 5 9.5 5 14a7 7 0 0014 0C19 9.5 12 2 12 2z" />
          </svg>
        </div>
        <p className="text-sm text-white/40">Loading...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      {/* Toast notifications */}
      <Toaster
        position="top-right"
        gutter={8}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1a1a24',
            color: '#fafafa',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            fontSize: '14px',
            backdropFilter: 'blur(16px)',
          },
          success: {
            iconTheme: { primary: '#22c55e', secondary: '#1a1a24' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#1a1a24' },
          },
        }}
      />

      <Routes>
        {/* ── Public routes ── */}
        <Route path="/"                  element={<LandingPage />} />
        <Route path="/login"             element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register"          element={<GuestRoute><RegisterPage /></GuestRoute>} />
        <Route path="/forgot-password"   element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />

        {/* ── Protected dashboard routes ── */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<DashboardOverview />} />
          <Route path="donors" element={
            <Suspense fallback={<PageLoader />}><DonorProfile /></Suspense>
          } />
          <Route path="inventory" element={
            <Suspense fallback={<PageLoader />}><InventoryPage /></Suspense>
          } />
          <Route path="requests" element={
            <Suspense fallback={<PageLoader />}><RequestsPage /></Suspense>
          } />
          <Route path="emergency" element={
            <Suspense fallback={<PageLoader />}><EmergencyFeed /></Suspense>
          } />
          <Route path="search" element={
            <Suspense fallback={<PageLoader />}><BloodSearch /></Suspense>
          } />
          <Route path="analytics" element={
            <Suspense fallback={<PageLoader />}><AnalyticsPage /></Suspense>
          } />
          <Route path="settings" element={
            <Suspense fallback={<PageLoader />}><SettingsPage /></Suspense>
          } />
          <Route path="chat" element={
            <Suspense fallback={<PageLoader />}><ChatPage /></Suspense>
          } />
          <Route path="users" element={
            <Suspense fallback={<PageLoader />}><UsersPage /></Suspense>
          } />
        </Route>

        {/* ── Catch-all ── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
