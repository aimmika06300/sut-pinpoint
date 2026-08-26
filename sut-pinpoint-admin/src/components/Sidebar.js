import React from 'react';
import { LayoutDashboard, Map, Users, Bell, LogOut } from 'lucide-react';
import { colors } from '../styles/themeStyles';

export default function Sidebar({ activeMenu, setActiveMenu, setShowLogoutModal }) {
  const getItemStyle = (menuName) => ({
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    background: activeMenu === menuName ? 'rgba(255, 255, 255, 0.2)' : 'none',
    border: 'none',
    color: colors.white,
    fontWeight: activeMenu === menuName ? 'bold' : 'normal',
    fontSize: '15px',
    cursor: 'pointer',
    borderRadius: '8px',
    marginBottom: '5px',
    textAlign: 'left',
  });

  return (
    <div style={sidebarStyles.container}>
      <div style={{ padding: '30px 20px 20px', textAlign: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '900', color: colors.white }}>PIN POINT</h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 25px 25px' }}>
        <div style={sidebarStyles.avatar}>👤</div>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '14px', color: colors.white }}>ADMIN NAME</div>
          <div style={{ fontSize: '12px', color: '#E0D0C5' }}>(Admin)</div>
        </div>
      </div>

      <div style={{ flex: 1, padding: '10px 15px' }}>
        <div style={{ fontSize: '13px', color: colors.white, fontWeight: 'bold', marginBottom: '10px', paddingLeft: '10px' }}>Menu</div>
        
        <button style={getItemStyle('Dashboard')} onClick={() => setActiveMenu('Dashboard')}>
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </button>

        <button style={getItemStyle('Map')} onClick={() => setActiveMenu('Map')}>
          <Map size={18} />
          <span>MapView</span>
        </button>

        <button style={getItemStyle('Users')} onClick={() => setActiveMenu('Users')}>
          <Users size={18} />
          <span>Users</span>
        </button>

        <button style={getItemStyle('Notification')} onClick={() => setActiveMenu('Notification')}>
          <Bell size={18} />
          <span>Notification</span>
        </button>

        <button style={{ ...getItemStyle('Logout'), marginTop: '20px' }} onClick={() => setShowLogoutModal(true)}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

const sidebarStyles = {
  container: {
    width: '240px',
    backgroundColor: colors.sidebarBg,
    color: colors.white,
    display: 'flex',
    flexDirection: 'column',
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
  }
};