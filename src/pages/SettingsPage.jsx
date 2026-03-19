import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../App';
import { PortfolioService } from '../services/portfolio';
import { TradingBotService } from '../services/tradingBot';
import { AuthService } from '../services/auth';
import { PLANS } from '../services/plans';
import { User, Bell, Shield, RefreshCw, Trash2, Check, Crown, ArrowRight, Link2, Unlink, Server, ExternalLink } from 'lucide-react';
import './SettingsPage.css';

const API_BASE = 'http://localhost:3001/api';

export default function SettingsPage() {
  const { user, refreshUser, handleLogout, handlePlanChange } = useContext(UserContext);
  const navigate = useNavigate();
  const [showRefillConfirm, setShowRefillConfirm] = useState(false);
  const [brokerStatus, setBrokerStatus] = useState(null);
  const [serverStatus, setServerStatus] = useState(null);
  const [notifications, setNotifications] = useState({
    tradeAlerts: true, botSignals: true, priceAlerts: true, news: false,
  });

  const currentPlan = PLANS[user?.plan] || PLANS.free;

  // Check backend health and broker status
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch(`${API_BASE}/health`);
        const data = await res.json();
        setServerStatus(data);
        const broker = await fetch(`${API_BASE}/broker/status`);
        setBrokerStatus(await broker.json());
      } catch {
        setServerStatus(null);
        setBrokerStatus(null);
      }
    };
    checkStatus();
  }, []);

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
        {/* Account Info */}
        <div className="settings-card glass-card">
          <div className="settings-card-header"><User size={20} /><h3>Account</h3></div>
          <div className="account-info-grid">
            <div className="account-row"><span className="account-label">Username</span><span className="account-value">{user?.username}</span></div>
            <div className="account-row"><span className="account-label">Member Since</span><span className="account-value">{new Date(user?.createdAt).toLocaleDateString()}</span></div>
            <div className="account-row"><span className="account-label">Current Plan</span>
              <span className="account-value plan-value" style={{ color: currentPlan.color }}><Crown size={14} /> {currentPlan.name}</span></div>
            <div className="account-row"><span className="account-label">Starting Balance</span><span className="account-value">${currentPlan.startingBalance.toLocaleString()}</span></div>
          </div>
        </div>

        {/* Server & Broker Status */}
        <div className="settings-card glass-card">
          <div className="settings-card-header"><Server size={20} /><h3>Connections</h3></div>
          <div className="connections-grid">
            <div className={`connection-item ${serverStatus ? 'connected' : 'disconnected'}`}>
              <div className="conn-icon">{serverStatus ? '🟢' : '🔴'}</div>
              <div className="conn-info">
                <h4>Backend Server</h4>
                <p>{serverStatus ? 'Running on port 3001' : 'Not running — run `npm run dev` in /server'}</p>
              </div>
            </div>
            <div className={`connection-item ${serverStatus?.services?.coingecko ? 'connected' : 'disconnected'}`}>
              <div className="conn-icon">{serverStatus?.services?.coingecko ? '🟢' : '⚪'}</div>
              <div className="conn-info">
                <h4>CoinGecko (Crypto Data)</h4>
                <p>Free API — real-time crypto prices</p>
              </div>
            </div>
            <div className={`connection-item ${brokerStatus?.connected ? 'connected' : 'disconnected'}`}>
              <div className="conn-icon">{brokerStatus?.connected ? '🟢' : '⚪'}</div>
              <div className="conn-info">
                <h4>Alpaca {brokerStatus?.paper ? '(Paper)' : '(Live)'}</h4>
                <p>{brokerStatus?.connected ? 'Connected — ready for live trading' : 'Not configured — add keys in server/.env'}</p>
              </div>
              {!brokerStatus?.connected && (
                <a href="https://alpaca.markets" target="_blank" rel="noopener" className="conn-link">
                  <ExternalLink size={14} /> Sign up free
                </a>
              )}
            </div>
            <div className={`connection-item ${serverStatus?.services?.stripe ? 'connected' : 'disconnected'}`}>
              <div className="conn-icon">{serverStatus?.services?.stripe ? '🟢' : '⚪'}</div>
              <div className="conn-info">
                <h4>Stripe (Payments)</h4>
                <p>{serverStatus?.services?.stripe ? 'Ready — accepting payments' : 'Not configured — add keys in server/.env (plans work in demo mode)'}</p>
              </div>
            </div>
          </div>
          <p className="settings-desc" style={{ marginTop: 'var(--space-md)' }}>
            💡 To enable broker & payments, edit <code>server/.env</code> with your API keys. See <code>server/.env.example</code> for instructions.
          </p>
        </div>

        {/* Plan */}
        <div className="settings-card glass-card">
          <div className="settings-card-header"><Crown size={20} /><h3>Your Plan</h3></div>
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

        {/* Notifications */}
        <div className="settings-card glass-card">
          <div className="settings-card-header"><Bell size={20} /><h3>Notifications</h3></div>
          <div className="toggle-list">
            {Object.entries(notifications).map(([key, val]) => (
              <div key={key} className="toggle-item">
                <div>
                  <h4>{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</h4>
                  <p>{key === 'tradeAlerts' ? 'When trades are executed' : key === 'botSignals' ? 'AI bot signal alerts' :
                    key === 'priceAlerts' ? 'Price target notifications' : 'Market news updates'}</p>
                </div>
                <button className={`toggle-btn ${val ? 'on' : ''}`}
                  onClick={() => setNotifications(prev => ({ ...prev, [key]: !val }))}>
                  <span className="toggle-knob"></span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Reset */}
        <div className="settings-card glass-card danger">
          <div className="settings-card-header"><RefreshCw size={20} /><h3>Reset Paper Portfolio</h3></div>
          <p className="settings-desc">Reset back to <strong>${currentPlan.startingBalance.toLocaleString()}</strong>. Stops AI bot and clears all trades.</p>
          {!showRefillConfirm ? (
            <button className="btn-danger" onClick={() => setShowRefillConfirm(true)}><Trash2 size={14} /> Reset & Refill</button>
          ) : (
            <div className="confirm-reset">
              <p>⚠️ Are you sure? This will reset everything.</p>
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
