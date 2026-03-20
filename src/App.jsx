import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './auth/useAuth'
import RequireAuth from './components/RequireAuth'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Goals from './pages/Goals'
import LifeEvents from './pages/LifeEvents'
import Copilot from './pages/Copilot'
import Help from './pages/Help'

function ProtectedLayout({ children }) {
  return (
    <RequireAuth>
      <Layout>{children}</Layout>
    </RequireAuth>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
          <Route path="/goals" element={<ProtectedLayout><Goals /></ProtectedLayout>} />
          <Route path="/life-events" element={<ProtectedLayout><LifeEvents /></ProtectedLayout>} />
          <Route path="/copilot" element={<ProtectedLayout><Copilot /></ProtectedLayout>} />
          <Route path="/help" element={<ProtectedLayout><Help /></ProtectedLayout>} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
