import { useNavigate } from 'react-router-dom';
import { Zap, TrendingUp, Bot, GraduationCap, Shield, BarChart3, ArrowRight, Star, Check } from 'lucide-react';
import './LandingPage.css';

const features = [
  { icon: Bot, title: 'AI Trading Bot', desc: 'Deploy intelligent bots with pre-built or custom AI strategies that trade 24/7.', color: '#3b82f6' },
  { icon: GraduationCap, title: 'Learn to Trade', desc: 'Interactive courses from beginner to advanced with quizzes and real-time practice.', color: '#8b5cf6' },
  { icon: BarChart3, title: 'Live Analytics', desc: 'Real-time charts, order books, and market data with professional-grade tools.', color: '#06b6d4' },
  { icon: Shield, title: 'Paper & Live Trading', desc: 'Practice risk-free with paper trading, then go live when you\'re ready.', color: '#10b981' },
];

const stats = [
  { value: '50K+', label: 'Active Traders' },
  { value: '$2.4B', label: 'Volume Traded' },
  { value: '94%', label: 'Uptime' },
  { value: '4.9★', label: 'User Rating' },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      {/* Nav */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-logo">
            <Zap size={28} />
            <span>NeuralTrade</span>
          </div>
          <div className="landing-nav-links">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#learn">Learn</a>
          </div>
          <div className="landing-nav-actions">
            <button className="btn-secondary" onClick={() => navigate('/auth')}>Log In</button>
            <button className="btn-primary" onClick={() => navigate('/auth')}>
              Start Trading <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-orb orb-1"></div>
          <div className="hero-orb orb-2"></div>
          <div className="hero-orb orb-3"></div>
          <div className="hero-grid"></div>
        </div>
        <div className="hero-content">
          <div className="hero-badge">
            <Zap size={14} /> AI-Powered Trading Platform
          </div>
          <h1>
            Trade Smarter with<br />
            <span className="gradient-text">Neural Intelligence</span>
          </h1>
          <p className="hero-desc">
            Deploy AI trading bots, build custom strategies, and learn from the market — all in one platform. 
            Start with paper trading, go live when you're ready.
          </p>
          <div className="hero-actions">
            <button className="btn-primary btn-lg" onClick={() => navigate('/auth')}>
              Launch Dashboard <ArrowRight size={18} />
            </button>
            <button className="btn-secondary btn-lg" onClick={() => navigate('/learn')}>
              <GraduationCap size={18} /> Start Learning
            </button>
          </div>
          <div className="hero-stats">
            {stats.map(s => (
              <div key={s.label} className="hero-stat">
                <span className="hero-stat-value">{s.value}</span>
                <span className="hero-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ticker */}
      <div className="ticker-bar">
        <div className="ticker-track">
          {['BTC $67,432 ▲2.4%', 'ETH $3,456 ▲1.8%', 'AAPL $178.23 ▼0.3%', 'TSLA $245.67 ▲3.1%', 
            'NVDA $876.45 ▲1.2%', 'SOL $142.89 ▲4.5%', 'MSFT $415.32 ▲0.8%', 'AMZN $185.21 ▼0.5%',
            'BTC $67,432 ▲2.4%', 'ETH $3,456 ▲1.8%', 'AAPL $178.23 ▼0.3%', 'TSLA $245.67 ▲3.1%',
            'NVDA $876.45 ▲1.2%', 'SOL $142.89 ▲4.5%', 'MSFT $415.32 ▲0.8%', 'AMZN $185.21 ▼0.5%',
          ].map((t, i) => (
            <span key={i} className={`ticker-item ${t.includes('▼') ? 'negative' : 'positive'}`}>{t}</span>
          ))}
        </div>
      </div>

      {/* Features */}
      <section className="features-section" id="features">
        <div className="section-container">
          <h2 className="section-title">
            Everything you need to<br /><span className="gradient-text">dominate the markets</span>
          </h2>
          <p className="section-desc">Professional-grade tools, AI-powered strategies, and comprehensive education — all in one platform.</p>
          <div className="features-grid">
            {features.map((f, i) => (
              <div key={i} className="feature-card glass-card" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="feature-icon" style={{ background: `${f.color}15`, color: f.color }}>
                  <f.icon size={24} />
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Strategy Builder Preview */}
      <section className="ai-section">
        <div className="section-container">
          <div className="ai-preview">
            <div className="ai-preview-text">
              <h2>Build Custom Strategies<br /><span className="gradient-text">with AI</span></h2>
              <p>Describe your trading strategy in plain English and our AI will build, backtest, and deploy it for you.</p>
              <ul className="ai-features-list">
                <li><Check size={16} /> Natural language strategy builder</li>
                <li><Check size={16} /> Automatic backtesting</li>
                <li><Check size={16} /> Risk analysis & optimization</li>
                <li><Check size={16} /> One-click deployment</li>
              </ul>
              <button className="btn-primary" onClick={() => navigate('/auth')}>
                Try AI Strategy Builder <ArrowRight size={16} />
              </button>
            </div>
            <div className="ai-preview-visual">
              <div className="ai-chat-demo glass-card">
                <div className="ai-chat-msg user-msg">
                  <span>Buy BTC when RSI drops below 30 and sell when it crosses above 70, with a 2% stop loss</span>
                </div>
                <div className="ai-chat-msg bot-msg">
                  <Bot size={16} />
                  <span>Strategy created! ✅ RSI Mean Reversion with 2% stop loss. Backtested: 68% win rate, 2.1x Sharpe ratio. Deploy now?</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="pricing-section" id="pricing">
        <div className="section-container">
          <h2 className="section-title">Simple, transparent <span className="gradient-text">pricing</span></h2>
          <div className="pricing-grid">
            <div className="pricing-card glass-card">
              <h3>Starter</h3>
              <div className="price">Free</div>
              <ul>
                <li><Check size={14} /> Paper trading</li>
                <li><Check size={14} /> 2 AI bot strategies</li>
                <li><Check size={14} /> Basic learning courses</li>
                <li><Check size={14} /> Market data (delayed)</li>
              </ul>
              <button className="btn-secondary" onClick={() => navigate('/auth')}>Get Started</button>
            </div>
            <div className="pricing-card glass-card featured">
              <div className="pricing-badge">Most Popular</div>
              <h3>Pro</h3>
              <div className="price">$29<span>/mo</span></div>
              <ul>
                <li><Check size={14} /> Paper + Live trading</li>
                <li><Check size={14} /> All AI strategies</li>
                <li><Check size={14} /> AI Strategy Builder</li>
                <li><Check size={14} /> Real-time market data</li>
                <li><Check size={14} /> Advanced analytics</li>
              </ul>
              <button className="btn-primary" onClick={() => navigate('/auth')}>Start Free Trial</button>
            </div>
            <div className="pricing-card glass-card">
              <h3>Enterprise</h3>
              <div className="price">$99<span>/mo</span></div>
              <ul>
                <li><Check size={14} /> Everything in Pro</li>
                <li><Check size={14} /> Unlimited custom bots</li>
                <li><Check size={14} /> API access</li>
                <li><Check size={14} /> Priority support</li>
                <li><Check size={14} /> Custom integrations</li>
              </ul>
              <button className="btn-secondary" onClick={() => navigate('/auth')}>Contact Sales</button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="section-container">
          <div className="footer-inner">
            <div className="footer-brand">
              <Zap size={24} className="logo-icon" />
              <span className="gradient-text">NeuralTrade</span>
            </div>
            <p className="footer-disclaimer">
              ⚠️ Trading involves risk. This platform uses simulated data for educational purposes. Past performance does not guarantee future results.
            </p>
            <p className="footer-copy">© 2026 NeuralTrade. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
