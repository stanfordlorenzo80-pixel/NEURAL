import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, createContext, useContext } from 'react';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import CheckoutPage from './pages/CheckoutPage';
import DashboardPage from './pages/DashboardPage';
import MarketsPage from './pages/MarketsPage';
import BotPage from './pages/BotPage';
import LearnPage from './pages/LearnPage';
import SettingsPage from './pages/SettingsPage';
import { MarketDataService } from './services/marketData';
import { PortfolioService } from './services/portfolio';
import { AuthService } from './services/auth';
import './App.css';

// Auth Context
export const UserContext = createContext(null);

function ProtectedRoute({ children }) {
  const { user } = useContext(UserContext);
  if (!user) return <Navigate to="/auth" replace />;
  return children;
}

function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isPublic = location.pathname === '/' || location.pathname === '/auth';
  const [user, setUser] = useState(null);
  const [portfolioValue, setPortfolioValue] = useState(null);

  useEffect(() => {
    // Restore session
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    const stop = MarketDataService.startUpdates(2000);
    const unsub = MarketDataService.subscribe((prices) => {
      setPortfolioValue(PortfolioService.getPortfolioValue(prices));
    });
    setPortfolioValue(PortfolioService.getPortfolioValue(MarketDataService.getCurrentPrices()));
    return () => { stop(); unsub(); };
  }, [user]);

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    setPortfolioValue(PortfolioService.getPortfolioValue(MarketDataService.getCurrentPrices()));
  };

  const handleLogout = () => {
    AuthService.logout();
    setUser(null);
    setPortfolioValue(null);
    navigate('/');
  };

  const handlePlanChange = (newPlan) => {
    const updated = AuthService.getCurrentUser();
    setUser(updated);
    setPortfolioValue(PortfolioService.getPortfolioValue(MarketDataService.getCurrentPrices()));
  };

  const refreshUser = () => {
    const updated = AuthService.getCurrentUser();
    setUser(updated);
  };

  if (location.pathname === '/') {
    return <LandingPage />;
  }

  if (location.pathname === '/auth') {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <UserContext.Provider value={{ user, setUser, handleLogout, handlePlanChange, refreshUser }}>
      <div className="app-layout">
        <Sidebar user={user} onLogout={handleLogout} />
        <div className="main-area">
          <Header portfolioValue={portfolioValue} user={user} />
          <main className="main-content">
            <Routes>
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/markets" element={<ProtectedRoute><MarketsPage /></ProtectedRoute>} />
              <Route path="/bot" element={<ProtectedRoute><BotPage /></ProtectedRoute>} />
              <Route path="/learn" element={<ProtectedRoute><LearnPage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute><CheckoutPage user={user} onPlanChange={handlePlanChange} /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to={user ? '/dashboard' : '/auth'} replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </UserContext.Provider>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/*" element={<AppLayout />} />
      </Routes>
    </Router>
  );
}

export default App;
