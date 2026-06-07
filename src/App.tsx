import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { Toaster } from '@/components/ui/toaster'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

// Layout
import Layout from '@/components/layout/Layout'

// Pages — public
import HomePage from '@/pages/HomePage'
import AnnouncementsListPage from '@/pages/announcements/AnnouncementsListPage'
import AnnouncementDetailPage from '@/pages/announcements/AnnouncementDetailPage'
import SearchPage from '@/pages/SearchPage'

// Auth pages
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import AuthCallbackPage from '@/pages/auth/AuthCallbackPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'

// Protected pages
import DashboardPage from '@/pages/DashboardPage'
import CreateAnnouncementPage from '@/pages/announcements/CreateAnnouncementPage'
import EditAnnouncementPage from '@/pages/announcements/EditAnnouncementPage'
import WreathBoardPage from '@/pages/announcements/WreathBoardPage'
import ModerationPage from '@/pages/ModerationPage'
import NotificationsPage from '@/pages/NotificationsPage'
import ProfilePage from '@/pages/ProfilePage'
import SettingsPage from '@/pages/SettingsPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <Routes>
              {/* Auth pages (no layout) */}
              <Route path="/auth/login" element={<LoginPage />} />
              <Route path="/auth/register" element={<RegisterPage />} />
              <Route path="/auth/callback" element={<AuthCallbackPage />} />
              <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />

              {/* Immersive full-screen (no layout) */}
              <Route path="/announcement/:slug/wreaths" element={<WreathBoardPage />} />

              {/* Main layout */}
              <Route element={<Layout />}>
                {/* Public */}
                <Route path="/" element={<HomePage />} />
                <Route path="/announcements" element={<AnnouncementsListPage />} />
                <Route path="/announcement/:slug" element={<AnnouncementDetailPage />} />
                <Route path="/search" element={<SearchPage />} />

                {/* Protected */}
                <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/announcements/create" element={<ProtectedRoute><CreateAnnouncementPage /></ProtectedRoute>} />
                <Route path="/announcement/:slug/edit" element={<ProtectedRoute><EditAnnouncementPage /></ProtectedRoute>} />
                <Route path="/dashboard/announcement/:announcementId/moderate" element={<ProtectedRoute><ModerationPage /></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
