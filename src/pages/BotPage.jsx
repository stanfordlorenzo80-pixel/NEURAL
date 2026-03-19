import { useState, useEffect, useRef, useContext } from 'react';
import { TradingBotService } from '../services/tradingBot';
import { MarketDataService } from '../services/marketData';
import { UserContext } from '../App';
import { Play, Pause, Square, Sparkles, CheckCircle, XCircle, Bot, Send, Settings as SettingsIcon, TrendingUp, TrendingDown } from 'lucide-react';
import './BotPage.css';

export default function BotPage() {
  const { refreshUser } = useContext(UserContext);
  const [botState, setBotState] = useState(TradingBotService.getBotState());
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [builderPrompt, setBuilderPrompt] = useState('');
  const [builderChat, setBuilderChat] = useState([]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const signalFeedRef = useRef(null);

  useEffect(() => {
    const stop = MarketDataService.startUpdates(15000);
    const unsub = TradingBotService.subscribe(s => { setBotState(s); refreshUser(); });
    return () => { stop(); unsub(); };
  }, []);

  const strategies = TradingBotService.getStrategies();

  const handleStart = () => {
    if (selectedStrategy) TradingBotService.start(selectedStrategy);
  };

  const handleBuildStrategy = () => {
    if (!builderPrompt.trim()) return;
    const userMsg = { role: 'user', content: builderPrompt };
    setBuilderChat(prev => [...prev, userMsg]);
    const prompt = builderPrompt;
    setBuilderPrompt('');
    setIsBuilding(true);

    setTimeout(() => {
      const result = TradingBotService.createCustomStrategy(prompt);
      const bt = result.backtest;
      const botMsg = {
        role: 'bot',
        content: `✅ Strategy created & backtested!\n\n📊 Backtest Results (90 days):\n• Win Rate: ${bt.winRate}%\n• Total Return: ${bt.totalReturn}%\n• Sharpe Ratio: ${bt.sharpeRatio}\n• Max Drawdown: -${bt.maxDrawdown}%\n• Trades: ${bt.trades} (${bt.wins}W / ${bt.losses}L)\n\nWould you like to deploy this strategy?`,
        strategyId: result.strategy.id,
      };
      setBuilderChat(prev => [...prev, botMsg]);
      setIsBuilding(false);
    }, 2500);
  };

  const handleDeployStrategy = (stratId) => {
    setSelectedStrategy(stratId);
    TradingBotService.start(stratId);
    setBuilderChat(prev => [...prev, { role: 'bot', content: '🚀 Strategy deployed and running! Check the Live Signals feed.' }]);
  };

  const winRate = botState.stats.totalTrades > 0
    ? ((botState.stats.winningTrades / botState.stats.totalTrades) * 100).toFixed(1) : '—';

  return (
    <div className="bot-page">
      <div className="bot-header-bar">
        <div className="bot-title-area">
          <Bot size={24} className="bot-title-icon" />
          <div>
            <h2>AI Trading Bot</h2>
            <span className={`bot-status-badge ${botState.isRunning ? (botState.isPaused ? 'paused' : 'running') : 'stopped'}`}>
              {botState.isRunning ? (botState.isPaused ? '⏸ Paused' : '🟢 Running') : '⏹ Stopped'}
              {botState.activeStrategy && ` — ${botState.activeStrategy.name}`}
            </span>
          </div>
        </div>
        <div className="bot-controls">
          <button className="btn-primary" onClick={() => setShowBuilder(true)}>
            <Sparkles size={16} /> AI Strategy Builder
          </button>
          <button className="control-btn settings" onClick={() => setShowSettings(!showSettings)}>
            <SettingsIcon size={18} />
          </button>
          {botState.isRunning ? (
            <>
              <button className="control-btn pause" onClick={() => botState.isPaused ? TradingBotService.resume() : TradingBotService.pause()}>
                <Pause size={18} /> {botState.isPaused ? 'Resume' : 'Pause'}
              </button>
              <button className="control-btn stop" onClick={() => TradingBotService.stop()}>
                <Square size={18} /> Stop
              </button>
            </>
          ) : (
            <button className="control-btn start" onClick={handleStart} disabled={!selectedStrategy}>
              <Play size={18} /> Start Bot
            </button>
          )}
        </div>
      </div>

      {showSettings && (
        <div className="settings-panel glass-card animate-fade-in">
          <h3><SettingsIcon size={16} /> Bot Settings</h3>
          <div className="settings-grid">
            <label><span>Position Size (%)</span>
              <input type="number" value={botState.settings.positionSize} min="1" max="100"
                onChange={e => TradingBotService.updateSettings({ positionSize: +e.target.value })} /></label>
            <label><span>Stop Loss (%)</span>
              <input type="number" value={botState.settings.stopLoss} min="0.5" max="20" step="0.5"
                onChange={e => TradingBotService.updateSettings({ stopLoss: +e.target.value })} /></label>
            <label><span>Take Profit (%)</span>
              <input type="number" value={botState.settings.takeProfit} min="0.5" max="50" step="0.5"
                onChange={e => TradingBotService.updateSettings({ takeProfit: +e.target.value })} /></label>
            <label><span>Max Positions</span>
              <input type="number" value={botState.settings.maxPositions} min="1" max="20"
                onChange={e => TradingBotService.updateSettings({ maxPositions: +e.target.value })} /></label>
          </div>
        </div>
      )}

      <div className="bot-content">
        {/* Strategies */}
        <div className="strategies-section">
          <h3>Select Strategy</h3>
          <div className="strategies-grid">
            {strategies.map(strat => (
              <div key={strat.id}
                className={`strategy-card glass-card ${selectedStrategy === strat.id ? 'selected' : ''}`}
                onClick={() => setSelectedStrategy(strat.id)}>
                <h4>{strat.name}</h4>
                <p>{strat.desc}</p>
                {botState.activeStrategy?.id === strat.id && <span className="active-strat-badge">Active</span>}
              </div>
            ))}
            {botState.customStrategies.map(strat => (
              <div key={strat.id}
                className={`strategy-card glass-card custom ${selectedStrategy === strat.id ? 'selected' : ''}`}
                onClick={() => setSelectedStrategy(strat.id)}>
                <span className="custom-badge">AI Custom</span>
                <h4>{strat.name}</h4>
                <p>{strat.desc.slice(0, 80)}...</p>
                {strat.backtest && (
                  <div className="strat-stats">
                    <span className="stat-positive">{strat.backtest.winRate}% WR</span>
                    <span>{strat.backtest.sharpeRatio} Sharpe</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right panel: Stats + Signals */}
        <div className="bot-right-panel">
          <div className="bot-stats glass-card">
            <h3>Performance</h3>
            <div className="bot-stats-grid">
              <div className="bot-stat-item"><span className="bot-stat-val">{botState.stats.totalTrades}</span><span className="bot-stat-lbl">Total Trades</span></div>
              <div className="bot-stat-item"><span className="bot-stat-val stat-positive">{botState.stats.winningTrades}</span><span className="bot-stat-lbl">Wins</span></div>
              <div className="bot-stat-item"><span className="bot-stat-val stat-negative">{botState.stats.losingTrades}</span><span className="bot-stat-lbl">Losses</span></div>
              <div className="bot-stat-item"><span className="bot-stat-val">{winRate}%</span><span className="bot-stat-lbl">Win Rate</span></div>
              <div className="bot-stat-item">
                <span className={`bot-stat-val ${botState.stats.totalPnL >= 0 ? 'stat-positive' : 'stat-negative'}`}>
                  ${botState.stats.totalPnL.toFixed(2)}
                </span><span className="bot-stat-lbl">Total P&L</span>
              </div>
            </div>
          </div>

          <div className="signal-feed glass-card">
            <h3>Live Signals</h3>
            <div className="signal-list" ref={signalFeedRef}>
              {botState.signals.length > 0 ? botState.signals.map(signal => (
                <div key={signal.id} className="signal-item animate-slide-in">
                  <div className="signal-top">
                    <span className={`signal-type ${signal.action.toLowerCase()}`}>{signal.action}</span>
                    <span className="signal-symbol">{signal.symbol}</span>
                    <span className="signal-price">${signal.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    <span className="signal-confidence" style={{ color: signal.confidence >= 0.7 ? 'var(--green)' : 'var(--yellow)' }}>
                      {(signal.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="signal-reason">{signal.reason}</p>
                  <div className="signal-bottom">
                    <span className="signal-time">{new Date(signal.time).toLocaleTimeString()}</span>
                    <span className="signal-strat">{signal.strategy}</span>
                    {signal.executed && <span className="signal-executed">✅ Executed</span>}
                  </div>
                </div>
              )) : (
                <p className="empty-text">No signals yet. Select a strategy and start the bot!</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Builder Modal */}
      {showBuilder && (
        <div className="builder-overlay" onClick={() => setShowBuilder(false)}>
          <div className="builder-modal glass-card" onClick={e => e.stopPropagation()}>
            <div className="builder-header">
              <Sparkles size={20} /> <h3>AI Strategy Builder</h3>
              <button className="close-btn" onClick={() => setShowBuilder(false)}>✕</button>
            </div>
            <div className="builder-chat">
              {builderChat.length === 0 && (
                <div className="builder-welcome">
                  <Bot size={40} />
                  <h4>Describe Your Strategy</h4>
                  <p>Tell me in plain English how you want to trade. I'll create a strategy, backtest it on real data, and let you deploy it.</p>
                  <div className="builder-examples">
                    <button onClick={() => setBuilderPrompt('Buy BTC when RSI drops below 30 and sell when it crosses above 70, with a 2% stop loss')}>RSI Strategy</button>
                    <button onClick={() => setBuilderPrompt('Follow momentum — buy on EMA golden cross, sell on death cross, 5% take profit')}>Momentum</button>
                    <button onClick={() => setBuilderPrompt('Buy when price drops 5% in a day, sell after a 3% bounce, tight 1% stop loss')}>Dip Buyer</button>
                  </div>
                </div>
              )}
              {builderChat.map((msg, i) => (
                <div key={i} className={`builder-msg ${msg.role}`}>
                  {msg.role === 'bot' && <Bot size={16} />}
                  <div className="builder-msg-content">
                    {msg.content.split('\n').map((line, j) => <p key={j}>{line}</p>)}
                    {msg.strategyId && (
                      <button className="btn-primary deploy-btn" onClick={() => handleDeployStrategy(msg.strategyId)}>
                        🚀 Deploy Strategy
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {isBuilding && (
                <div className="builder-msg bot">
                  <Bot size={16} />
                  <div className="builder-thinking"><span>Parsing rules, backtesting on 90 days of data</span><span className="dots">...</span></div>
                </div>
              )}
            </div>
            <div className="builder-input">
              <input type="text" placeholder="Describe your trading strategy..."
                value={builderPrompt} onChange={e => setBuilderPrompt(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleBuildStrategy()} />
              <button className="btn-primary" onClick={handleBuildStrategy} disabled={isBuilding}><Send size={16} /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
