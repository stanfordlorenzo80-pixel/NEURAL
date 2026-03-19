import { useState, useEffect, useContext } from 'react';
import { MarketDataService } from '../services/marketData';
import { PortfolioService } from '../services/portfolio';
import { UserContext } from '../App';
import TradeModal from '../components/TradeModal';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Search, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import './MarketsPage.css';

export default function MarketsPage() {
  const { refreshUser } = useContext(UserContext);
  const [prices, setPrices] = useState(MarketDataService.getCurrentPrices());
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState('BTC');
  const [chartDays, setChartDays] = useState(30);
  const [tradeSymbol, setTradeSymbol] = useState(null);
  const [cash, setCash] = useState(0);

  useEffect(() => {
    const stop = MarketDataService.startUpdates(2000);
    const unsub = MarketDataService.subscribe(p => {
      setPrices(p);
      setCash(PortfolioService.getPortfolioValue(p).cash);
    });
    setCash(PortfolioService.getPortfolioValue(prices).cash);
    return () => { stop(); unsub(); };
  }, []);

  const assets = Object.values(prices).filter(a => {
    if (filter !== 'all' && a.type !== filter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return a.symbol.toLowerCase().includes(q) || a.name.toLowerCase().includes(q);
    }
    return true;
  });

  const selectedData = MarketDataService.getHistory(selectedAsset, chartDays);
  const selectedPrice = prices[selectedAsset];

  const handleTrade = (symbol, type, quantity, price) => {
    PortfolioService.executeTrade(symbol, type, quantity, price, 'Manual');
    refreshUser();
    setCash(PortfolioService.getPortfolioValue(MarketDataService.getCurrentPrices()).cash);
  };

  return (
    <div className="markets-page">
      {/* Chart Section */}
      <div className="market-chart-section glass-card">
        <div className="market-chart-header">
          <div className="chart-asset-info">
            <h2>{selectedAsset}</h2>
            <span className="chart-asset-name">{selectedPrice?.name}</span>
            <span className="chart-asset-price">
              ${selectedPrice?.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className={`chart-asset-change ${selectedPrice?.changePercent >= 0 ? 'positive' : 'negative'}`}>
              {selectedPrice?.changePercent >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {selectedPrice?.changePercent >= 0 ? '+' : ''}{selectedPrice?.changePercent.toFixed(2)}%
            </span>
          </div>
          <div className="chart-range-btns">
            {[{ d: 7, l: '1W' }, { d: 30, l: '1M' }, { d: 90, l: '3M' }, { d: 365, l: '1Y' }].map(r => (
              <button key={r.l} className={`range-btn ${chartDays === r.d ? 'active' : ''}`}
                onClick={() => setChartDays(r.d)}>{r.l}</button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={selectedData}>
            <defs>
              <linearGradient id="marketGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={selectedPrice?.changePercent >= 0 ? '#10b981' : '#ef4444'} stopOpacity={0.3} />
                <stop offset="100%" stopColor={selectedPrice?.changePercent >= 0 ? '#10b981' : '#ef4444'} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }}
              tickFormatter={v => v >= 1000 ? `$${(v/1000).toFixed(1)}k` : `$${v.toFixed(2)}`} domain={['auto', 'auto']} />
            <Tooltip
              contentStyle={{ background: '#1a2332', border: '1px solid rgba(148,163,184,0.1)', borderRadius: 10 }}
              labelStyle={{ color: '#94a3b8' }}
              formatter={v => [`$${v.toFixed(2)}`, 'Close']}
            />
            <Area type="monotone" dataKey="close" stroke={selectedPrice?.changePercent >= 0 ? '#10b981' : '#ef4444'}
              strokeWidth={2} fill="url(#marketGrad)" />
          </AreaChart>
        </ResponsiveContainer>
        <div className="quick-trade-bar">
          <button className="quick-trade-btn buy" onClick={() => setTradeSymbol(selectedAsset)}>
            Trade {selectedAsset}
          </button>
        </div>
      </div>

      {/* Market Table */}
      <div className="market-table-section glass-card">
        <div className="market-table-header">
          <div className="market-filters">
            {['all', 'stock', 'crypto'].map(f => (
              <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}>{f === 'all' ? 'All' : f === 'stock' ? 'Stocks' : 'Crypto'}</button>
            ))}
          </div>
          <div className="market-search">
            <Search size={14} />
            <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
        </div>

        <div className="market-table">
          <div className="table-header-row">
            <span>Asset</span>
            <span>Price</span>
            <span>24h Change</span>
            <span>Volume</span>
            <span>Chart</span>
            <span>Action</span>
          </div>
          {assets.map(asset => {
            const miniHistory = MarketDataService.getHistory(asset.symbol, 7);
            return (
              <div key={asset.symbol} className={`table-row ${selectedAsset === asset.symbol ? 'selected' : ''}`}
                onClick={() => setSelectedAsset(asset.symbol)}>
                <div className="table-asset">
                  <span className="table-symbol">{asset.symbol}</span>
                  <span className="table-name">{asset.name}</span>
                </div>
                <span className="table-price">${asset.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <span className={`table-change ${asset.changePercent >= 0 ? 'positive' : 'negative'}`}>
                  {asset.changePercent >= 0 ? '+' : ''}{asset.changePercent.toFixed(2)}%
                </span>
                <span className="table-volume">${(asset.volume / 1000000).toFixed(1)}M</span>
                <div className="table-mini-chart">
                  <ResponsiveContainer width={80} height={30}>
                    <AreaChart data={miniHistory}>
                      <Area type="monotone" dataKey="close" stroke={asset.changePercent >= 0 ? '#10b981' : '#ef4444'}
                        strokeWidth={1.5} fill="none" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <button className="table-trade-btn" onClick={(e) => { e.stopPropagation(); setTradeSymbol(asset.symbol); }}>
                  Trade
                </button>
              </div>
            );
          })}
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
