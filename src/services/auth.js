// Authentication Service — localStorage-based
const USERS_KEY = 'neuraltrade_users';
const SESSION_KEY = 'neuraltrade_session';

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || {};
  } catch { return {}; }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch { return null; }
}

function saveSession(session) {
  if (session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

// Initialize with a demo account
function initDemoAccount() {
  const users = getUsers();
  if (!users['demo']) {
    users['demo'] = {
      username: 'demo',
      password: 'demo123',
      plan: 'pro',
      planActivatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      portfolio: {
        cash: 487352.18,
        initialBalance: 500000,
        holdings: {
          BTC: { quantity: 1.5, avgPrice: 64200, totalCost: 96300 },
          ETH: { quantity: 12, avgPrice: 3280, totalCost: 39360 },
          AAPL: { quantity: 50, avgPrice: 172, totalCost: 8600 },
          NVDA: { quantity: 20, avgPrice: 845, totalCost: 16900 },
          TSLA: { quantity: 30, avgPrice: 238, totalCost: 7140 },
        },
        transactions: [
          { id: 1, symbol: 'BTC', type: 'BUY', quantity: 1.5, price: 64200, total: 96300, strategy: 'Manual', date: '2026-03-15T10:30:00Z', mode: 'paper' },
          { id: 2, symbol: 'ETH', type: 'BUY', quantity: 12, price: 3280, total: 39360, strategy: 'Momentum Rider', date: '2026-03-16T14:15:00Z', mode: 'paper' },
          { id: 3, symbol: 'AAPL', type: 'BUY', quantity: 50, price: 172, total: 8600, strategy: 'Mean Reversion', date: '2026-03-17T09:45:00Z', mode: 'paper' },
          { id: 4, symbol: 'NVDA', type: 'BUY', quantity: 20, price: 845, total: 16900, strategy: 'AI Sentiment', date: '2026-03-17T11:20:00Z', mode: 'paper' },
          { id: 5, symbol: 'TSLA', type: 'BUY', quantity: 30, price: 238, total: 7140, strategy: 'Scalper Pro', date: '2026-03-18T16:05:00Z', mode: 'paper' },
          { id: 6, symbol: 'SOL', type: 'BUY', quantity: 100, price: 135, total: 13500, strategy: 'Momentum Rider', date: '2026-03-18T13:00:00Z', mode: 'paper' },
          { id: 7, symbol: 'SOL', type: 'SELL', quantity: 100, price: 142, total: 14200, strategy: 'Momentum Rider', date: '2026-03-19T09:30:00Z', mode: 'paper', pnl: 700 },
        ],
      },
      learningProgress: {
        basics: { completed: [0, 1, 2], quizScore: 4 },
        technical: { completed: [0], quizScore: null },
      },
      botStats: {
        totalTrades: 42,
        winningTrades: 29,
        losingTrades: 13,
        totalPnL: 3847.52,
        sharpeRatio: 1.68,
      },
    };
    saveUsers(users);
  }
}

initDemoAccount();

const PLAN_DEFAULTS = {
  free: { cash: 100000, label: 'Free' },
  pro: { cash: 500000, label: 'Pro' },
  enterprise: { cash: 1000000, label: 'Enterprise' },
};

export const AuthService = {
  signup: (username, password, plan = 'free') => {
    if (!username || username.length < 3) return { success: false, error: 'Username must be at least 3 characters' };
    if (!password || password.length < 4) return { success: false, error: 'Password must be at least 4 characters' };

    const users = getUsers();
    if (users[username.toLowerCase()]) return { success: false, error: 'Username already taken' };

    const planDefaults = PLAN_DEFAULTS[plan] || PLAN_DEFAULTS.free;
    const user = {
      username: username.toLowerCase(),
      password,
      plan,
      planActivatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      portfolio: {
        cash: planDefaults.cash,
        initialBalance: planDefaults.cash,
        holdings: {},
        transactions: [],
      },
      learningProgress: {},
      botStats: { totalTrades: 0, winningTrades: 0, losingTrades: 0, totalPnL: 0, sharpeRatio: 0 },
    };

    users[username.toLowerCase()] = user;
    saveUsers(users);

    const session = { username: user.username, plan: user.plan, loggedInAt: new Date().toISOString() };
    saveSession(session);
    return { success: true, user };
  },

  login: (username, password) => {
    const users = getUsers();
    const user = users[username.toLowerCase()];
    if (!user) return { success: false, error: 'User not found' };
    if (user.password !== password) return { success: false, error: 'Incorrect password' };

    const session = { username: user.username, plan: user.plan, loggedInAt: new Date().toISOString() };
    saveSession(session);
    return { success: true, user };
  },

  logout: () => {
    saveSession(null);
  },

  getSession,

  getCurrentUser: () => {
    const session = getSession();
    if (!session) return null;
    const users = getUsers();
    return users[session.username] || null;
  },

  updateUser: (username, updates) => {
    const users = getUsers();
    if (!users[username]) return;
    users[username] = { ...users[username], ...updates };
    saveUsers(users);
  },

  updatePortfolio: (username, portfolio) => {
    const users = getUsers();
    if (!users[username]) return;
    users[username].portfolio = portfolio;
    saveUsers(users);
  },

  updatePlan: (username, plan) => {
    const users = getUsers();
    if (!users[username]) return;
    const planDefaults = PLAN_DEFAULTS[plan] || PLAN_DEFAULTS.free;
    users[username].plan = plan;
    users[username].planActivatedAt = new Date().toISOString();
    // If upgrading, give them the new starting balance if they have less
    if (users[username].portfolio.cash < planDefaults.cash) {
      users[username].portfolio.cash = planDefaults.cash;
      users[username].portfolio.initialBalance = planDefaults.cash;
    }
    saveUsers(users);
    const session = getSession();
    if (session && session.username === username) {
      session.plan = plan;
      saveSession(session);
    }
  },

  updateLearningProgress: (username, courseId, progress) => {
    const users = getUsers();
    if (!users[username]) return;
    if (!users[username].learningProgress) users[username].learningProgress = {};
    users[username].learningProgress[courseId] = progress;
    saveUsers(users);
  },

  updateBotStats: (username, stats) => {
    const users = getUsers();
    if (!users[username]) return;
    users[username].botStats = stats;
    saveUsers(users);
  },

  refillBalance: (username) => {
    const users = getUsers();
    if (!users[username]) return;
    const plan = users[username].plan;
    const planDefaults = PLAN_DEFAULTS[plan] || PLAN_DEFAULTS.free;
    users[username].portfolio.cash = planDefaults.cash;
    users[username].portfolio.holdings = {};
    users[username].portfolio.transactions = [];
    users[username].portfolio.initialBalance = planDefaults.cash;
    saveUsers(users);
  },

  getPlanDefaults: () => PLAN_DEFAULTS,

  isLoggedIn: () => !!getSession(),
};
