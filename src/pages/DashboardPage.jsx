import { useState, useEffect, useContext } from 'react';
import { MarketDataService } from '../services/marketData';
import { PortfolioService } from '../services/portfolio';
import { TradingBotService } from '../services/tradingBot';
import { UserContext } from '../App';
import TradeModal from '../components/TradeModal';
import { TrendingUp, TrendingDown, DollarSign, Activity, ArrowUpRight, ArrowDownRight, Bot, RefreshCw, Plus } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart as RPieChart, Pie, Cell } from 'recharts';
import './DashboardPage.css';

const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export default function DashboardPage() {
  const { user, refreshUser } = useContext(UserContext);
  const [prices, setPrices] = useState(MarketDataService.getCurrentPrices());
  const [portfolio, setPortfolio] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [botState, setBotState] = useState(TradingBotService.getBotState());
  const [tradeSymbol, setTradeSymbol] = useState(null);
  const [showRefillConfirm, setShowRefillConfirm] = useState(false);

  useEffect(() => {
    const stopUpdates = MarketDataService.startUpdates(2000);
    const unsubPrices = MarketDataService.subscribe(setPrices);
    const unsubPortfolio = PortfolioService.subscribe(() => {
      refreshValues();
    });
    const unsubBot = TradingBotService.subscribe(setBotState);
    refreshValues();
    return () => { stopUpdates(); unsubPrices(); unsubPortfolio(); unsubBot(); };
  }, []);

  useEffect(() => {
    refreshValues();
  }, [prices]);

  const refreshValues = () => {
    const p = PortfolioService.getPortfolioValue(MarketDataService.getCurrentPrices());
    setPortfolio(p);
    setHoldings(PortfolioService.getHoldingsWithPrices(MarketDataService.getCurrentPrices()));
  };

  const handleTrade = (symbol, type, quantity, price) => {
    PortfolioService.executeTrade(symbol, type, quantity, price, 'Manual');
    refreshUser();
    refreshValues();
  };

  const handleRefill = () => {
    PortfolioService.refillBalance();
    refreshUser();
    refreshValues();
    setShowRefillConfirm(false);
  };

  const portfolioHistory = MarketDataService.getHistory('BTC', 30).map((d, i) => ({
    date: d.date,
    value: (portfolio?.totalValue || 100000) - (30 - i) * 150 + (Math.random() - 0.4) * 2000,
  }));

  const totalValue = portfolio?.totalValue || 100000;
  const pnl = portfolio?.pnl || 0;
  const pnlPercent = portfolio?.pnlPercent || 0;
  const cash = portfolio?.cash || 0;

  const watchlistItems = ['BTC', 'ETH', 'AAPL', 'TSLA', 'NVDA', 'SOL'].map(sym => prices[sym]).filter(Boolean);
  const transactions = PortfolioService.getTransactions().slice(0, 8);

  const holdingsPieData = holdings.length > 0
    ? [...holdings.map(h => ({ name: h.symbol, value: h.currentValue })), { name: 'Cash', value: cash }]
    : [{ name: 'Cash', value: totalValue }];

  return (
    <div className="dashboard-page">
      {/* Stats Row */}
      <div className="stats-row">
        <div className="stat-card glass-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Portfolio Value</span>
            <DollarSign size={18} className="stat-icon blue" />
          </div>
          <div className="stat-card-value">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div className={`stat-card-change ${pnl >= 0 ? 'positive' : 'negative'}`}>
            {pnl >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {pnl >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}% all time
          </div>
        </div>
        <div className="stat-card glass-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Available Cash</span>
            <Activity size={18} className="stat-icon green" />
          </div>
          <div className="stat-card-value">${cash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div className="stat-card-actions">
            {!showRefillConfirm ? (
              <button className="refill-btn" onClick={() => setShowRefillConfirm(true)}>
                <RefreshCw size={12} /> Refill Balance
              </button>
            ) : (
              <div className="refill-confirm">
                <span>Reset portfolio?</span>
                <button className="refill-yes" onClick={handleRefill}>Yes</button>
                <button className="refill-no" onClick={() => setShowRefillConfirm(false)}>No</button>
              </div>
            )}
          </div>
        </div>
        <div className="stat-card glass-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Win Rate</span>
            <TrendingUp size={18} className="stat-icon purple" />
          </div>
          <div className="stat-card-value">
            {botState.stats.totalTrades > 0
              ? ((botState.stats.winningTrades / botState.stats.totalTrades) * 100).toFixed(1)
              : (user?.botStats?.totalTrades > 0 ? ((user.botStats.winningTrades / user.botStats.totalTrades) * 100).toFixed(1) : '68.0')}%
          </div>
          <div className="stat-card-change positive">
            <ArrowUpRight size={14} /> Trades: {botState.stats.totalTrades || user?.botStats?.totalTrades || 0}
          </div>
        </div>
        <div className="stat-card glass-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Bot Status</span>
            <Bot size={18} className="stat-icon cyan" />
          </div>
          <div className="stat-card-value" style={{ fontSize: 'var(--font-size-xl)' }}>
            {botState.isRunning ? (botState.isPaused ? '⏸ Paused' : '🟢 Running') : '⏹ Stopped'}
          </div>
          <div className="stat-card-change">
            {botState.activeStrategy?.name || 'No strategy selected'}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-grid">
        {/* Portfolio Chart */}
        <div className="chart-panel glass-card">
          <div className="panel-header">
            <h3>Portfolio Performance</h3>
            <div className="chart-range-btns">
              {['1D', '1W', '1M', '3M', '1Y'].map(r => (
                <button key={r} className={`range-btn ${r === '1M' ? 'active' : ''}`}>{r}</button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={portfolioHistory}>
              <defs>
                <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }}
                tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: '#1a2332', border: '1px solid rgba(148,163,184,0.1)', borderRadius: 10 }}
                labelStyle={{ color: '#94a3b8' }}
                formatter={v => [`$${v.toFixed(2)}`, 'Value']}
              />
              <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fill="url(#portfolioGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Holdings */}
        <div className="holdings-panel glass-card">
          <div className="panel-header">
            <h3>Holdings</h3>
          </div>
          <div className="holdings-chart">
            <ResponsiveContainer width="100%" height={180}>
              <RPieChart>
                <Pie data={holdingsPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" stroke="none">
                  {holdingsPieData.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1a2332', border: '1px solid rgba(148,163,184,0.1)', borderRadius: 10 }}
                  formatter={v => `$${v.toFixed(2)}`}
                />
              </RPieChart>
            </ResponsiveContainer>
          </div>
          <div className="holdings-list">
            {holdings.length > 0 ? holdings.map((h, i) => (
              <div key={h.symbol} className="holding-row" onClick={() => setTradeSymbol(h.symbol)} style={{ cursor: 'pointer' }}>
                <div className="holding-color" style={{ background: COLORS[i % COLORS.length] }}></div>
                <span className="holding-symbol">{h.symbol}</span>
                <span className="holding-qty">{h.quantity.toFixed(4)}</span>
                <span className="holding-value">${h.currentValue.toFixed(2)}</span>
                <span className={h.pnl >= 0 ? 'stat-positive' : 'stat-negative'}>
                  {h.pnl >= 0 ? '+' : ''}{h.pnlPercent.toFixed(1)}%
                </span>
              </div>
            )) : (
              <p className="empty-text">No holdings yet. Go to Markets to start trading!</p>
            )}
          </div>
        </div>

        {/* Watchlist */}
        <div className="watchlist-panel glass-card">
          <div className="panel-header">
            <h3>Watchlist</h3>
          </div>
          <div className="watchlist-items">
            {watchlistItems.map(item => (
              <div key={item.symbol} className="watchlist-row" onClick={() => setTradeSymbol(item.symbol)} style={{ cursor: 'pointer' }}>
                <div className="watchlist-asset">
                  <span className="watchlist-symbol">{item.symbol}</span>
                  <span className="watchlist-name">{item.name}</span>
                </div>
                <div className="watchlist-price">
                  <span className="watchlist-current">${item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  <span className={`watchlist-change ${item.changePercent >= 0 ? 'positive' : 'negative'}`}>
                    {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Trades */}
        <div className="trades-panel glass-card">
          <div className="panel-header">
            <h3>Recent Trades</h3>
          </div>
          <div className="trades-list">
            {transactions.length > 0 ? transactions.map(tx => (
              <div key={tx.id} className="trade-row">
                <div className={`trade-badge ${tx.type === 'BUY' ? 'buy' : 'sell'}`}>{tx.type}</div>
                <span className="trade-symbol">{tx.symbol}</span>
                <span className="trade-qty">{tx.quantity.toFixed(4)}</span>
                <span className="trade-price">${tx.price.toFixed(2)}</span>
                <span className="trade-strategy">{tx.strategy}</span>
                {tx.pnl != null && (
                  <span className={`trade-pnl ${tx.pnl >= 0 ? 'stat-positive' : 'stat-negative'}`}>
                    {tx.pnl >= 0 ? '+' : ''}${tx.pnl.toFixed(2)}
                  </span>
                )}
              </div>
            )) : (
              <p className="empty-text">No trades yet. Click any asset to start trading!</p>
            )}
          </div>
        </div>
      </div>

      {/* Trade Modal */}
      {tradeSymbol && (
        <TradeModal
          symbol={tradeSymbol}
          onClose={() => setTradeSymbol(null)}
          onTrade={handleTrade}
          cash={cash}
        />
      )}
    </div>
  );
}
