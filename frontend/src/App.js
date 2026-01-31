import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Toaster } from 'sonner';
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/StudentDashboard';
import MealSelectionPage from './pages/MealSelectionPage';
import BookingHistoryPage from './pages/BookingHistoryPage';
import RaiseTicketPage from './pages/RaiseTicketPage';
import StudentProfilePage from './pages/StudentProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import MenuManagementPage from './pages/MenuManagementPage';
import AdminTicketsPage from './pages/AdminTicketsPage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" richColors />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          {/* Student Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/meals"
            element={
              <ProtectedRoute>
                <MealSelectionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <BookingHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/raise-ticket"
            element={
              <ProtectedRoute>
                <RaiseTicketPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <StudentProfilePage />
              </ProtectedRoute>
            }
          />
          
          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/menu-management"
            element={
              <ProtectedRoute requireAdmin>
                <MenuManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tickets"
            element={
              <ProtectedRoute requireAdmin>
                <AdminTicketsPage />
              </ProtectedRoute>
            }
          />
          
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
