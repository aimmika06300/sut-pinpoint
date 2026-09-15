import React from 'react';
import { colors } from '../styles/themeStyles';

export default function UsersView({ users, loading, globalSearch, setSelectedUserProfile, handleDeleteUser }) {
  // กรองผู้ใช้จาก Search Bar ส่วนกลาง
  const filteredUsers = users.filter(u => {
    const name = u.name || u.username || u.fullName || u.displayName || `${u.first_name || ''} ${u.last_name || ''}` || '';
    const studentId = u.student_id || u.studentId || u.code || (u.id && String(u.id).startsWith('B') ? u.id : '') || '';
    const query = (globalSearch || '').toLowerCase();
    return name.toLowerCase().includes(query) || studentId.toLowerCase().includes(query);
  });

  return (
    <div style={{ backgroundColor: colors.white, borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}>
      <div style={{ backgroundColor: colors.cardHeaderBg, padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '20px', color: colors.accentBrown }}>Users Management</h3>
        <span style={{ fontSize: '13px', color: colors.subText }}>ทั้งหมด {filteredUsers.length} รายการ</span>
      </div>

      <div style={{ backgroundColor: colors.cardHeaderBg, display: 'flex', padding: '12px 10px', fontWeight: 'bold', color: colors.accentBrown }}>
        <div style={{ flex: 0.8, paddingLeft: '24px' }}>No.</div>
        <div style={{ flex: 2 }}>Users (Name)</div>
        <div style={{ flex: 1.5 }}>Student ID</div>
        <div style={{ flex: 2, textAlign: 'right', paddingRight: '24px' }}>Action</div>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: colors.subText }}>⏳ กำลังโหลดข้อมูลผู้ใช้งาน...</div>
      ) : filteredUsers.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: colors.subText }}>🚫 ไม่พบผู้ใช้งานที่ตรงตามคำค้นหา</div>
      ) : (
        filteredUsers.map((u, idx) => {
          // ดึงค่าตั้งต้นจากฟิลด์ต่างๆ
          const rawName = u.name || u.username || u.fullName || u.displayName || `${u.first_name || ''} ${u.last_name || ''}`.trim();
          let studentId = u.student_id || u.studentId || u.code || '';
          let name = rawName;

          // กรณีที่ฟิลด์ชื่อ (rawName) ดันเก็บรหัสนักศึกษามาแทน (เช่น ขึ้นต้นด้วย B หรือ b ตามด้วยตัวเลข)
          if (rawName && /^[bB]\d+$/.test(rawName)) {
            if (!studentId) studentId = rawName;
            // ลองหาชื่อจาก username หรือ email หรือกำหนดค่าสำรอง
            name = (u.username && u.username !== rawName ? u.username : null) || (u.email ? u.email.split('@')[0] : '-');
          }

          // กรณีที่ไม่มีรหัสนักศึกษาในฟิลด์ปกติ แต่ id ของระบบเป็นรหัสนักศึกษา
          if (!studentId && u.id && /^[bB]\d+$/.test(String(u.id))) {
            studentId = u.id;
          }

          return (
            <div key={u.id || idx} style={{ display: 'flex', alignItems: 'center', padding: '16px 10px', borderBottom: '1px solid #EFEFEF' }}>
              <div style={{ flex: 0.8, paddingLeft: '24px' }}>{idx + 1}</div>
              
              {/* คอลัมน์ Users (Name) */}
              <div style={{ flex: 2, fontWeight: 'bold', color: '#222' }}>
                {name || '-'}
              </div>

              {/* คอลัมน์ Student ID */}
              <div style={{ flex: 1.5, color: colors.subText, fontFamily: 'monospace' }}>
                {studentId || '-'}
              </div>

              <div style={{ flex: 2, textAlign: 'right', paddingRight: '24px' }}>
                <button 
                  onClick={() => setSelectedUserProfile(u)}
                  style={{ backgroundColor: colors.accentBrown, color: '#FFF', border: 'none', borderRadius: '6px', padding: '6px 14px', marginRight: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
                  VIEW PROFILE
                </button>
                <button 
                  onClick={() => handleDeleteUser(u.id)}
                  style={{ backgroundColor: colors.danger, color: '#FFF', border: 'none', borderRadius: '6px', padding: '6px 14px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
                  DELETE
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}