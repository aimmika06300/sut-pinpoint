import React from 'react';
import { styles, colors } from '../styles/themeStyles';

export default function RoomDetailModal({ building, onClose }) {
  if (!building) return null;

  return (
    <div style={styles.modalOverlay}>
      <div style={{ ...styles.modalBox, width: '360px' }}>
        <h3 style={{ marginTop: 0, color: colors.accentBrown, fontSize: '18px' }}>
          📍 รายละเอียดอาคาร
        </h3>
        
        <div style={{ margin: '16px 0', fontSize: '15px', lineHeight: '1.8' }}>
          <p style={{ margin: '6px 0' }}>
            <b>อาคาร:</b> {building.name}
          </p>
          <p style={{ margin: '6px 0' }}>
            <b>จำนวนชั้น:</b> {building.floors} ชั้น
          </p>
          <p style={{ margin: '6px 0' }}>
            <b>ห้องว่างปัจจุบัน:</b>{' '}
            <span style={{ color: colors.success, fontWeight: 'bold' }}>
              {building.available} ห้อง
            </span>
          </p>
          <p style={{ margin: '6px 0' }}>
            <b>จำนวนห้องทั้งหมด:</b> {building.total} ห้อง
          </p>
        </div>
        
        <button 
          style={{ 
            width: '100%', 
            padding: '10px', 
            borderRadius: '8px', 
            border: 'none', 
            background: colors.accentBrown, 
            color: colors.white, 
            fontWeight: 'bold', 
            fontSize: '14px',
            cursor: 'pointer', 
            marginTop: '10px' 
          }}
          onClick={onClose}>
          ปิดหน้าต่าง
        </button>
      </div>
    </div>
  );
}