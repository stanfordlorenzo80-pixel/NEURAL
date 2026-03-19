import { Bell, Search, Wallet, ArrowUpRight, ArrowDownRight, Crown } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationsPanel from '../NotificationsPanel';
import './Header.css';

const PLAN_COLORS = { free: '#64748b', pro: '#3b82f6', enterprise: '#8b5cf6' };

export default function Header({ portfolioValue, user }) {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const pnl = portfolioValue?.pnl || 0;
  const isPositive = pnl >= 0;
  const plan = user?.plan || 'free';

  return (
    <header className="app-header">
      <div className="header-search">
        <Search size={16} className="search-icon" />
        <input type="text" placeholder="Search markets, assets, strategies..."
          value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>
      <div className="header-right">
        <div className="header-plan-badge" style={{ borderColor: PLAN_COLORS[plan], color: PLAN_COLORS[plan] }}
          onClick={() => navigate('/checkout')}>
          <Crown size={12} /> {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan
        </div>
        <div className="paper-badge">📄 Paper Trading</div>
        <div className="header-balance">
          <Wallet size={16} />
          <div className="balance-info">
            <span className="balance-label">Portfolio</span>
            <span className="balance-value">
              ${(portfolioValue?.totalValue || 100000).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <span className={`balance-pnl ${isPositive ? 'positive' : 'negative'}`}>
            {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {isPositive ? '+' : ''}{pnl.toFixed(2)}
          </span>
        </div>
        <NotificationsPanel />
      </div>
    </header>
  );
}
