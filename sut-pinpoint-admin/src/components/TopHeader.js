import React from 'react';
import { colors } from '../styles/themeStyles';

export default function TopHeader() {
  return (
    <div style={headerStyles.headerContainer}>
      <h2 style={{ margin: 0, fontSize: '22px', color: colors.accentBrown || '#5A3825' }}>
        Admin Dashboard - Classroom Management
      </h2>
    </div>
  );
}

const headerStyles = {
  headerContainer: {
    backgroundColor: colors.cardHeaderBg || '#FAF6F0',
    padding: '20px 30px',
    display: 'flex',
    alignItems: 'center',
    borderBottom: '1px solid rgba(0,0,0,0.05)',
  }
};