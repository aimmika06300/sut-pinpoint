import React from 'react';
import { Check, Trash2 } from 'lucide-react';
import { colors } from '../styles/themeStyles';

export default function NotificationView({ notifications, setNotifications, markAsRead }) {
  return (
    <div style={{ backgroundColor: colors.white, borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}>
      <div style={{ backgroundColor: colors.cardHeaderBg, padding: '16px 24px' }}>
        <h3 style={{ margin: 0, fontSize: '20px', color: colors.accentBrown }}>Notifications & System Alerts</h3>
      </div>
      <div style={{ padding: '10px 24px' }}>
        {notifications.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: colors.subText }}>🎉 ไม่มีข้อความแจ้งเตือนใหม่</div>
        ) : (
          notifications.map((n, idx) => (
            <div 
              key={n.id} 
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '16px 0', 
                borderBottom: '1px solid #EEE',
                opacity: n.isRead ? 0.65 : 1,
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ fontWeight: 'bold', color: colors.accentBrown }}>{idx + 1}</span>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#222', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {n.title}
                    {!n.isRead && <span style={notifStyles.unreadDot} />}
                  </div>
                  <div style={{ fontSize: '12px', color: colors.subText, marginTop: '2px' }}>{n.time}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {!n.isRead && (
                  <button 
                    onClick={() => markAsRead(n.id)} 
                    style={notifStyles.btnRead}>
                    <Check size={14} /> อ่านแล้ว
                  </button>
                )}
                <button 
                  onClick={() => setNotifications(notifications.filter(item => item.id !== n.id))} 
                  style={notifStyles.btnDelete}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const notifStyles = {
  unreadDot: { width: '8px', height: '8px', backgroundColor: colors.primary, borderRadius: '50%', display: 'inline-block' },
  btnRead: { backgroundColor: colors.accentBrown, color: '#FFF', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' },
  btnDelete: { backgroundColor: colors.danger, color: '#FFF', border: 'none', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center' },
};