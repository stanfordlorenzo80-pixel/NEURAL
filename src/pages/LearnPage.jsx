import { useState, useContext } from 'react';
import { UserContext } from '../App';
import { AuthService } from '../services/auth';
import { BookOpen, ChevronRight, CheckCircle, Clock, BarChart2, Shield, Brain, Search, ArrowLeft, Award } from 'lucide-react';
import './LearnPage.css';

const GLOSSARY = [
  { term: 'Ask Price', def: 'The lowest price a seller will accept for an asset.' },
  { term: 'Bear Market', def: 'A market where prices are falling, usually 20%+ from recent highs.' },
  { term: 'Bid Price', def: 'The highest price a buyer is willing to pay for an asset.' },
  { term: 'Bull Market', def: 'A market where prices are rising or expected to rise.' },
  { term: 'Candlestick', def: 'A chart element showing open, high, low, and close prices for a period.' },
  { term: 'Day Trading', def: 'Buying and selling assets within the same trading day.' },
  { term: 'Diversification', def: 'Spreading investments across different assets to reduce risk.' },
  { term: 'Drawdown', def: 'The peak-to-trough decline during a specific period of an investment.' },
  { term: 'EMA', def: 'Exponential Moving Average — a moving average that gives more weight to recent prices.' },
  { term: 'FOMO', def: 'Fear Of Missing Out — emotional buying when prices are rising rapidly.' },
  { term: 'Limit Order', def: 'An order to buy or sell at a specific price or better.' },
  { term: 'Liquidity', def: 'How easily an asset can be bought or sold without affecting its price.' },
  { term: 'Leverage', def: 'Using borrowed money to increase potential returns (and risk).' },
  { term: 'MACD', def: 'Moving Average Convergence Divergence — a trend-following momentum indicator.' },
  { term: 'Market Cap', def: 'Total value of all shares/coins: price × total supply.' },
  { term: 'Market Order', def: 'An order to buy or sell immediately at the current market price.' },
  { term: 'P&L', def: 'Profit and Loss — the net gain or loss from your trades.' },
  { term: 'Paper Trading', def: 'Simulated trading with fake money to practice without risk.' },
  { term: 'Portfolio', def: 'Your collection of investments across different assets.' },
  { term: 'Position Size', def: 'The dollar amount or number of shares you invest in a single trade.' },
  { term: 'Resistance', def: 'A price level where selling pressure tends to prevent further price increases.' },
  { term: 'RSI', def: 'Relative Strength Index — measures if an asset is overbought (>70) or oversold (<30).' },
  { term: 'Sharpe Ratio', def: 'Measures risk-adjusted return. Higher = better. Above 1 is good, above 2 is great.' },
  { term: 'Slippage', def: 'The difference between expected trade price and actual execution price.' },
  { term: 'SMA', def: 'Simple Moving Average — the average price over a set number of periods.' },
  { term: 'Spread', def: 'The difference between the bid and ask price of an asset.' },
  { term: 'Stop Loss', def: 'An order that automatically sells your position if the price drops to a set level.' },
  { term: 'Support', def: 'A price level where buying pressure tends to prevent further price decreases.' },
  { term: 'Take Profit', def: 'An order that automatically sells when price reaches your profit target.' },
  { term: 'Trailing Stop', def: 'A stop loss that automatically moves up as the price increases.' },
  { term: 'Volatility', def: 'How much and how quickly prices change. High volatility = bigger price swings.' },
  { term: 'Volume', def: 'The total number of shares or coins traded in a given period.' },
  { term: 'Whale', def: 'A trader or institution that holds a very large amount of an asset.' },
  { term: 'Win Rate', def: 'The percentage of your trades that are profitable.' },
];

const courses = [
  {
    id: 'intro', level: 'Beginner', title: 'What is Trading?', desc: 'Start from zero — understand money, markets, and how trading works.', icon: BookOpen, color: '#10b981', duration: '1 hour', lessons: 5,
    topics: [
      { title: 'Money & Markets 101', content: 'Trading is simply buying something at one price and selling it at another.\n\nImagine you buy a baseball card for $5. A month later, someone offers you $10 for it. You sell it and make $5 profit. That\'s trading!\n\nFinancial markets work the same way, but instead of baseball cards, people trade:\n• Stocks — tiny pieces of ownership in companies (like Apple, Tesla)\n• Crypto — digital currencies (like Bitcoin, Ethereum)\n• Forex — national currencies (like US Dollar vs Euro)\n• Commodities — raw materials (like Gold, Oil)\n\nWhy do prices change?\n• Supply & Demand: If more people want to buy Bitcoin than sell it, the price goes up\n• News: Good news about a company → stock goes up. Bad news → stock goes down\n• Earnings: If Apple makes more money than expected → stock price usually rises' },
      { title: 'How Do You Actually Trade?', content: 'Here\'s how a trade works step-by-step:\n\n1. You open a trading account (or use paper trading to practice!)\n2. You deposit money into your account\n3. You find an asset you want to buy (e.g., Bitcoin at $67,000)\n4. You decide how much to buy ($500 worth = 0.0075 BTC)\n5. You click Buy → the trade executes\n6. You now own Bitcoin! If the price goes up, you profit. If it goes down, you lose.\n7. When ready, you click Sell to close your position\n\nKey terms to know:\n• Position: Your investment in an asset\n• Entry Price: The price you bought at\n• Exit Price: The price you sold at\n• P&L: Profit & Loss = (Exit Price - Entry Price) × Quantity' },
      { title: 'Bulls, Bears & Market Cycles', content: 'Markets move in cycles. Understanding this is CRUCIAL.\n\n🟢 Bull Market (prices going UP)\n• Everyone is optimistic and buying\n• Prices keep rising\n• Lasts months to years\n• Example: Bitcoin went from $10K to $69K in 2020-2021\n\n🔴 Bear Market (prices going DOWN)\n• Fear and selling dominate\n• Prices drop 20%+ from highs\n• Can last months to years\n• Example: Crypto crashed 75% in 2022\n\n⚠️ The BIGGEST mistake beginners make:\n• Buying at the TOP of a bull market (FOMO)\n• Selling at the BOTTOM of a bear market (panic)\n\nPro tip: "Be greedy when others are fearful, and fearful when others are greedy" — Warren Buffett' },
      { title: 'Paper Trading: Your Risk-Free Playground', content: 'Before risking real money, ALWAYS practice with paper trading.\n\nPaper trading = trading with fake money in real market conditions.\n\nWhy paper trade first?\n• Zero risk — you can\'t lose real money\n• Learn the platform without pressure\n• Test strategies before going live\n• Build confidence and discipline\n\nOn NeuralTrade, you start with:\n• Free plan: $100,000 paper money\n• Pro plan: $500,000 paper money\n• Enterprise: $1,000,000 paper money\n\nYou can REFILL your balance anytime in Settings!\n\n🎯 EXERCISE: Go to the Markets page and practice buying $1,000 worth of Bitcoin. Watch what happens to your P&L.' },
      { title: 'The #1 Rule: Don\'t Lose Money', content: 'Warren Buffett\'s two rules of investing:\n1. Never lose money\n2. Never forget rule #1\n\nThis doesn\'t mean every trade will be profitable. It means PROTECT YOUR CAPITAL.\n\nHow?\n• Never risk more than 1-2% of your account on one trade\n• ALWAYS use a stop loss\n• Start small and scale up as you learn\n• Don\'t trade with money you can\'t afford to lose\n\nCommon beginner mistakes to avoid:\n❌ Going "all in" on one trade\n❌ Trading without a stop loss\n❌ Revenge trading after a loss\n❌ Following social media hype blindly\n❌ Over-trading (too many trades = too many fees)\n\n✅ What smart traders do:\n• Have a plan before entering every trade\n• Accept that losses are part of the game\n• Keep a trading journal\n• Learn from every trade (win or lose)' },
    ],
    quiz: [
      { q: 'What is a "bull market"?', options: ['Prices are falling', 'Prices are rising', 'Market is closed', 'Prices are flat'], correct: 1, explanation: 'A bull market means prices are rising.' },
      { q: 'What is paper trading?', options: ['Trading paper stocks', 'Trading with fake money to practice', 'A type of day trading', 'Trading on paper instead of online'], correct: 1, explanation: 'Paper trading lets you practice with simulated money — zero risk!' },
      { q: 'What % of your account should you risk per trade?', options: ['50%', '25%', '1-2%', '100%'], correct: 2, explanation: 'The 1-2% rule prevents a string of losses from destroying your account.' },
    ]
  },
  {
    id: 'orders', level: 'Beginner', title: 'Order Types & Execution', desc: 'Learn every order type and when to use each one.', icon: BarChart2, color: '#3b82f6', duration: '1.5 hours', lessons: 4,
    topics: [
      { title: 'Market Orders', content: 'A market order says: "Buy/sell RIGHT NOW at whatever the current price is."\n\n✅ Pros:\n• Executes instantly\n• Guaranteed to fill\n• Simple to use\n\n❌ Cons:\n• You might get a slightly different price than expected (slippage)\n• Bad for low-liquidity assets\n\nWhen to use: When you need to get in or out FAST and the exact price doesn\'t matter much.\n\nExample: Bitcoin is at $67,000. You place a market buy for $1,000. You\'ll get approximately 0.0149 BTC at or very near $67,000.' },
      { title: 'Limit Orders', content: 'A limit order says: "Only buy/sell at THIS price or better."\n\nBuy limit: "Buy BTC only if price drops to $65,000"\nSell limit: "Sell BTC only if price rises to $70,000"\n\n✅ Pros:\n• You control the exact price\n• No slippage\n• Great for setting entries at support levels\n\n❌ Cons:\n• May never fill if price doesn\'t reach your level\n• You might miss a move while waiting\n\nWhen to use: When you have a specific price target and aren\'t in a rush.' },
      { title: 'Stop Loss Orders', content: '🛑 THE MOST IMPORTANT ORDER TYPE FOR SURVIVAL\n\nA stop loss automatically sells your position if the price drops to a certain level.\n\nExample:\n• You buy BTC at $67,000\n• You set a stop loss at $65,000 (3% below)\n• If BTC drops to $65,000, it automatically sells\n• Your maximum loss = $2,000 per BTC\n\nWithout a stop loss:\n• BTC could drop to $50,000 and you\'d lose $17,000 per BTC\n• That\'s the difference between a small loss and a devastating one\n\n⚠️ RULE: NEVER enter a trade without a stop loss.\n\nPro tip: Set your stop loss BEFORE you enter the trade. Decide your risk first.' },
      { title: 'Take Profit & Trailing Stops', content: 'Take Profit: Automatically sells when price reaches your target.\n• You buy BTC at $67,000\n• Take profit at $72,000\n• When BTC hits $72,000, it sells automatically — profit locked in!\n\nTrailing Stop: A smart stop loss that moves WITH the price.\n• You buy BTC at $67,000 with a 5% trailing stop\n• BTC rises to $70,000 → your stop moves to $66,500\n• BTC rises to $75,000 → your stop moves to $71,250\n• BTC drops to $71,250 → sells! You kept most of the gains.\n\nWhy trailing stops are powerful:\n• They let winners run\n• They lock in profits automatically\n• You don\'t need to watch the screen 24/7' },
    ],
    quiz: [
      { q: 'Which order type guarantees the fastest execution?', options: ['Limit order', 'Stop loss', 'Market order', 'Trailing stop'], correct: 2, explanation: 'Market orders execute immediately at the current price.' },
      { q: 'What does a stop loss do?', options: ['Buys more when price drops', 'Automatically sells if price drops to a level', 'Stops all trading', 'Limits your daily trades'], correct: 1, explanation: 'A stop loss protects you by automatically selling if the price hits your loss threshold.' },
    ]
  },
  {
    id: 'technical', level: 'Intermediate', title: 'Technical Analysis', desc: 'Read charts like a pro — patterns, indicators, and signals.', icon: BarChart2, color: '#06b6d4', duration: '3 hours', lessons: 4,
    topics: [
      { title: 'Candlestick Charts', content: 'Each candlestick shows 4 prices: Open, High, Low, Close (OHLC)\n\n🟢 Green candle: Close > Open (price went UP)\n🔴 Red candle: Close < Open (price went DOWN)\n\nThe "body" = difference between open and close\nThe "wicks/shadows" = the high and low reached\n\nKey patterns every trader must know:\n\n• Doji: Open ≈ Close (tiny body). Means indecision — a reversal might be coming\n• Hammer: Small body at top, long lower wick. Bullish — buyers pushed price back up\n• Shooting Star: Small body at bottom, long upper wick. Bearish — sellers pushed price back down\n• Engulfing: A candle that completely covers the previous one. Strong reversal signal' },
      { title: 'Support & Resistance', content: 'These are invisible "floors" and "ceilings" where price tends to bounce.\n\nSupport (floor): A price level where buyers step in\n• Price drops to $65,000 three times but bounces each time\n• $65,000 is strong support\n\nResistance (ceiling): A price level where sellers appear\n• Price rises to $70,000 three times but gets rejected\n• $70,000 is strong resistance\n\nRules:\n• More touches = stronger level\n• When support breaks, it becomes resistance (and vice versa)\n• Breakouts above resistance WITH high volume = strong signal\n\n🎯 EXERCISE: Go to Markets, pick any asset chart, and try to identify support and resistance levels!' },
      { title: 'Moving Averages (SMA & EMA)', content: 'Moving averages smooth out price noise to show the TREND.\n\nSMA (Simple Moving Average): Average of last N closing prices\n• 50-day SMA = average of last 50 closing prices\n\nEMA (Exponential Moving Average): Same idea but weighs recent prices more heavily\n• Reacts faster to price changes than SMA\n\nThe two most important signals:\n\n🟢 Golden Cross: 50-day MA crosses ABOVE 200-day MA\n• Strong bullish signal — price likely going UP\n• Historically very reliable\n\n🔴 Death Cross: 50-day MA crosses BELOW 200-day MA\n• Bearish signal — price likely going DOWN\n\nSimple strategy:\n• Price ABOVE the 50 SMA → look for buys\n• Price BELOW the 50 SMA → avoid buying or look for sells' },
      { title: 'RSI & MACD', content: 'RSI (Relative Strength Index): Measures momentum on a scale of 0-100\n\n• RSI > 70 = Overbought (price may drop soon)\n• RSI < 30 = Oversold (price may rise soon)\n• RSI between 30-70 = Neutral\n\nSimple RSI strategy:\n• Buy when RSI drops below 30 then crosses back above\n• Sell when RSI rises above 70 then crosses back below\n\nMACD: Shows the relationship between two moving averages\n• Signal line crossover = buy/sell signal\n• Histogram shows momentum strength\n\n⚠️ No indicator is perfect!\n• Always use multiple indicators together\n• Combine with support/resistance levels\n• Use as confirmation, not the sole reason to trade' },
    ],
    quiz: [
      { q: 'What does a "Golden Cross" indicate?', options: ['Price hit all-time high', 'Short MA crosses above long MA (bullish)', 'Market is closing', 'Volume is increasing'], correct: 1, explanation: 'A Golden Cross is when the 50-day MA crosses above the 200-day MA — a strong bullish signal.' },
      { q: 'RSI above 70 means the asset is:', options: ['Oversold', 'Overbought', 'Fairly valued', 'About to split'], correct: 1, explanation: 'RSI > 70 suggests the asset may be overbought and due for a pullback.' },
    ]
  },
  {
    id: 'risk', level: 'Intermediate', title: 'Risk Management', desc: 'The #1 skill that separates winners from losers.', icon: Shield, color: '#f59e0b', duration: '2 hours', lessons: 3,
    topics: [
      { title: 'Position Sizing', content: 'Position sizing answers: "How much should I invest in this trade?"\n\nThe formula:\nPosition Size = (Account × Risk%) ÷ Stop Loss Distance\n\nExample:\n• Account: $100,000\n• Risk per trade: 1% = $1,000\n• Entry: BTC at $67,000\n• Stop loss: $65,000 (distance = $2,000 or ~3%)\n• Position: $1,000 ÷ ($2,000/$67,000) = ~$33,500 worth of BTC\n\nThis means if your stop loss hits, you only lose $1,000 (1% of your account).\n\nWhy this matters:\n• 10 losing trades in a row = only 10% loss\n• You survive to trade another day\n• Without sizing: one bad trade could wipe you out' },
      { title: 'Risk-Reward Ratio', content: 'Before every trade, calculate: "How much can I make vs how much can I lose?"\n\nRisk-Reward Ratio = Potential Profit ÷ Potential Loss\n\nExample:\n• Buy BTC at $67,000\n• Stop loss at $65,000 (risk = $2,000)\n• Take profit at $73,000 (reward = $6,000)\n• R:R = $6,000 ÷ $2,000 = 3:1\n\nThis means you make 3x what you risk!\n\nMinimum acceptable R:R: 2:1\n\nWhy? With a 2:1 ratio, you only need to win 34% of trades to be profitable!\n• Win 34 trades × $2,000 = $68,000\n• Lose 66 trades × $1,000 = $66,000\n• Net profit = $2,000 even with a 34% win rate!' },
      { title: 'Building a Trading Plan', content: 'Every successful trader has a written plan.\n\nYour trading plan should include:\n\n1. WHAT do I trade? (Stocks, crypto, or both?)\n2. WHEN do I trade? (Market hours, timeframes)\n3. HOW MUCH do I risk? (1-2% per trade)\n4. WHAT is my strategy? (What signals to look for)\n5. WHAT is my entry? (Specific conditions to buy)\n6. WHERE is my stop loss? (Always set before entering)\n7. WHERE is my take profit? (Minimum 2:1 R:R)\n8. HOW do I review? (Keep a trading journal)\n\nA trading journal should track:\n• Date and time of trade\n• Asset, entry price, exit price\n• Position size and P&L\n• Why you entered and exited\n• What you learned\n• Your emotional state during the trade' },
    ],
    quiz: [
      { q: 'With the 1% rule and a $100K account, max risk per trade is:', options: ['$10,000', '$1,000', '$100', '$500'], correct: 1, explanation: '1% of $100,000 = $1,000 maximum risk per trade.' },
      { q: 'What is a good minimum risk-reward ratio?', options: ['1:1', '1:2', '2:1', '0.5:1'], correct: 2, explanation: 'A 2:1 ratio means you make twice what you risk — you can be profitable even with a low win rate.' },
    ]
  },
  {
    id: 'ai', level: 'Advanced', title: 'AI Trading Strategies', desc: 'How AI and bots trade — and how to build your own.', icon: Brain, color: '#8b5cf6', duration: '2 hours', lessons: 3,
    topics: [
      { title: 'How AI Trading Bots Work', content: 'AI trading bots analyze data and execute trades automatically.\n\nWhat they do:\n1. Collect data (prices, volume, news, social media)\n2. Analyze patterns using algorithms\n3. Generate trade signals (buy/sell)\n4. Execute trades automatically\n5. Manage risk (stop losses, position sizing)\n\nTypes of bot strategies:\n\n• Momentum: Buys assets that are trending up strongly\n• Mean Reversion: Buys when price is "too low" (oversold)\n• Scalping: Makes many small, quick trades for tiny profits\n• Sentiment Analysis: Trades based on news/social media mood\n\nOn NeuralTrade, you can use all of these from the AI Bot page!' },
      { title: 'Building Custom AI Strategies', content: 'NeuralTrade\'s AI Strategy Builder lets you create strategies in plain English!\n\nExample prompts:\n\n1. "Buy Bitcoin when RSI drops below 30 and sell when it goes above 70"\n2. "Follow the momentum — buy when price breaks above the 20-day high"\n3. "Buy ETH when it drops 5% in a day, sell after a 3% bounce"\n\nThe AI will:\n✅ Parse your strategy into trading rules\n✅ Backtest it on historical data\n✅ Show you win rate, Sharpe ratio, and max drawdown\n✅ Let you deploy it with one click\n\nTips for good strategies:\n• Be specific about entry AND exit rules\n• Always include a stop loss\n• Start with simple rules before adding complexity\n• Test in paper trading before going live\n\n🎯 EXERCISE: Go to the AI Bot page and try creating a custom strategy!' },
      { title: 'Backtesting & Optimization', content: 'Backtesting = testing your strategy on HISTORICAL data.\n\nWhy backtest?\n• See how your strategy would have performed in the past\n• Identify weaknesses before risking real money\n• Optimize parameters for better results\n\nKey metrics to evaluate:\n• Win Rate: % of profitable trades (aim for >50%)\n• Sharpe Ratio: Risk-adjusted return (>1 is good, >2 is great)\n• Max Drawdown: Largest peak-to-trough loss (lower is better)\n• Total Return: Overall profit/loss\n\n⚠️ BEWARE OF OVERFITTING\nA strategy that works perfectly on past data may fail on live markets.\n\nSigns of overfitting:\n• Strategy has too many rules/conditions\n• Works only on one specific time period\n• Too-good-to-be-true results\n\nPrevention:\n• Keep strategies simple (fewer rules)\n• Test on different time periods\n• Always paper trade before going live' },
    ],
    quiz: [
      { q: 'What is backtesting?', options: ['Trading backwards', 'Testing strategy on historical data', 'Testing your internet speed', 'Reversing bad trades'], correct: 1, explanation: 'Backtesting runs your strategy on past market data to see how it would have performed.' },
      { q: 'What is a Sharpe Ratio above 2 considered?', options: ['Terrible', 'Average', 'Great', 'Illegal'], correct: 2, explanation: 'A Sharpe ratio above 2 means excellent risk-adjusted returns.' },
    ]
  },
];

export default function LearnPage() {
  const { user, refreshUser } = useContext(UserContext);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);
  const [glossarySearch, setGlossarySearch] = useState('');
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const progress = user?.learningProgress || {};

  const handleAnswer = (qi, ai) => { if (!quizSubmitted) setQuizAnswers(p => ({ ...p, [qi]: ai })); };

  const handleSubmitQuiz = () => {
    setQuizSubmitted(true);
    if (user && selectedCourse) {
      const course = courses.find(c => c.id === selectedCourse);
      const score = Object.entries(quizAnswers).filter(([i, a]) => course.quiz[+i]?.correct === a).length;
      const cp = progress[selectedCourse] || { completed: [], quizScore: null };
      cp.quizScore = score;
      AuthService.updateLearningProgress(user.username, selectedCourse, cp);
      refreshUser();
    }
  };

  const markTopicComplete = (courseId, topicIdx) => {
    if (!user) return;
    const cp = progress[courseId] || { completed: [], quizScore: null };
    if (!cp.completed.includes(topicIdx)) cp.completed.push(topicIdx);
    AuthService.updateLearningProgress(user.username, courseId, cp);
    refreshUser();
  };

  const resetQuiz = () => { setQuizAnswers({}); setQuizSubmitted(false); };

  // Glossary view
  if (showGlossary) {
    const filtered = GLOSSARY.filter(g =>
      g.term.toLowerCase().includes(glossarySearch.toLowerCase()) ||
      g.def.toLowerCase().includes(glossarySearch.toLowerCase())
    );
    return (
      <div className="learn-page">
        <button className="back-btn" onClick={() => setShowGlossary(false)}>← Back to Courses</button>
        <h2>📖 Trading Glossary</h2>
        <p className="learn-subtitle">Every term you need to know, explained simply.</p>
        <div className="glossary-search">
          <Search size={16} />
          <input placeholder="Search terms..." value={glossarySearch} onChange={e => setGlossarySearch(e.target.value)} />
        </div>
        <div className="glossary-grid">
          {filtered.map(g => (
            <div key={g.term} className="glossary-card glass-card">
              <h4>{g.term}</h4>
              <p>{g.def}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Lesson view
  if (selectedCourse) {
    const course = courses.find(c => c.id === selectedCourse);
    const topic = course.topics[selectedTopic];
    const cp = progress[course.id] || { completed: [], quizScore: null };
    const quizScore = quizSubmitted ? Object.entries(quizAnswers).filter(([i, a]) => course.quiz[+i]?.correct === a).length : 0;

    return (
      <div className="learn-page">
        <div className="lesson-view">
          <div className="lesson-sidebar glass-card">
            <button className="back-btn" onClick={() => { setSelectedCourse(null); setSelectedTopic(0); setShowQuiz(false); resetQuiz(); }}>← Back</button>
            <h3>{course.title}</h3>
            <div className="topic-list">
              {course.topics.map((t, i) => (
                <button key={i} className={`topic-item ${i === selectedTopic && !showQuiz ? 'active' : ''} ${cp.completed.includes(i) ? 'completed' : ''}`}
                  onClick={() => { setSelectedTopic(i); setShowQuiz(false); }}>
                  <span className="topic-num">{cp.completed.includes(i) ? '✓' : i + 1}</span>
                  <span>{t.title}</span>
                </button>
              ))}
              <button className={`topic-item quiz-item ${showQuiz ? 'active' : ''}`} onClick={() => setShowQuiz(true)}>
                <span className="topic-num">📝</span>
                <span>Quiz {cp.quizScore !== null ? `(${cp.quizScore}/${course.quiz.length})` : ''}</span>
              </button>
            </div>
            <div className="lesson-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${(cp.completed.length / course.topics.length) * 100}%` }}></div>
              </div>
              <span>{cp.completed.length}/{course.topics.length} complete</span>
            </div>
          </div>

          <div className="lesson-content glass-card">
            {!showQuiz ? (
              <>
                <div className="lesson-header">
                  <span className="lesson-badge" style={{ color: course.color, background: `${course.color}15` }}>{course.level}</span>
                  <h2>{topic.title}</h2>
                </div>
                <div className="lesson-body">
                  {topic.content.split('\n').map((line, i) => (
                    <p key={i} className={line.startsWith('•') || line.startsWith('❌') || line.startsWith('✅') || line.startsWith('✓') ? 'bullet-point' : ''}>{line}</p>
                  ))}
                </div>
                <div className="lesson-nav">
                  {selectedTopic > 0 && <button className="btn-secondary" onClick={() => { markTopicComplete(course.id, selectedTopic); setSelectedTopic(selectedTopic - 1); }}>← Previous</button>}
                  <div style={{ flex: 1 }}></div>
                  {selectedTopic < course.topics.length - 1 ? (
                    <button className="btn-primary" onClick={() => { markTopicComplete(course.id, selectedTopic); setSelectedTopic(selectedTopic + 1); }}>
                      Mark Complete & Next →
                    </button>
                  ) : (
                    <button className="btn-primary" onClick={() => { markTopicComplete(course.id, selectedTopic); setShowQuiz(true); }}>
                      Mark Complete & Take Quiz 📝
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="quiz-section">
                <h2>📝 {course.title} — Quiz</h2>
                <p className="quiz-desc">Test your knowledge from this course.</p>
                <div className="quiz-questions">
                  {course.quiz.map((q, qi) => (
                    <div key={qi} className="quiz-question">
                      <h4>{qi + 1}. {q.q}</h4>
                      <div className="quiz-options">
                        {q.options.map((opt, oi) => {
                          let cls = 'quiz-option';
                          if (quizAnswers[qi] === oi) cls += ' selected';
                          if (quizSubmitted) { if (oi === q.correct) cls += ' correct'; else if (quizAnswers[qi] === oi) cls += ' wrong'; }
                          return <button key={oi} className={cls} onClick={() => handleAnswer(qi, oi)}>{opt}{quizSubmitted && oi === q.correct && <CheckCircle size={14} />}</button>;
                        })}
                      </div>
                      {quizSubmitted && <p className="quiz-explanation">💡 {q.explanation}</p>}
                    </div>
                  ))}
                </div>
                {!quizSubmitted ? (
                  <button className="btn-primary" onClick={handleSubmitQuiz} disabled={Object.keys(quizAnswers).length < course.quiz.length}>Submit Answers</button>
                ) : (
                  <div className="quiz-result">
                    <h3>{quizScore}/{course.quiz.length} ({((quizScore / course.quiz.length) * 100).toFixed(0)}%)</h3>
                    <p>{quizScore === course.quiz.length ? '🎉 Perfect!' : quizScore >= course.quiz.length * 0.7 ? '👍 Great job!' : '📚 Review the lessons and try again!'}</p>
                    <button className="btn-secondary" onClick={resetQuiz}>Retake</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Course listing
  return (
    <div className="learn-page">
      <div className="learn-header">
        <div>
          <h2>Learning Center</h2>
          <p>From zero to profitable — interactive lessons that make trading simple.</p>
        </div>
        <button className="btn-secondary glossary-btn" onClick={() => setShowGlossary(true)}>
          📖 Glossary ({GLOSSARY.length} terms)
        </button>
      </div>

      {['Beginner', 'Intermediate', 'Advanced'].map(level => {
        const lc = courses.filter(c => c.level === level);
        if (!lc.length) return null;
        return (
          <div key={level} className="level-section">
            <h3 className="level-title">{level === 'Beginner' ? '🟢' : level === 'Intermediate' ? '🟡' : '🔴'} {level}</h3>
            <div className="courses-grid">
              {lc.map(course => {
                const cp = progress[course.id] || { completed: [], quizScore: null };
                const pct = Math.round((cp.completed.length / course.topics.length) * 100);
                return (
                  <div key={course.id} className="course-card glass-card" onClick={() => { setSelectedCourse(course.id); resetQuiz(); }}>
                    <div className="course-icon" style={{ color: course.color, background: `${course.color}15` }}><course.icon size={28} /></div>
                    <div className="course-info">
                      <h4>{course.title}</h4>
                      <p>{course.desc}</p>
                      <div className="course-meta">
                        <span><Clock size={12} /> {course.duration}</span>
                        <span><BookOpen size={12} /> {course.lessons} lessons</span>
                        {pct > 0 && <span className="course-progress-badge">{pct}% done</span>}
                        {cp.quizScore !== null && <span className="course-quiz-badge"><Award size={12} /> {cp.quizScore}/{course.quiz.length}</span>}
                      </div>
                    </div>
                    <ChevronRight size={18} className="course-arrow" />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
