import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, TrendingUp, Bot, GraduationCap,
  Settings, ChevronLeft, ChevronRight, Zap, LogOut, User, Crown, Sparkles, Lock
} from 'lucide-react';
import { PlansService } from '../../services/plans';
import './Sidebar.css';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', requiresPlan: null },
  { path: '/markets', icon: TrendingUp, label: 'Markets', requiresPlan: null },
  { path: '/bot', icon: Bot, label: 'AI Bot', requiresPlan: null },
  { path: '/learn', icon: GraduationCap, label: 'Learn', requiresPlan: null },
  { path: '/settings', icon: Settings, label: 'Settings', requiresPlan: null },
];

const PLAN_BADGES = {
  free: { label: 'Free', color: '#64748b' },
  pro: { label: 'Pro', color: '#3b82f6', icon: Crown },
  enterprise: { label: 'Enterprise', color: '#8b5cf6', icon: Sparkles },
};

export default function Sidebar({ user, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const plan = user?.plan || 'free';
  const planBadge = PLAN_BADGES[plan];

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo" onClick={() => navigate('/')}>
          <Zap size={24} className="logo-icon" />
          {!collapsed && <span className="logo-text">NeuralTrade</span>}
        </div>
        <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <item.icon size={20} />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        {!collapsed && plan !== 'enterprise' && (
          <button className="upgrade-btn" onClick={() => navigate('/checkout')}>
            <Crown size={14} /> Upgrade Plan
          </button>
        )}
        <div className="user-info">
          <div className="user-avatar">
            <User size={18} />
          </div>
          {!collapsed && (
            <div className="user-details">
              <span className="user-name">{user?.username || 'Guest'}</span>
              <span className="user-plan-badge" style={{ color: planBadge.color }}>
                {planBadge.icon && <planBadge.icon size={10} />} {planBadge.label}
              </span>
            </div>
          )}
          {!collapsed && (
            <button className="logout-btn" onClick={onLogout} title="Log out">
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
