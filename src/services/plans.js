// Plans & Subscription Service

export const PLANS = {
  free: {
    id: 'free',
    name: 'Starter',
    price: 0,
    priceLabel: 'Free',
    color: '#64748b',
    startingBalance: 100000,
    features: {
      paperTrading: true,
      liveTrading: false,
      maxBotStrategies: 2,
      aiStrategyBuilder: false,
      advancedCourses: false,
      realtimeData: false,
      customBots: 0,
      apiAccess: false,
      prioritySignals: false,
      maxWatchlist: 6,
    },
    featureList: [
      'Paper trading with $100K',
      '2 pre-built bot strategies',
      'Basic learning courses',
      'Simulated market data',
      '6 watchlist slots',
    ],
    limitations: [
      'No AI Strategy Builder',
      'No advanced courses',
      'No priority signals',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 29,
    priceLabel: '$29/mo',
    color: '#3b82f6',
    badge: 'Most Popular',
    startingBalance: 500000,
    features: {
      paperTrading: true,
      liveTrading: true,
      maxBotStrategies: 10,
      aiStrategyBuilder: true,
      advancedCourses: true,
      realtimeData: true,
      customBots: 5,
      apiAccess: false,
      prioritySignals: true,
      maxWatchlist: 20,
    },
    featureList: [
      'Paper trading with $500K',
      'All 4 pre-built strategies',
      'AI Strategy Builder (up to 5 custom)',
      'All learning courses + quizzes',
      'Priority trade signals',
      '20 watchlist slots',
      'Advanced analytics',
    ],
    limitations: [
      'No API access',
    ],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    priceLabel: '$99/mo',
    color: '#8b5cf6',
    startingBalance: 1000000,
    features: {
      paperTrading: true,
      liveTrading: true,
      maxBotStrategies: 999,
      aiStrategyBuilder: true,
      advancedCourses: true,
      realtimeData: true,
      customBots: 999,
      apiAccess: true,
      prioritySignals: true,
      maxWatchlist: 999,
    },
    featureList: [
      'Paper trading with $1,000,000',
      'Unlimited bot strategies',
      'Unlimited custom AI bots',
      'All learning + exclusive content',
      'Priority signals + early access',
      'Unlimited watchlist',
      'API access',
      'Priority support',
    ],
    limitations: [],
  },
};

export const PlansService = {
  getPlan: (planId) => PLANS[planId] || PLANS.free,
  getAllPlans: () => PLANS,

  canUseFeature: (planId, feature) => {
    const plan = PLANS[planId] || PLANS.free;
    return !!plan.features[feature];
  },

  getMaxStrategies: (planId) => {
    const plan = PLANS[planId] || PLANS.free;
    return plan.features.maxBotStrategies;
  },

  canCreateCustomBot: (planId, currentCount) => {
    const plan = PLANS[planId] || PLANS.free;
    return plan.features.aiStrategyBuilder && currentCount < plan.features.customBots;
  },
};
