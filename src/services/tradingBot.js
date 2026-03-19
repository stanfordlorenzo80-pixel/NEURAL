// AI Trading Bot Engine — Real Indicators + Real Execution
import { MarketDataService } from './marketData';
import { PortfolioService } from './portfolio';
import { pushNotification } from '../components/NotificationsPanel';

// ===== REAL TECHNICAL INDICATORS =====
function calculateSMA(prices, period) {
  if (prices.length < period) return null;
  const slice = prices.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

function calculateEMA(prices, period) {
  if (prices.length < period) return null;
  const k = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k);
  }
  return ema;
}

function calculateRSI(prices, period = 14) {
  if (prices.length < period + 1) return 50;
  let gains = 0, losses = 0;
  for (let i = prices.length - period; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff > 0) gains += diff; else losses -= diff;
  }
  const avgGain = gains / period;
  const avgLoss = losses / period;
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

function calculateMACD(prices) {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  if (ema12 === null || ema26 === null) return { macd: 0, signal: 0, histogram: 0 };
  const macd = ema12 - ema26;
  // Simplified signal line
  const signal = calculateEMA([...prices.slice(-9).map(() => macd)], 9) || macd;
  return { macd, signal, histogram: macd - signal };
}

function calculateBollingerBands(prices, period = 20) {
  if (prices.length < period) return null;
  const sma = calculateSMA(prices, period);
  const slice = prices.slice(-period);
  const variance = slice.reduce((sum, p) => sum + Math.pow(p - sma, 2), 0) / period;
  const std = Math.sqrt(variance);
  return { upper: sma + 2 * std, middle: sma, lower: sma - 2 * std, price: prices[prices.length - 1] };
}

// ===== STRATEGY ENGINE =====
const STRATEGIES = {
  momentum: {
    name: 'Momentum Rider',
    desc: 'Buys assets with strong upward momentum (EMA crossover + RSI confirmation)',
    analyze: (prices, symbol) => {
      const ema9 = calculateEMA(prices, 9);
      const ema21 = calculateEMA(prices, 21);
      const rsi = calculateRSI(prices);
      const current = prices[prices.length - 1];

      if (ema9 > ema21 && rsi > 50 && rsi < 75) {
        return { action: 'BUY', confidence: Math.min(0.9, 0.5 + (ema9 - ema21) / current * 100),
          reason: `EMA(9) ${ema9.toFixed(2)} crossed above EMA(21) ${ema21.toFixed(2)}, RSI at ${rsi.toFixed(1)} — bullish momentum` };
      }
      if (ema9 < ema21 && rsi < 45) {
        return { action: 'SELL', confidence: Math.min(0.85, 0.4 + (ema21 - ema9) / current * 100),
          reason: `EMA(9) below EMA(21), RSI at ${rsi.toFixed(1)} — momentum fading` };
      }
      return { action: 'HOLD', confidence: 0, reason: `No clear momentum signal (RSI: ${rsi.toFixed(1)})` };
    },
  },
  meanReversion: {
    name: 'Mean Reversion',
    desc: 'Buys when price is oversold (RSI < 30) and sells when overbought (RSI > 70)',
    analyze: (prices) => {
      const rsi = calculateRSI(prices);
      const bb = calculateBollingerBands(prices);

      if (rsi < 30 && bb && bb.price < bb.lower) {
        return { action: 'BUY', confidence: Math.min(0.92, 0.6 + (30 - rsi) / 100),
          reason: `RSI at ${rsi.toFixed(1)} (oversold) + price below lower Bollinger Band — reversal likely` };
      }
      if (rsi > 70 && bb && bb.price > bb.upper) {
        return { action: 'SELL', confidence: Math.min(0.88, 0.5 + (rsi - 70) / 100),
          reason: `RSI at ${rsi.toFixed(1)} (overbought) + price above upper Bollinger Band — pullback likely` };
      }
      return { action: 'HOLD', confidence: 0, reason: `RSI at ${rsi.toFixed(1)}, price within bands — no reversal signal` };
    },
  },
  scalper: {
    name: 'Scalper Pro',
    desc: 'Quick trades on MACD crossovers with tight stops',
    analyze: (prices) => {
      const { macd, histogram } = calculateMACD(prices);
      const rsi = calculateRSI(prices);
      const current = prices[prices.length - 1];
      const prev = prices[prices.length - 2] || current;
      const momentum = (current - prev) / prev * 100;

      if (histogram > 0 && momentum > 0.1 && rsi < 65) {
        return { action: 'BUY', confidence: Math.min(0.78, 0.45 + Math.abs(histogram) / current * 1000),
          reason: `MACD histogram positive (${histogram.toFixed(4)}), price momentum +${momentum.toFixed(2)}%` };
      }
      if (histogram < 0 && momentum < -0.1) {
        return { action: 'SELL', confidence: Math.min(0.75, 0.4 + Math.abs(histogram) / current * 1000),
          reason: `MACD histogram negative (${histogram.toFixed(4)}), momentum ${momentum.toFixed(2)}%` };
      }
      return { action: 'HOLD', confidence: 0, reason: `MACD histogram: ${histogram.toFixed(4)}, waiting for signal` };
    },
  },
  sentiment: {
    name: 'AI Sentiment',
    desc: 'Combines multiple indicators for a weighted consensus signal',
    analyze: (prices) => {
      const rsi = calculateRSI(prices);
      const { histogram } = calculateMACD(prices);
      const ema9 = calculateEMA(prices, 9);
      const ema21 = calculateEMA(prices, 21);
      const current = prices[prices.length - 1];
      const bb = calculateBollingerBands(prices);

      let score = 0; const reasons = [];
      if (rsi < 35) { score += 2; reasons.push(`RSI oversold (${rsi.toFixed(1)})`); }
      else if (rsi > 65) { score -= 2; reasons.push(`RSI overbought (${rsi.toFixed(1)})`); }
      if (ema9 > ema21) { score += 1; reasons.push('EMA bullish cross'); }
      else { score -= 1; reasons.push('EMA bearish'); }
      if (histogram > 0) { score += 1; reasons.push('MACD positive'); }
      else { score -= 1; reasons.push('MACD negative'); }
      if (bb && current < bb.lower) { score += 2; reasons.push('Below Bollinger lower'); }
      if (bb && current > bb.upper) { score -= 2; reasons.push('Above Bollinger upper'); }

      if (score >= 3) return { action: 'BUY', confidence: Math.min(0.9, 0.4 + score * 0.1), reason: `Strong buy consensus: ${reasons.join(', ')}` };
      if (score <= -3) return { action: 'SELL', confidence: Math.min(0.85, 0.4 + Math.abs(score) * 0.1), reason: `Strong sell consensus: ${reasons.join(', ')}` };
      return { action: 'HOLD', confidence: 0, reason: `Mixed signals (score: ${score}): ${reasons.join(', ')}` };
    },
  },
};

// ===== AI STRATEGY BUILDER =====
function parseCustomStrategy(prompt) {
  const lower = prompt.toLowerCase();
  const rules = { entry: [], exit: [], stopLoss: 0.05, takeProfit: 0.1 };

  // Parse RSI rules
  const rsiMatch = lower.match(/rsi\s*(below|under|drops?\s*(below|under))\s*(\d+)/);
  if (rsiMatch) rules.entry.push({ type: 'rsi_below', value: parseInt(rsiMatch[3]) });
  const rsiSell = lower.match(/rsi\s*(above|over|crosses?\s*(above|over))\s*(\d+)/);
  if (rsiSell) rules.exit.push({ type: 'rsi_above', value: parseInt(rsiSell[3]) });

  // Parse MA crossover
  if (lower.includes('golden cross') || lower.includes('ma cross')) {
    rules.entry.push({ type: 'ema_cross_above', fast: 9, slow: 21 });
  }

  // Parse stop loss
  const slMatch = lower.match(/stop\s*loss\s*(?:of\s*)?(\d+(?:\.\d+)?)\s*%/);
  if (slMatch) rules.stopLoss = parseFloat(slMatch[1]) / 100;

  // Parse take profit
  const tpMatch = lower.match(/take\s*profit\s*(?:of\s*)?(\d+(?:\.\d+)?)\s*%/);
  if (tpMatch) rules.takeProfit = parseFloat(tpMatch[1]) / 100;

  // Parse price drop
  const dropMatch = lower.match(/drops?\s*(\d+(?:\.\d+)?)\s*%/);
  if (dropMatch && !rsiMatch) rules.entry.push({ type: 'price_drop', value: parseFloat(dropMatch[1]) });

  // Parse bounce/rise
  const bounceMatch = lower.match(/(?:bounce|rise|up)\s*(\d+(?:\.\d+)?)\s*%/);
  if (bounceMatch) rules.exit.push({ type: 'price_rise', value: parseFloat(bounceMatch[1]) });

  // Default rules if nothing was parsed
  if (rules.entry.length === 0) rules.entry.push({ type: 'rsi_below', value: 35 });
  if (rules.exit.length === 0) rules.exit.push({ type: 'rsi_above', value: 65 });

  return rules;
}

function runCustomStrategy(prices, rules) {
  const current = prices[prices.length - 1];
  const rsi = calculateRSI(prices);
  const ema9 = calculateEMA(prices, 9);
  const ema21 = calculateEMA(prices, 21);
  const reasons = [];

  let shouldBuy = false, shouldSell = false;

  for (const rule of rules.entry) {
    if (rule.type === 'rsi_below' && rsi < rule.value) { shouldBuy = true; reasons.push(`RSI ${rsi.toFixed(1)} < ${rule.value}`); }
    if (rule.type === 'ema_cross_above' && ema9 > ema21) { shouldBuy = true; reasons.push(`EMA(${rule.fast}) > EMA(${rule.slow})`); }
    if (rule.type === 'price_drop') {
      const pctDown = ((prices[0] - current) / prices[0]) * 100;
      if (pctDown > rule.value) { shouldBuy = true; reasons.push(`Price down ${pctDown.toFixed(1)}%`); }
    }
  }

  for (const rule of rules.exit) {
    if (rule.type === 'rsi_above' && rsi > rule.value) { shouldSell = true; reasons.push(`RSI ${rsi.toFixed(1)} > ${rule.value}`); }
    if (rule.type === 'price_rise') {
      const pctUp = ((current - prices[0]) / prices[0]) * 100;
      if (pctUp > rule.value) { shouldSell = true; reasons.push(`Price up ${pctUp.toFixed(1)}%`); }
    }
  }

  if (shouldBuy) return { action: 'BUY', confidence: 0.72, reason: `Custom strategy entry: ${reasons.join(', ')}` };
  if (shouldSell) return { action: 'SELL', confidence: 0.68, reason: `Custom strategy exit: ${reasons.join(', ')}` };
  return { action: 'HOLD', confidence: 0, reason: `Waiting for conditions (RSI: ${rsi.toFixed(1)})` };
}

function backtestStrategy(rules, historicalPrices) {
  let cash = 100000, position = 0, entryPrice = 0;
  let wins = 0, losses = 0, trades = 0;
  let maxDrawdown = 0, peak = cash;

  for (let i = 20; i < historicalPrices.length; i++) {
    const window = historicalPrices.slice(Math.max(0, i - 50), i + 1);
    const result = runCustomStrategy(window, rules);
    const price = historicalPrices[i];

    if (result.action === 'BUY' && position === 0) {
      position = Math.floor(cash * 0.95 / price);
      entryPrice = price;
      cash -= position * price;
      trades++;
    } else if (result.action === 'SELL' && position > 0) {
      cash += position * price;
      if (price > entryPrice) wins++; else losses++;
      position = 0;
    }

    // Stop loss / take profit
    if (position > 0) {
      if (price < entryPrice * (1 - rules.stopLoss)) { cash += position * price; losses++; position = 0; }
      if (price > entryPrice * (1 + rules.takeProfit)) { cash += position * price; wins++; position = 0; }
    }

    const total = cash + position * price;
    if (total > peak) peak = total;
    const dd = (peak - total) / peak;
    if (dd > maxDrawdown) maxDrawdown = dd;
  }

  const finalValue = cash + position * (historicalPrices[historicalPrices.length - 1] || 0);
  const totalReturn = ((finalValue - 100000) / 100000) * 100;
  const winRate = trades > 0 ? (wins / (wins + losses)) * 100 : 0;
  const sharpe = totalReturn > 0 ? (totalReturn / Math.max(maxDrawdown * 100, 1)) * 0.5 : 0;

  return { totalReturn: +totalReturn.toFixed(2), winRate: +winRate.toFixed(1), sharpeRatio: +sharpe.toFixed(2), maxDrawdown: +(maxDrawdown * 100).toFixed(1), trades, wins, losses };
}

// ===== BOT STATE =====
let botState = {
  isRunning: false, isPaused: false, activeStrategy: null,
  customStrategies: [], signals: [],
  stats: { totalTrades: 0, winningTrades: 0, losingTrades: 0, totalPnL: 0, sharpeRatio: 0 },
  settings: { positionSize: 5, stopLoss: 3, takeProfit: 8, maxPositions: 3 },
};
let botInterval = null;
let botListeners = [];

function notifyBotListeners() { botListeners.forEach(fn => fn({ ...botState })); }

function generateSignal() {
  if (!botState.activeStrategy || botState.isPaused) return;
  const prices = MarketDataService.getCurrentPrices();
  const assets = Object.keys(prices);
  if (assets.length === 0) return;

  // Pick a random asset to analyze
  const symbol = assets[Math.floor(Math.random() * assets.length)];
  const asset = prices[symbol];
  const history = MarketDataService.getHistory(symbol, 50);
  const closePrices = history.map(h => h.close);
  if (closePrices.length < 15) return;

  let result;
  const strat = botState.activeStrategy;
  if (strat.custom && strat.rules) {
    result = runCustomStrategy(closePrices, strat.rules);
  } else if (STRATEGIES[strat.id]) {
    result = STRATEGIES[strat.id].analyze(closePrices, symbol);
  } else return;

  const signal = {
    id: Date.now(), symbol, action: result.action, price: asset.price,
    confidence: result.confidence, reason: result.reason,
    strategy: strat.name, time: new Date().toISOString(), executed: false,
  };

  // Auto-execute trades with >60% confidence
  if (result.action !== 'HOLD' && result.confidence > 0.6) {
    const portfolio = PortfolioService.getPortfolio();
    const size = portfolio.cash * (botState.settings.positionSize / 100);

    if (result.action === 'BUY' && size > 10) {
      const qty = size / asset.price;
      const trade = PortfolioService.executeTrade(symbol, 'BUY', +qty.toFixed(6), asset.price, strat.name);
      if (trade.success) {
        signal.executed = true;
        botState.stats.totalTrades++;
        pushNotification({ type: 'trade', title: `Bot: Bought ${symbol}`, message: `${qty.toFixed(4)} @ $${asset.price.toFixed(2)} — ${result.reason}` });
      }
    } else if (result.action === 'SELL') {
      const holdings = portfolio.holdings[symbol];
      if (holdings && holdings.quantity > 0) {
        const trade = PortfolioService.executeTrade(symbol, 'SELL', holdings.quantity, asset.price, strat.name);
        if (trade.success) {
          signal.executed = true;
          botState.stats.totalTrades++;
          const pnl = (asset.price - holdings.avgPrice) * holdings.quantity;
          if (pnl > 0) { botState.stats.winningTrades++; botState.stats.totalPnL += pnl; }
          else { botState.stats.losingTrades++; botState.stats.totalPnL += pnl; }
          pushNotification({ type: 'trade', title: `Bot: Sold ${symbol}`, message: `P&L: ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)} — ${result.reason}` });
        }
      }
    }
  }

  if (result.action !== 'HOLD') {
    pushNotification({ type: 'signal', title: `${result.action} Signal: ${symbol}`, message: `${(result.confidence * 100).toFixed(0)}% confidence — ${result.reason}` });
  }

  botState.signals = [signal, ...botState.signals].slice(0, 50);
  notifyBotListeners();
}

export const TradingBotService = {
  start: (strategyId) => {
    let strat;
    if (STRATEGIES[strategyId]) {
      strat = { id: strategyId, ...STRATEGIES[strategyId] };
    } else {
      strat = botState.customStrategies.find(s => s.id === strategyId);
    }
    if (!strat) return;
    botState.isRunning = true; botState.isPaused = false; botState.activeStrategy = strat;
    clearInterval(botInterval);
    generateSignal();
    botInterval = setInterval(generateSignal, 20000);
    pushNotification({ type: 'alert', title: 'Bot Started', message: `Running "${strat.name}" strategy` });
    notifyBotListeners();
  },
  stop: () => { clearInterval(botInterval); botState.isRunning = false; botState.isPaused = false; notifyBotListeners(); },
  pause: () => { botState.isPaused = true; notifyBotListeners(); },
  resume: () => { botState.isPaused = false; notifyBotListeners(); },
  getBotState: () => ({ ...botState }),
  getStrategies: () => Object.entries(STRATEGIES).map(([id, s]) => ({ id, ...s })),
  subscribe: (fn) => { botListeners.push(fn); return () => { botListeners = botListeners.filter(l => l !== fn); }; },
  updateSettings: (settings) => { botState.settings = { ...botState.settings, ...settings }; notifyBotListeners(); },
  createCustomStrategy: (prompt) => {
    const rules = parseCustomStrategy(prompt);
    // Backtest using BTC history
    const history = MarketDataService.getHistory('BTC', 90);
    const closePrices = history.map(h => h.close);
    const backtest = backtestStrategy(rules, closePrices);
    const strategy = {
      id: 'custom_' + Date.now(), name: 'Custom: ' + prompt.slice(0, 40),
      desc: prompt, rules, backtest, custom: true,
    };
    botState.customStrategies.push(strategy);
    notifyBotListeners();
    return { strategy, backtest };
  },
};
