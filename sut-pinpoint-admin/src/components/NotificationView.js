import React from 'react';
import { colors } from '../styles/themeStyles';

export default function NotificationView({ notifications, setNotifications }) {
  return (
    <div style={{ backgroundColor: colors.white, borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}>
      <div style={{ backgroundColor: colors.cardHeaderBg, padding: '16px 24px' }}>
        <h3 style={{ margin: 0, fontSize: '20px' }}>Notifications & System Alerts</h3>
      </div>
      <div style={{ padding: '10px 20px' }}>
        {notifications.map((n, idx) => (
          <div key={n.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #EEE' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ fontWeight: 'bold', color: colors.accentBrown }}>{idx + 1}</span>
              <div>
                <div style={{ fontWeight: 'bold', color: '#222' }}>{n.title}</div>
                <div style={{ fontSize: '12px', color: colors.subText }}>{n.time}</div>
              </div>
            </div>
            <div>
              <button onClick={() => alert(n.title)} style={{ backgroundColor: colors.accentBrown, color: '#FFF', border: 'none', borderRadius: '6px', padding: '6px 14px', marginRight: '8px', cursor: 'pointer' }}>VIEW</button>
              <button onClick={() => setNotifications(notifications.filter(item => item.id !== n.id))} style={{ backgroundColor: colors.danger, color: '#FFF', border: 'none', borderRadius: '6px', padding: '6px 14px', cursor: 'pointer' }}>DELETE</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}