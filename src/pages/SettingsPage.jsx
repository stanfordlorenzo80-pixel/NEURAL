import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../App';
import { PortfolioService } from '../services/portfolio';
import { TradingBotService } from '../services/tradingBot';
import { PLANS } from '../services/plans';
import { User, Bell, Shield, RefreshCw, Trash2, Check, Crown, ArrowRight, Lock, CreditCard } from 'lucide-react';
import './SettingsPage.css';

export default function SettingsPage() {
  const { user, refreshUser, handleLogout, handlePlanChange } = useContext(UserContext);
  const navigate = useNavigate();
  const [showRefillConfirm, setShowRefillConfirm] = useState(false);
  const [notifications, setNotifications] = useState({
    tradeAlerts: true, botSignals: true, priceAlerts: true, news: false,
  });

  const currentPlan = PLANS[user?.plan] || PLANS.free;

  const handleRefill = () => {
    TradingBotService.stop();
    PortfolioService.refillBalance();
    refreshUser();
    setShowRefillConfirm(false);
  };

  return (
    <div className="settings-page">
      <h2>Settings</h2>
      <div className="settings-sections">
        {/* Account */}
        <div className="settings-card glass-card">
          <div className="settings-card-header"><User size={20} /><h3>Account</h3></div>
          <div className="account-info-grid">
            <div className="account-row"><span className="account-label">Username</span><span className="account-value">{user?.username}</span></div>
            <div className="account-row"><span className="account-label">Member Since</span><span className="account-value">{new Date(user?.createdAt).toLocaleDateString()}</span></div>
            <div className="account-row"><span className="account-label">Current Plan</span>
              <span className="account-value plan-value" style={{ color: currentPlan.color }}><Crown size={14} /> {currentPlan.name}</span></div>
          </div>
        </div>

        {/* Plan */}
        <div className="settings-card glass-card">
          <div className="settings-card-header"><Crown size={20} /><h3>Subscription</h3></div>
          <div className="current-plan-card" style={{ borderColor: currentPlan.color }}>
            <div className="current-plan-header"><h4>{currentPlan.name}</h4><span className="current-plan-price">{currentPlan.priceLabel}</span></div>
            <ul className="current-plan-features">
              {currentPlan.featureList.map((f, i) => (<li key={i}><Check size={12} /> {f}</li>))}
            </ul>
          </div>
          {user?.plan !== 'enterprise' && (
            <button className="btn-primary upgrade-settings-btn" onClick={() => navigate('/checkout')}>
              <Crown size={16} /> Upgrade Plan <ArrowRight size={14} />
            </button>
          )}
        </div>

        {/* Trading */}
        <div className="settings-card glass-card">
          <div className="settings-card-header"><CreditCard size={20} /><h3>Trading</h3></div>
          <div className="toggle-list">
            <div className="toggle-item">
              <div>
                <h4>Trading Mode</h4>
                <p>Paper trading uses simulated funds. Live trading uses real money through Alpaca.</p>
              </div>
              <div className="trading-mode-selector">
                <span className="mode-active">📄 Paper</span>
                <span className="mode-divider">|</span>
                <span className="mode-inactive" title="Connect your Alpaca live keys to enable">🔒 Live</span>
              </div>
            </div>
            <div className="trading-note">
              <Lock size={14} />
              <span>Live trading requires an Alpaca brokerage account with live API keys. <a href="https://alpaca.markets" target="_blank" rel="noopener">Sign up at Alpaca →</a></span>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="settings-card glass-card">
          <div className="settings-card-header"><Bell size={20} /><h3>Notifications</h3></div>
          <div className="toggle-list">
            {Object.entries(notifications).map(([key, val]) => (
              <div key={key} className="toggle-item">
                <div>
                  <h4>{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</h4>
                  <p>{key === 'tradeAlerts' ? 'When trades are executed' : key === 'botSignals' ? 'AI bot signal alerts' :
                    key === 'priceAlerts' ? 'Price target notifications' : 'Market news and updates'}</p>
                </div>
                <button className={`toggle-btn ${val ? 'on' : ''}`}
                  onClick={() => setNotifications(prev => ({ ...prev, [key]: !val }))}>
                  <span className="toggle-knob"></span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy & Security */}
        <div className="settings-card glass-card">
          <div className="settings-card-header"><Shield size={20} /><h3>Privacy & Security</h3></div>
          <div className="security-info">
            <div className="security-row"><Lock size={14} /> <span>Your data is stored locally on your device</span></div>
            <div className="security-row"><Shield size={14} /> <span>API keys are stored server-side, never in your browser</span></div>
            <div className="security-row"><Check size={14} /> <span>256-bit SSL encryption on all connections</span></div>
          </div>
        </div>

        {/* Reset */}
        <div className="settings-card glass-card danger">
          <div className="settings-card-header"><RefreshCw size={20} /><h3>Reset Paper Portfolio</h3></div>
          <p className="settings-desc">Reset your paper trading balance to <strong>${currentPlan.startingBalance.toLocaleString()}</strong>. This stops the AI bot and clears all trade history.</p>
          {!showRefillConfirm ? (
            <button className="btn-danger" onClick={() => setShowRefillConfirm(true)}><Trash2 size={14} /> Reset Portfolio</button>
          ) : (
            <div className="confirm-reset">
              <p>⚠️ This cannot be undone. All trades and positions will be cleared.</p>
              <div className="confirm-btns">
                <button className="btn-danger" onClick={handleRefill}>Yes, Reset Everything</button>
                <button className="btn-secondary" onClick={() => setShowRefillConfirm(false)}>Cancel</button>
              </div>
            </div>
          )}
        </div>

        <div className="settings-card glass-card">
          <button className="btn-secondary logout-settings-btn" onClick={handleLogout}>Log Out</button>
        </div>
      </div>
    </div>
  );
}
