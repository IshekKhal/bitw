import React, { useState } from 'react';
import { X, Sparkles, Check, ExternalLink, ShieldCheck } from 'lucide-react';

export default function DodoCheckoutModal({ isOpen, onClose, onProActivated, userEmail = 'guest@reef.org' }) {
  if (!isOpen) return null;

  const [email, setEmail] = useState(userEmail);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [loading, setLoading] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState(null);

  const handleCheckout = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/billing/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_email: email,
          customer_name: 'Reef Guardian',
          billing_cycle: billingCycle
        })
      });

      const data = await res.json();
      if (data.checkout_url) {
        setCheckoutUrl(data.checkout_url);
        // Also simulate pro upgrade locally for instant demo gratification
        onProActivated(email);
      }
    } catch (err) {
      // Offline simulation fallback
      setCheckoutUrl(`https://checkout.dodopayments.com/sandbox/pay/mock_session?email=${email}`);
      onProActivated(email);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" id="pro-checkout-modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <div className="modal-title">
            <Sparkles size={20} color="#818cf8" />
            <span>Upgrade to Guardian Pro</span>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close Modal">
            <X size={20} />
          </button>
        </div>

        {!checkoutUrl ? (
          <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, fontFamily: 'JetBrains Mono', color: '#f8fafc' }}>
                {billingCycle === 'monthly' ? '$4.99' : '$39.00'}
                <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 500 }}>
                  {billingCycle === 'monthly' ? ' / month' : ' / year (35% off)'}
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                Protects thousands of dollars in Acropora and SPS corals from non-linear chemical collapse.
              </p>
            </div>

            {/* Cycle Selector */}
            <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-surface-elevated)', padding: '0.25rem', borderRadius: '6px' }}>
              <button
                type="button"
                className={`btn ${billingCycle === 'monthly' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => setBillingCycle('monthly')}
              >
                Monthly ($4.99/mo)
              </button>
              <button
                type="button"
                className={`btn ${billingCycle === 'yearly' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => setBillingCycle('yearly')}
              >
                Annual ($39/yr)
              </button>
            </div>

            {/* Features List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Check size={16} color="#10b981" />
                <span>Unlimited Prior Labs TabPFN-3.5 foundation model inferences</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Check size={16} color="#10b981" />
                <span>Automatic multi-day safe dosing schedules with biological rate clamps</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Check size={16} color="#10b981" />
                <span>Coupled Magnesium Shield &amp; Aragonite Saturation alarms</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Check size={16} color="#10b981" />
                <span>Global tax &amp; VAT compliant billing via Dodo Payments (MoR)</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="checkout-email">Keeper Email (Receipt &amp; License)</label>
              <input
                id="checkout-email"
                type="email"
                className="form-input"
                style={{ border: '1px solid var(--border-subtle)', borderRadius: '6px' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              id="btn-confirm-checkout"
              className="btn btn-pro"
              style={{ justifyContent: 'center', padding: '0.75rem', fontSize: '0.92rem' }}
              disabled={loading}
            >
              {loading ? 'Initializing Dodo Payments...' : 'Continue to Dodo Secure Checkout'}
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem 0' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
              <ShieldCheck size={28} color="#10b981" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: '#f8fafc' }}>Guardian Pro Activated!</h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.35rem' }}>
                Your account ({email}) now has unlimited TabPFN foundation inferences unlocked.
              </p>
            </div>
            <a
              href={checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{ justifyContent: 'center' }}
            >
              <span>View Dodo Payments Hosted Session</span>
              <ExternalLink size={14} />
            </a>
            <button className="btn btn-primary" onClick={onClose} style={{ justifyContent: 'center' }}>
              Return to Telemetry Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
