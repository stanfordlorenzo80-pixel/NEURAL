import { useState, useContext, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { UserContext } from '../App';
import { AuthService } from '../services/auth';
import { PLANS } from '../services/plans';
import { Check, Crown, Sparkles, ArrowRight, CreditCard, ShieldCheck, ExternalLink, Lock } from 'lucide-react';
import './CheckoutPage.css';

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3001/api');

export default function CheckoutPage() {
  const { user, handlePlanChange } = useContext(UserContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentConfig, setPaymentConfig] = useState(null);

  // Check for success callback from LemonSqueezy
  const planSuccess = searchParams.get('plan_activated');

  useEffect(() => {
    fetch(`${API_BASE}/payments?action=config`).then(r => r.json()).then(setPaymentConfig).catch(() => {});
  }, []);

  // If returning from LemonSqueezy with success
  useEffect(() => {
    if (planSuccess && user) {
      AuthService.changePlan(user.username, planSuccess);
      handlePlanChange(planSuccess);
    }
  }, [planSuccess]);

  if (!user) return null;
  const currentPlan = user.plan || 'free';

  // Show success screen if just upgraded
  if (planSuccess) {
    const plan = PLANS[planSuccess];
    if (plan) return (
      <div className="checkout-page">
        <div className="checkout-success glass-card">
          <div className="success-icon"><ShieldCheck size={48} /></div>
          <h2>Welcome to {plan.name}! 🎉</h2>
          <p>Your plan is now active with all {plan.name} features.</p>
          <div className="success-details">
            <div className="detail-row"><span>Starting Balance</span><span>${plan.startingBalance.toLocaleString()}</span></div>
            <div className="detail-row"><span>Bot Strategies</span><span>{plan.maxBots === Infinity ? 'Unlimited' : plan.maxBots}</span></div>
            <div className="detail-row"><span>AI Strategy Builder</span><span>{plan.features.customBots ? '✅' : '❌'}</span></div>
          </div>
          <button className="btn-primary" onClick={() => navigate('/dashboard')}>
            Go to Dashboard <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  const handleCheckout = (planId) => {
    if (planId === currentPlan || planId === 'free') return;

    // Redirect to LemonSqueezy checkout
    let checkoutUrl = null;
    if (paymentConfig?.configured) {
      checkoutUrl = planId === 'pro' ? paymentConfig.proCheckoutUrl : paymentConfig.enterpriseCheckoutUrl;
    }

    if (checkoutUrl) {
      // Append success redirect back to our checkout page
      const returnUrl = `${window.location.origin}/checkout?plan_activated=${planId}`;
      const separator = checkoutUrl.includes('?') ? '&' : '?';
      window.location.href = `${checkoutUrl}${separator}checkout[custom][return_url]=${encodeURIComponent(returnUrl)}`;
    } else {
      // Payment not configured — show message
      alert('Payment system is being set up. Please try again shortly.');
    }
  };

  return (
    <div className="checkout-page">
      <div className="checkout-header">
        <h2>Upgrade Your Trading</h2>
        <p>Join thousands of traders using AI to maximize their returns.</p>
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
                disabled={isCurrent || isDowngrade}
                onClick={() => handleCheckout(id)}
              >
                {isCurrent ? 'Current Plan' : `Subscribe to ${plan.name}`}
                {!isCurrent && !isDowngrade && <ArrowRight size={14} />}
              </button>
            </div>
          );
        })}
      </div>

      <div className="checkout-info glass-card">
        <div className="info-row"><Lock size={16} /> <span>256-bit SSL encrypted checkout</span></div>
        <div className="info-row"><CreditCard size={16} /> <span>Cancel anytime. No hidden fees.</span></div>
        <div className="info-row"><ShieldCheck size={16} /> <span>7-day money-back guarantee</span></div>
      </div>
    </div>
  );
}
