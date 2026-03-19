import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../App';
import { AuthService } from '../services/auth';
import { PLANS } from '../services/plans';
import { Check, Crown, Sparkles, ArrowRight, CreditCard, ShieldCheck, Lock, ExternalLink } from 'lucide-react';
import './CheckoutPage.css';

const API_BASE = 'http://localhost:3001/api';

export default function CheckoutPage() {
  const { user, handlePlanChange } = useContext(UserContext);
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('stripe');

  if (!user) return null;

  const currentPlan = user.plan || 'free';

  const handleCheckout = async (planId) => {
    if (planId === currentPlan || planId === 'free') return;
    setSelectedPlan(planId);
    setProcessing(true);

    // Try Stripe first
    try {
      const res = await fetch(`${API_BASE}/stripe/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId, username: user.username }),
      });
      const data = await res.json();

      if (data.url && !data.demo) {
        // Real Stripe checkout — redirect
        window.location.href = data.url;
        return;
      }
    } catch {
      // Backend not available — use demo mode
    }

    // Demo mode — simulate payment
    await new Promise(r => setTimeout(r, 2000));
    AuthService.changePlan(user.username, planId);
    handlePlanChange(planId);
    setProcessing(false);
    setSuccess(true);
  };

  if (success) {
    const plan = PLANS[selectedPlan];
    return (
      <div className="checkout-page">
        <div className="checkout-success glass-card">
          <div className="success-icon"><ShieldCheck size={48} /></div>
          <h2>Welcome to {plan.name}! 🎉</h2>
          <p>Your plan has been activated! You now have access to all {plan.name} features.</p>
          <div className="success-details">
            <div className="detail-row"><span>Starting Balance</span><span>${plan.startingBalance.toLocaleString()}</span></div>
            <div className="detail-row"><span>Bot Strategies</span><span>{plan.maxBots === Infinity ? 'Unlimited' : plan.maxBots}</span></div>
            <div className="detail-row"><span>AI Strategy Builder</span><span>{plan.features.customBots ? '✅ Yes' : '❌ No'}</span></div>
          </div>
          <button className="btn-primary" onClick={() => navigate('/dashboard')}>
            Go to Dashboard <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-header">
        <h2>Upgrade Your Plan</h2>
        <p>Unlock premium features and trade like a pro.</p>
      </div>

      <div className="plans-grid">
        {Object.entries(PLANS).map(([id, plan]) => {
          const isCurrent = id === currentPlan;
          const isDowngrade = (id === 'free' && currentPlan !== 'free');
          return (
            <div key={id} className={`plan-card glass-card ${id === 'pro' ? 'featured' : ''} ${isCurrent ? 'current' : ''}`}>
              {id === 'pro' && <div className="plan-popular">Most Popular</div>}
              {isCurrent && <div className="plan-current-badge">Current Plan</div>}
              <div className="plan-card-icon" style={{ color: plan.color }}>
                {id === 'enterprise' ? <Sparkles size={28} /> : <Crown size={28} />}
              </div>
              <h3>{plan.name}</h3>
              <div className="plan-price">{plan.priceLabel}</div>
              <ul className="plan-features">
                {plan.featureList.map((f, i) => (
                  <li key={i}><Check size={14} className="check-icon" /> {f}</li>
                ))}
              </ul>
              <div className="plan-balance">
                <strong>${plan.startingBalance.toLocaleString()}</strong> paper trading balance
              </div>
              <button
                className={`plan-btn ${isCurrent ? 'btn-secondary' : id === 'pro' ? 'btn-primary' : 'btn-secondary'}`}
                disabled={isCurrent || isDowngrade || processing}
                onClick={() => handleCheckout(id)}
              >
                {isCurrent ? 'Current Plan' : processing && selectedPlan === id ? 'Processing...' : `Get ${plan.name}`}
                {!isCurrent && !isDowngrade && <ArrowRight size={14} />}
              </button>
            </div>
          );
        })}
      </div>

      <div className="checkout-info glass-card">
        <div className="info-row"><CreditCard size={16} /> <span>Secure payment via Stripe. Cancel anytime.</span></div>
        <div className="info-row"><Lock size={16} /> <span>Your payment info is never stored on our servers.</span></div>
        <div className="info-row"><ShieldCheck size={16} /> <span>7-day money-back guarantee on all paid plans.</span></div>
        <p className="stripe-note">
          {paymentMethod === 'stripe'
            ? '💡 Tip: Connect Stripe in Settings → add your test keys to enable real payments.'
            : 'Running in demo mode — plans activate instantly for testing.'}
        </p>
      </div>
    </div>
  );
}
