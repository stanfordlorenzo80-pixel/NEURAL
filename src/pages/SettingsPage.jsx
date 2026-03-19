import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../App';
import { PortfolioService } from '../services/portfolio';
import { TradingBotService } from '../services/tradingBot';
import { AuthService } from '../services/auth';
import { PLANS } from '../services/plans';
import { User, Bell, Shield, RefreshCw, Trash2, Check, Crown, ArrowRight, Lock, CreditCard, Key, Eye, EyeOff, Save, ExternalLink } from 'lucide-react';
import './SettingsPage.css';

export default function SettingsPage() {
  const { user, refreshUser, handleLogout, handlePlanChange } = useContext(UserContext);
  const navigate = useNavigate();
  const [showRefillConfirm, setShowRefillConfirm] = useState(false);
  const [notifications, setNotifications] = useState({
    tradeAlerts: true, botSignals: true, priceAlerts: true, news: false,
  });

  // User's own Alpaca keys
  const storageKey = `neuraltrade_broker_${user?.username}`;
  const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
  const [apiKey, setApiKey] = useState(saved.apiKey || '');
  const [secretKey, setSecretKey] = useState(saved.secretKey || '');
  const [showSecret, setShowSecret] = useState(false);
  const [isPaper, setIsPaper] = useState(saved.paper !== false);
  const [keysSaved, setKeysSaved] = useState(false);

  const currentPlan = PLANS[user?.plan] || PLANS.free;

  const handleSaveKeys = () => {
    localStorage.setItem(storageKey, JSON.stringify({ apiKey, secretKey, paper: isPaper }));
    setKeysSaved(true);
    setTimeout(() => setKeysSaved(false), 3000);
  };

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
            <div className="account-row"><span className="account-label">Plan</span>
              <span className="account-value plan-value" style={{ color: currentPlan.color }}><Crown size={14} /> {currentPlan.name}</span></div>
          </div>
        </div>

        {/* Subscription */}
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

        {/* Broker Connection — USER'S OWN KEYS */}
        <div className="settings-card glass-card">
          <div className="settings-card-header"><Key size={20} /><h3>Broker Connection</h3></div>
          <p className="settings-desc">Connect your own Alpaca account to trade stocks and crypto. Your keys are stored securely in your browser only — we never see them.</p>
          <div className="broker-form">
            <div className="broker-field">
              <label>API Key</label>
              <input type="text" placeholder="Enter your Alpaca API key" value={apiKey}
                onChange={e => setApiKey(e.target.value)} />
            </div>
            <div className="broker-field">
              <label>Secret Key</label>
              <div className="secret-input-wrap">
                <input type={showSecret ? 'text' : 'password'} placeholder="Enter your Alpaca secret key" value={secretKey}
                  onChange={e => setSecretKey(e.target.value)} />
                <button className="eye-btn" onClick={() => setShowSecret(!showSecret)}>
                  {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="broker-mode-row">
              <div className="trading-mode-toggle">
                <button className={`mode-btn ${isPaper ? 'active' : ''}`} onClick={() => setIsPaper(true)}>📄 Paper Trading</button>
                <button className={`mode-btn ${!isPaper ? 'active' : ''}`} onClick={() => setIsPaper(false)}>💰 Live Trading</button>
              </div>
              {!isPaper && <p className="live-warning">⚠️ Live mode uses real money. Trade responsibly.</p>}
            </div>
            <div className="broker-actions">
              <button className="btn-primary" onClick={handleSaveKeys} disabled={!apiKey || !secretKey}>
                <Save size={16} /> {keysSaved ? '✅ Saved!' : 'Save Keys'}
              </button>
              <a href="https://alpaca.markets" target="_blank" rel="noopener" className="btn-secondary">
                <ExternalLink size={14} /> Get Free API Keys
              </a>
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

        {/* Security */}
        <div className="settings-card glass-card">
          <div className="settings-card-header"><Shield size={20} /><h3>Privacy & Security</h3></div>
          <div className="security-info">
            <div className="security-row"><Lock size={14} /> <span>Your data is stored locally on your device</span></div>
            <div className="security-row"><Key size={14} /> <span>API keys never leave your browser</span></div>
            <div className="security-row"><Shield size={14} /> <span>256-bit SSL encryption on all connections</span></div>
          </div>
        </div>

        {/* Reset */}
        <div className="settings-card glass-card danger">
          <div className="settings-card-header"><RefreshCw size={20} /><h3>Reset Paper Portfolio</h3></div>
          <p className="settings-desc">Reset balance to <strong>${currentPlan.startingBalance.toLocaleString()}</strong>. Clears all trades and stops the bot.</p>
          {!showRefillConfirm ? (
            <button className="btn-danger" onClick={() => setShowRefillConfirm(true)}><Trash2 size={14} /> Reset Portfolio</button>
          ) : (
            <div className="confirm-reset">
              <p>⚠️ This cannot be undone.</p>
              <div className="confirm-btns">
                <button className="btn-danger" onClick={handleRefill}>Yes, Reset</button>
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
