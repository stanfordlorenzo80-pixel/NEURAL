import { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, Trash2, TrendingUp, TrendingDown, Bot, AlertTriangle, DollarSign } from 'lucide-react';
import './NotificationsPanel.css';

const STORAGE_KEY = 'neuraltrade_notifications';

function loadNotifications() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

function saveNotifications(notifs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifs.slice(0, 50)));
}

// Global function to add notifications from anywhere
let addNotificationFn = null;
export function pushNotification(notif) {
  if (addNotificationFn) addNotificationFn(notif);
}

const ICON_MAP = {
  trade: DollarSign,
  signal: Bot,
  price: TrendingUp,
  alert: AlertTriangle,
};

export default function NotificationsPanel() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(loadNotifications);
  const panelRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    addNotificationFn = (notif) => {
      const newNotif = { id: Date.now() + Math.random(), read: false, time: new Date().toISOString(), ...notif };
      setNotifications(prev => {
        const updated = [newNotif, ...prev].slice(0, 50);
        saveNotifications(updated);
        return updated;
      });
    };

    // Generate some initial notifications if empty
    if (notifications.length === 0) {
      const initial = [
        { id: 1, type: 'signal', title: 'BTC Buy Signal', message: 'Momentum strategy detected bullish RSI crossover on BTC', read: false, time: new Date(Date.now() - 300000).toISOString() },
        { id: 2, type: 'price', title: 'ETH Up 5.2%', message: 'Ethereum is up 5.2% in the last 24 hours', read: false, time: new Date(Date.now() - 600000).toISOString() },
        { id: 3, type: 'trade', title: 'Order Filled', message: 'Bought 0.5 BTC at $67,125.00', read: true, time: new Date(Date.now() - 3600000).toISOString() },
        { id: 4, type: 'alert', title: 'Welcome to NeuralTrade!', message: 'Start by exploring the Markets page or running the AI Bot.', read: true, time: new Date(Date.now() - 7200000).toISOString() },
      ];
      setNotifications(initial);
      saveNotifications(initial);
    }

    // Close on outside click
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => { document.removeEventListener('mousedown', handleClick); addNotificationFn = null; };
  }, []);

  const markAllRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      saveNotifications(updated);
      return updated;
    });
  };

  const clearAll = () => {
    setNotifications([]);
    saveNotifications([]);
  };

  const markRead = (id) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      saveNotifications(updated);
      return updated;
    });
  };

  const timeAgo = (iso) => {
    const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  };

  return (
    <div className="notif-wrapper" ref={panelRef}>
      <button className="header-icon-btn" onClick={() => setOpen(!open)}>
        <Bell size={18} />
        {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
      </button>

      {open && (
        <div className="notif-panel glass-card">
          <div className="notif-header">
            <h3>Notifications</h3>
            <div className="notif-actions">
              <button onClick={markAllRead} title="Mark all read"><Check size={14} /></button>
              <button onClick={clearAll} title="Clear all"><Trash2 size={14} /></button>
            </div>
          </div>

          <div className="notif-list">
            {notifications.length === 0 ? (
              <div className="notif-empty">No notifications</div>
            ) : (
              notifications.map(n => {
                const Icon = ICON_MAP[n.type] || Bell;
                return (
                  <div key={n.id} className={`notif-item ${n.read ? '' : 'unread'}`} onClick={() => markRead(n.id)}>
                    <div className={`notif-icon ${n.type}`}><Icon size={14} /></div>
                    <div className="notif-content">
                      <div className="notif-title">{n.title}</div>
                      <div className="notif-message">{n.message}</div>
                      <div className="notif-time">{timeAgo(n.time)}</div>
                    </div>
                    {!n.read && <div className="notif-dot"></div>}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
