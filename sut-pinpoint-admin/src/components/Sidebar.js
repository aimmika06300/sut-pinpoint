import React from 'react';
import { LayoutDashboard, Map, Users, Bell, LogOut } from 'lucide-react';
import { colors } from '../styles/themeStyles';

export default function Sidebar({ activeMenu, setActiveMenu, setShowLogoutModal, unreadCount = 0 }) {
  const getItemStyle = (menuName) => ({
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    background: activeMenu === menuName ? 'rgba(255, 255, 255, 0.2)' : 'none',
    border: 'none',
    color: colors.white,
    fontWeight: activeMenu === menuName ? 'bold' : 'normal',
    fontSize: '15px',
    cursor: 'pointer',
    borderRadius: '8px',
    marginBottom: '5px',
  });

  return (
    <div style={sidebarStyles.container}>
      <div style={{ padding: '30px 20px 20px', textAlign: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '26px', fontWeight: '900', color: colors.white, letterSpacing: '1px' }}>
          PIN POINT
        </h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 25px 25px' }}>
        <div style={sidebarStyles.avatar}>👤</div>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '14px', color: colors.white }}>ADMIN NAME</div>
          <div style={{ fontSize: '12px', color: '#E0D0C5' }}>(System Admin)</div>
        </div>
      </div>

      <div style={{ flex: 1, padding: '10px 15px' }}>
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', fontWeight: 'bold', marginBottom: '10px', paddingLeft: '10px' }}>
          MAIN MENU
        </div>

        <button style={getItemStyle('Dashboard')} onClick={() => setActiveMenu('Dashboard')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </div>
        </button>

        <button style={getItemStyle('Map')} onClick={() => setActiveMenu('Map')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Map size={18} />
            <span>MapView</span>
          </div>
        </button>

        <button style={getItemStyle('Users')} onClick={() => setActiveMenu('Users')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Users size={18} />
            <span>Users</span>
          </div>
        </button>

        <button style={getItemStyle('Notification')} onClick={() => setActiveMenu('Notification')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Bell size={18} />
            <span>Notification</span>
          </div>
          {unreadCount > 0 && (
            <span style={sidebarStyles.badge}>{unreadCount}</span>
          )}
        </button>

        <button style={{ ...getItemStyle('Logout'), marginTop: '20px' }} onClick={() => setShowLogoutModal(true)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <LogOut size={18} />
            <span>Logout</span>
          </div>
        </button>
      </div>
    </div>
  );
}

const sidebarStyles = {
  container: {
  width: '240px',
  backgroundColor: colors.sidebarBg || '#3D312A',
  color: '#fff',
  padding: '24px 16px',
  display: 'flex',            // <--- แทรก
  flexDirection: 'column',     // <--- แทรก
  justifyContent: 'space-between', // <--- แทรก
  minHeight: '100vh',         // <--- แทรก
  boxSizing: 'border-box',
},
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: colors.white,
    color: colors.sidebarBg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
  },
  badge: {
    backgroundColor: colors.primary,
    color: colors.white,
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 'bold',
    padding: '2px 8px',
  }
};