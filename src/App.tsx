/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LoginPage } from './pages/LoginPage';
import { AdminLayout } from './components/AdminLayout';
import { Dashboard } from './pages/Dashboard';
import { Users } from './pages/Users';
import { Packages } from './pages/Packages';
import { Billing } from './pages/Billing';
import { Payments } from './pages/Payments';
import { Tickets } from './pages/Tickets';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{
        style: {
          background: '#1e293b',
          color: '#fff',
          borderRadius: '16px',
          padding: '12px 24px',
          fontSize: '13px',
          fontWeight: '900',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }
      }} />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="packages" element={<Packages />} />
          <Route path="billing" element={<Billing />} />
          <Route path="payments" element={<Payments />} />
          <Route path="tickets" element={<Tickets />} />
          <Route path="settings" element={
            <div className="p-12 bg-white rounded-[3rem] border border-slate-200 text-center">
              <h2 className="text-2xl font-black text-slate-800 uppercase italic">System Configuration</h2>
              <p className="mt-2 text-slate-500 italic">Advanced core settings are being synchronized.</p>
            </div>
          } />
        </Route>

        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}


