import React from 'react';
import { colors } from '../styles/themeStyles';

export default function UsersView({ users, setSelectedUserProfile, handleDeleteUser }) {
  return (
    <div style={{ backgroundColor: colors.white, borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}>
      <div style={{ backgroundColor: colors.cardHeaderBg, padding: '16px 24px' }}>
        <h3 style={{ margin: 0, fontSize: '20px' }}>Users Management</h3>
      </div>
      <div style={{ backgroundColor: colors.cardHeaderBg, display: 'flex', padding: '12px 10px', fontWeight: 'bold' }}>
        <div style={{ flex: 0.8, paddingLeft: '20px' }}>No.</div>
        <div style={{ flex: 2 }}>Users (Name)</div>
        <div style={{ flex: 1.5 }}>Student ID</div>
        <div style={{ flex: 2, textAlign: 'right', paddingRight: '20px' }}>Action</div>
      </div>
      {users.map((u, idx) => (
        <div key={u.id} style={{ display: 'flex', alignItems: 'center', padding: '16px 10px', borderBottom: '1px solid #EFEFEF' }}>
          <div style={{ flex: 0.8, paddingLeft: '20px' }}>{idx + 1}</div>
          <div style={{ flex: 2, fontWeight: 'bold' }}>{u.name || `${u.first_name || ''} ${u.last_name || ''}`}</div>
          <div style={{ flex: 1.5 }}>{u.student_id || `B${u.id}00000`}</div>
          <div style={{ flex: 2, textAlign: 'right', paddingRight: '20px' }}>
            <button 
              onClick={() => setSelectedUserProfile(u)}
              style={{ backgroundColor: colors.accentBrown, color: '#FFF', border: 'none', borderRadius: '6px', padding: '6px 14px', marginRight: '8px', cursor: 'pointer' }}>
              VIEW PROFILE
            </button>
            <button 
              onClick={() => handleDeleteUser(u.id)}
              style={{ backgroundColor: colors.danger, color: '#FFF', border: 'none', borderRadius: '6px', padding: '6px 14px', cursor: 'pointer' }}>
              DELETE
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}