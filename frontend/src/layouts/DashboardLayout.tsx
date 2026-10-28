import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSse } from '../hooks/useSse';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import FallingLeavesAndSand from '../components/FallingLeavesAndSand';

export const DashboardLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { isConnected } = useSse();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-800">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-emerald-700 font-mono font-bold tracking-wider">
            INITIALIZING SECURE PORTAL...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans relative overflow-x-hidden">
      {/* Falling Green Leaves & Sand Dust Particles Engine */}
      <FallingLeavesAndSand />

      {/* Navigation Topbar */}
      <Navbar isSseConnected={isConnected} />

      {/* Main Content with Sidebar */}
      <div className="flex flex-1 relative z-10">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
