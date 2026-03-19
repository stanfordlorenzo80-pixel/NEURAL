// Portfolio Management Service — User-aware
import { AuthService } from './auth';

let portfolioListeners = [];

function notifyListeners() {
  portfolioListeners.forEach(fn => fn(getPortfolio()));
}

function getPortfolio() {
  const user = AuthService.getCurrentUser();
  if (!user) return { cash: 0, holdings: {}, transactions: [], initialBalance: 0, mode: 'paper' };
  return { ...user.portfolio, mode: 'paper' };
}

function savePortfolio(portfolio) {
  const session = AuthService.getSession();
  if (!session) return;
  AuthService.updatePortfolio(session.username, portfolio);
}

function executeTrade(symbol, type, quantity, price, strategy = 'Manual') {
  const portfolio = getPortfolio();
  const total = quantity * price;

  if (type === 'BUY') {
    if (total > portfolio.cash) return { success: false, error: 'Insufficient funds' };
    portfolio.cash -= total;
    if (!portfolio.holdings[symbol]) {
      portfolio.holdings[symbol] = { quantity: 0, avgPrice: 0, totalCost: 0 };
    }
    const holding = portfolio.holdings[symbol];
    holding.totalCost += total;
    holding.quantity += quantity;
    holding.avgPrice = holding.totalCost / holding.quantity;
  } else if (type === 'SELL') {
    if (!portfolio.holdings[symbol] || portfolio.holdings[symbol].quantity < quantity) {
      return { success: false, error: 'Insufficient holdings' };
    }
    const holding = portfolio.holdings[symbol];
    const pnl = (price - holding.avgPrice) * quantity;
    portfolio.cash += total;
    holding.quantity -= quantity;
    holding.totalCost = holding.avgPrice * holding.quantity;
    if (holding.quantity <= 0) delete portfolio.holdings[symbol];
  }

  const transaction = {
    id: Date.now() + Math.random(),
    symbol,
    type,
    quantity,
    price,
    total,
    strategy,
    date: new Date().toISOString(),
    mode: 'paper',
    pnl: type === 'SELL' ? +((price - (portfolio.holdings[symbol]?.avgPrice || price)) * quantity).toFixed(2) : null,
  };
  if (!portfolio.transactions) portfolio.transactions = [];
  portfolio.transactions.unshift(transaction);

  savePortfolio(portfolio);
  notifyListeners();
  return { success: true, transaction };
}

function getPortfolioValue(currentPrices) {
  const portfolio = getPortfolio();
  let holdingsValue = 0;
  Object.entries(portfolio.holdings || {}).forEach(([symbol, holding]) => {
    const priceData = currentPrices[symbol];
    if (priceData) {
      holdingsValue += holding.quantity * priceData.price;
    }
  });
  return {
    cash: portfolio.cash,
    holdingsValue,
    totalValue: portfolio.cash + holdingsValue,
    pnl: portfolio.cash + holdingsValue - portfolio.initialBalance,
    pnlPercent: ((portfolio.cash + holdingsValue - portfolio.initialBalance) / portfolio.initialBalance * 100),
    mode: 'paper',
  };
}

function getHoldingsWithPrices(currentPrices) {
  const portfolio = getPortfolio();
  return Object.entries(portfolio.holdings || {}).map(([symbol, holding]) => {
    const priceData = currentPrices[symbol];
    const currentValue = priceData ? holding.quantity * priceData.price : 0;
    const pnl = currentValue - holding.totalCost;
    return {
      symbol,
      name: priceData?.name || symbol,
      quantity: holding.quantity,
      avgPrice: holding.avgPrice,
      currentPrice: priceData?.price || 0,
      currentValue,
      pnl,
      pnlPercent: holding.totalCost > 0 ? (pnl / holding.totalCost) * 100 : 0,
      changePercent: priceData?.changePercent || 0,
    };
  });
}

function refillBalance() {
  const session = AuthService.getSession();
  if (!session) return;
  AuthService.refillBalance(session.username);
  notifyListeners();
}

function resetPortfolio() {
  refillBalance();
}

export const PortfolioService = {
  getPortfolio,
  executeTrade,
  getPortfolioValue,
  getHoldingsWithPrices,
  getTransactions: () => {
    const portfolio = getPortfolio();
    return [...(portfolio.transactions || [])];
  },
  setMode: () => {},
  getMode: () => 'paper',
  resetPortfolio,
  refillBalance,
  subscribe: (fn) => {
    portfolioListeners.push(fn);
    return () => { portfolioListeners = portfolioListeners.filter(l => l !== fn); };
  },
};
