import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/auth';
import { PLANS } from '../services/plans';
import { Zap, User, Lock, ArrowRight, Check, Eye, EyeOff } from 'lucide-react';
import './AuthPage.css';

export default function AuthPage({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('free');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'login') {
      const result = AuthService.login(username, password);
      if (result.success) {
        onLogin(result.user);
        navigate('/dashboard');
      } else {
        setError(result.error);
      }
    } else {
      const result = AuthService.signup(username, password, selectedPlan);
      if (result.success) {
        onLogin(result.user);
        if (selectedPlan !== 'free') {
          navigate('/checkout');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(result.error);
      }
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-orb orb-1"></div>
        <div className="auth-orb orb-2"></div>
        <div className="auth-grid-bg"></div>
      </div>

      <div className="auth-container">
        <div className="auth-card glass-card">
          <div className="auth-header">
            <div className="auth-logo" onClick={() => navigate('/')}>
              <Zap size={28} />
              <span className="gradient-text">NeuralTrade</span>
            </div>
            <h2>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
            <p>{mode === 'login' ? 'Login to access your trading dashboard' : 'Start your trading journey today'}</p>
          </div>

          <div className="auth-tabs">
            <button className={`auth-tab ${mode === 'login' ? 'active' : ''}`} onClick={() => { setMode('login'); setError(''); }}>
              Log In
            </button>
            <button className={`auth-tab ${mode === 'signup' ? 'active' : ''}`} onClick={() => { setMode('signup'); setError(''); }}>
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label htmlFor="username">Username</label>
              <div className="auth-input-wrap">
                <User size={16} />
                <input
                  id="username"
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="password">Password</label>
              <div className="auth-input-wrap">
                <Lock size={16} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button type="submit" className="btn-primary auth-submit">
              {mode === 'login' ? 'Log In' : 'Create Account'} <ArrowRight size={16} />
            </button>
          </form>

          {mode === 'signup' && (
            <div className="plan-selector">
              <h3>Choose Your Plan</h3>
              <div className="plan-options">
                {Object.values(PLANS).map(plan => (
                  <div
                    key={plan.id}
                    className={`plan-option ${selectedPlan === plan.id ? 'selected' : ''}`}
                    onClick={() => setSelectedPlan(plan.id)}
                    style={{ '--plan-color': plan.color }}
                  >
                    {plan.badge && <span className="plan-badge">{plan.badge}</span>}
                    <div className="plan-option-header">
                      <h4>{plan.name}</h4>
                      <span className="plan-price">{plan.priceLabel}</span>
                    </div>
                    <p className="plan-balance">Starts with ${plan.startingBalance.toLocaleString()}</p>
                    <ul>
                      {plan.featureList.slice(0, 4).map((f, i) => (
                        <li key={i}><Check size={12} /> {f}</li>
                      ))}
                    </ul>
                    {selectedPlan === plan.id && <div className="plan-selected-check"><Check size={16} /></div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="auth-footer">
            {mode === 'login' ? (
              <p>
                Demo account: <button type="button" className="demo-link" onClick={() => { setUsername('demo'); setPassword('demo123'); }}>
                  demo / demo123
                </button>
              </p>
            ) : (
              <p>Plan can be changed anytime in Settings</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
