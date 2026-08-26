import React from 'react';
import { Search } from 'lucide-react';
import { colors } from '../styles/themeStyles';

export default function TopHeader({ globalSearch, setGlobalSearch }) {
  return (
    <div style={{ backgroundColor: colors.headerBg, padding: '24px 30px' }}>
      <h2 style={{ margin: '0 0 16px 0', color: '#000000', fontSize: '22px', fontWeight: 'bold' }}>
        Admin Dashboard - Classroom Management
      </h2>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: '30px',
        padding: '8px 16px',
        gap: '10px',
        maxWidth: '550px',
      }}>
        <Search size={18} color={colors.accentBrown} />
        <input 
          type="text" 
          placeholder="Search across all resources..." 
          value={globalSearch}
          onChange={(e) => setGlobalSearch(e.target.value)}
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: '14px', color: colors.accentBrown }}
        />
      </div>
    </div>
  );
}