import { useState, useEffect } from 'react';
import { MarketDataService } from '../services/marketData';
import { X, ArrowUpRight, ArrowDownRight, DollarSign, AlertTriangle } from 'lucide-react';
import './TradeModal.css';

export default function TradeModal({ symbol, onClose, onTrade, cash }) {
  const [type, setType] = useState('BUY');
  const [inputMode, setInputMode] = useState('dollars'); // 'dollars' or 'quantity'
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState(0);
  const [asset, setAsset] = useState(null);

  useEffect(() => {
    const data = MarketDataService.getPrice(symbol);
    if (data) {
      setPrice(data.price);
      setAsset(data);
    }
    const unsub = MarketDataService.subscribe(prices => {
      if (prices[symbol]) {
        setPrice(prices[symbol].price);
        setAsset(prices[symbol]);
      }
    });
    return unsub;
  }, [symbol]);

  const numAmount = parseFloat(amount) || 0;
  const quantity = inputMode === 'dollars' ? (numAmount / price) : numAmount;
  const totalCost = inputMode === 'dollars' ? numAmount : (numAmount * price);
  const canAfford = type === 'BUY' ? totalCost <= cash : true;
  const isValid = numAmount > 0 && (type === 'SELL' || canAfford);

  const handleTrade = () => {
    if (!isValid) return;
    onTrade(symbol, type, +quantity.toFixed(6), price);
    onClose();
  };

  const handleQuickAmount = (pct) => {
    if (type === 'BUY') {
      setInputMode('dollars');
      setAmount((cash * pct / 100).toFixed(2));
    }
  };

  if (!asset) return null;

  return (
    <div className="trade-overlay" onClick={onClose}>
      <div className="trade-modal glass-card" onClick={e => e.stopPropagation()}>
        <div className="trade-modal-header">
          <div className="trade-asset-info">
            <h3>{symbol}</h3>
            <span className="trade-asset-name">{asset.name}</span>
          </div>
          <div className="trade-price-info">
            <span className="trade-live-price">${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className={`trade-change ${asset.changePercent >= 0 ? 'positive' : 'negative'}`}>
              {asset.changePercent >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {asset.changePercent >= 0 ? '+' : ''}{asset.changePercent.toFixed(2)}%
            </span>
          </div>
          <button className="trade-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="trade-type-toggle">
          <button className={`trade-type-btn ${type === 'BUY' ? 'active buy' : ''}`} onClick={() => setType('BUY')}>Buy</button>
          <button className={`trade-type-btn ${type === 'SELL' ? 'active sell' : ''}`} onClick={() => setType('SELL')}>Sell</button>
        </div>

        <div className="trade-input-section">
          <div className="trade-input-mode">
            <button className={inputMode === 'dollars' ? 'active' : ''} onClick={() => setInputMode('dollars')}>$ Amount</button>
            <button className={inputMode === 'quantity' ? 'active' : ''} onClick={() => setInputMode('quantity')}>Quantity</button>
          </div>
          <div className="trade-input-wrap">
            <span className="trade-input-prefix">{inputMode === 'dollars' ? '$' : '×'}</span>
            <input
              type="number"
              placeholder={inputMode === 'dollars' ? 'Enter amount in USD' : 'Enter quantity'}
              value={amount}
              onChange={e => setAmount(e.target.value)}
              autoFocus
            />
          </div>
          {type === 'BUY' && (
            <div className="quick-amounts">
              {[10, 25, 50, 100].map(pct => (
                <button key={pct} onClick={() => handleQuickAmount(pct)}>{pct}%</button>
              ))}
            </div>
          )}
        </div>

        <div className="trade-summary">
          <div className="trade-summary-row">
            <span>Price</span>
            <span>${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="trade-summary-row">
            <span>Quantity</span>
            <span>{quantity.toFixed(6)}</span>
          </div>
          <div className="trade-summary-row total">
            <span>Total</span>
            <span>${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="trade-summary-row">
            <span>Available Cash</span>
            <span className={!canAfford ? 'text-red' : ''}>${cash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>

        {!canAfford && numAmount > 0 && (
          <div className="trade-warning">
            <AlertTriangle size={14} /> Insufficient funds
          </div>
        )}

        <button
          className={`trade-execute-btn ${type.toLowerCase()}`}
          onClick={handleTrade}
          disabled={!isValid}
        >
          {type === 'BUY' ? '🟢' : '🔴'} {type} {symbol} — ${totalCost.toFixed(2)}
        </button>
      </div>
    </div>
  );
}
