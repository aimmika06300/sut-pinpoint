import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { styles } from './styles/themeStyles';
import { API_BASE_URL, normalizeBuilding, normalizeClassroom } from './config';

// Components
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import MapView from './components/MapView';
import DashboardView from './components/DashboardView';
import UsersView from './components/UsersView';
import NotificationView from './components/NotificationView';
import Login from './Login';
import Toast from './components/Toast';

// Modals
import AddBuildingModal from './modals/AddBuildingModal';
import RoomDetailModal from './modals/RoomDetailModal';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('admin_logged_in') === 'true');
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [activeSubTab, setActiveSubTab] = useState('Buildings Overview');
  const [globalSearch, setGlobalSearch] = useState('');
  
  // States Data & Loading
  const [buildings, setBuildings] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Toast State
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    setToasts((prev) => {
      if (prev.some((t) => t.message === message)) {
        return prev;
      }
      const id = Date.now();
      setTimeout(() => removeToast(id), 4000);
      return [...prev, { id, message, type }];
    });
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Notification State
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Admin Alerts: ตารางเรียนภาคการศึกษา 1/2569 อัปเดตแล้ว', time: '10 m ago', isRead: false },
    { id: 2, title: 'มีอาคารใหม่ถูกเพิ่มในระบบพิกัด', time: '1 hr ago', isRead: false },
  ]);

  const markAsRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  // เพิ่มฟังก์ชันลบ Notification (เติมจากโค้ด 1)
  const handleDeleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    addToast('ลบการแจ้งเตือนเรียบร้อยแล้ว', 'info');
  };

  // Modals & Selection States
  const [showAddBuildingModal, setShowAddBuildingModal] = useState(false);
  const [showAddRoomModal, setShowAddRoomModal] = useState(false); // เปิดใช้งาน
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [selectedUserProfile, setSelectedUserProfile] = useState(null); // เติมจากโค้ด 1
  const [buildingToDelete, setBuildingToDelete] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);

  // Filter & Form States
  const [buildingFilter, setBuildingFilter] = useState('');
  const [filterBuildingSelect, setFilterBuildingSelect] = useState('All');
  const [filterFloorSelect, setFilterFloorSelect] = useState('All');
  const [filterTypeSelect, setFilterTypeSelect] = useState('All');
  const [newBuilding, setNewBuilding] = useState({ name: '', floors: '', total_rooms: '' });

  // Form State สำหรับเพิ่มห้องเรียนใหม่ (เติมจากโค้ด 1)
  const [newRoom, setNewRoom] = useState({ 
    id: '', 
    building_id: '', 
    building_name: '', 
    floor: '', 
    type: 'Lecture', 
    name: '', 
    status: 'Open' 
  });

  useEffect(() => {
    if (isLoggedIn) {
      fetchAllData();

      // เติมจากโค้ด 1: ดึงข้อมูล Users อัตโนมัติทุก 2 วินาทีเพื่อให้ซิงก์เรียลไทม์
      const interval = setInterval(() => {
        if (activeMenu === 'Users') {
          fetchUsers();
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isLoggedIn, activeMenu]);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([fetchBuildings(), fetchRooms(), fetchUsers()]);
    setLoading(false);
  };

  const fetchBuildings = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/buildings`);
      const rawData = Array.isArray(res.data) ? res.data : [];
      const normalized = rawData.map(normalizeBuilding);
      setBuildings(normalized);

      // เติมจากโค้ด 1: ตั้งค่า building_id เริ่มต้นให้ฟอร์มเพิ่มห้องเรียน
      if (normalized.length > 0 && !newRoom.building_id) {
        setNewRoom(prev => ({ 
          ...prev, 
          building_id: normalized[0].id, 
          building_name: normalized[0].name 
        }));
      }
    } catch (err) { 
      setBuildings([]);
      addToast('ไม่สามารถดึงข้อมูลอาคารได้', 'error');
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/rooms`);
      const rawData = Array.isArray(res.data) ? res.data : [];
      setClassrooms(rawData.map(normalizeClassroom));
    } catch (err) { 
      setClassrooms([]);
      addToast('ไม่สามารถดึงข้อมูลห้องเรียนได้', 'error');
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/users`);
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setUsers([]);
      addToast('ไม่สามารถดึงข้อมูลผู้ใช้ได้', 'error');
    }
  };

  const handleAddBuildingSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/buildings`, newBuilding);
      setShowAddBuildingModal(false);
      setNewBuilding({ name: '', floors: '', total_rooms: '' });
      addToast('เพิ่มอาคารใหม่เรียบร้อยแล้ว', 'success');
      fetchBuildings();
    } catch (err) { 
      addToast('เพิ่มอาคารไม่สำเร็จ', 'error'); 
    }
  };

  // เติมจากโค้ด 1: ฟังก์ชันสำหรับเพิ่มห้องเรียนใหม่
  const handleAddRoomSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/rooms`, newRoom);
      setShowAddRoomModal(false);
      setNewRoom({ 
        id: '', 
        building_id: buildings[0]?.id || '', 
        building_name: buildings[0]?.name || '', 
        floor: '', 
        type: 'Lecture', 
        name: '', 
        status: 'Open' 
      });
      addToast('เพิ่มห้องเรียนเรียบร้อยแล้ว', 'success');
      fetchRooms();
    } catch (err) {
      addToast('เพิ่มห้องเรียนไม่สำเร็จ: ' + (err.response?.data?.error || err.message), 'error');
    }
  };

  const handleUpdateBuilding = async (updatedBuilding) => {
    try {
      await axios.put(`${API_BASE_URL}/buildings/${updatedBuilding.id}`, updatedBuilding);
      addToast('อัปเดตอาคารสำเร็จ', 'success');
      fetchBuildings();
    } catch (err) {
      addToast('ไม่สามารถบันทึกข้อมูลอาคารได้', 'error');
    }
  };

  const handleOpenEditRoom = (room) => {
    setEditingRoom({ ...room });
  };

  const handleUpdateRoom = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE_URL}/rooms/${editingRoom.id}`, editingRoom);
      setEditingRoom(null);
      addToast('บันทึกข้อมูลห้องสำเร็จ', 'success');
      fetchRooms();
    } catch (err) {
      addToast('ไม่สามารถบันทึกข้อมูลห้องได้', 'error');
    }
  };

  const handleDeleteRoom = async (roomId) => {
    try {
      await axios.delete(`${API_BASE_URL}/rooms/${roomId}`);
      addToast(`ลบห้อง ${roomId} สำเร็จ`, 'success');
      fetchRooms();
    } catch (err) {
      addToast('ลบห้องไม่สำเร็จ', 'error');
    }
  };

  const handleDeleteUser = async (user) => {
    const idToDelete = user.studentId || user.id;
    try {
      await axios.delete(`${API_BASE_URL}/users/${idToDelete}`);
      setUsers(prev => prev.filter(u => (u.id !== idToDelete && u.studentId !== idToDelete)));
      addToast('ลบผู้ใช้สำเร็จ', 'success');
    } catch (err) {
      addToast('ลบผู้ใช้ไม่สำเร็จ: ' + (err.response?.data?.error || err.message), 'error');
    }
  };

  if (!isLoggedIn) {
    return (
      <Login 
        onLoginSuccess={() => { 
          setIsLoggedIn(true); 
          localStorage.setItem('admin_logged_in', 'true'); 
        }} 
      />
    );
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div style={styles.appContainer}>
      <Toast toasts={toasts} removeToast={removeToast} />

      <Sidebar 
        activeMenu={activeMenu} 
        setActiveMenu={setActiveMenu} 
        setShowLogoutModal={setShowLogoutModal} 
        unreadCount={unreadCount}
      />
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <TopHeader globalSearch={globalSearch} setGlobalSearch={setGlobalSearch} />
        
        <div style={{ padding: '20px 30px 40px', flex: 1 }}>
          {activeMenu === 'Dashboard' && (
            <DashboardView 
              activeSubTab={activeSubTab} setActiveSubTab={setActiveSubTab}
              buildings={buildings} classrooms={classrooms} loading={loading}
              buildingFilter={buildingFilter} setBuildingFilter={setBuildingFilter}
              filterBuildingSelect={filterBuildingSelect} setFilterBuildingSelect={setFilterBuildingSelect}
              filterFloorSelect={filterFloorSelect} setFilterFloorSelect={setFilterFloorSelect}
              filterTypeSelect={filterTypeSelect} setFilterTypeSelect={setFilterTypeSelect}
              setShowAddBuildingModal={setShowAddBuildingModal} setShowAddRoomModal={setShowAddRoomModal}
              setBuildingToDelete={setBuildingToDelete} globalSearch={globalSearch}
              onUpdateBuilding={handleUpdateBuilding}
              handleOpenEditRoom={handleOpenEditRoom}
              handleDeleteRoom={handleDeleteRoom}
            />
          )}

          {(activeMenu === 'MapView' || activeMenu === 'Map') && (
            <MapView onSelectBuilding={setSelectedBuilding} addToast={addToast} />
          )}

          {activeMenu === 'Users' && (
            <UsersView 
              users={users} 
              loading={loading}
              globalSearch={globalSearch}
              setSelectedUserProfile={setSelectedUserProfile} 
              handleDeleteUser={handleDeleteUser} 
            />
          )}

          {activeMenu === 'Notification' && (
            <NotificationView 
              notifications={notifications} 
              setNotifications={setNotifications} 
              markAsRead={markAsRead}
              handleDeleteNotification={handleDeleteNotification}
            />
          )}
        </div>
      </div>

      {/* Modal Edit Room */}
      {editingRoom && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.content}>
            <h3 style={{ marginTop: 0, color: '#5A3825' }}>✏️ แก้ไขข้อมูลห้องเรียน</h3>
            <form onSubmit={handleUpdateRoom} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={modalStyles.label}>รหัสห้อง / ชื่อห้อง:</label>
                <input type="text" value={editingRoom.id || ''} disabled style={modalStyles.disabledInput} />
              </div>
              <div>
                <label style={modalStyles.label}>อาคาร:</label>
                <select 
                  value={editingRoom.building_name || ''} 
                  onChange={(e) => setEditingRoom({ ...editingRoom, building_name: e.target.value })}
                  style={modalStyles.input}
                >
                  {buildings.map((b) => (
                    <option key={b.id} value={b.name}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={modalStyles.label}>ชั้น:</label>
                <input 
                  type="number" 
                  value={editingRoom.floor || '1'} 
                  onChange={(e) => setEditingRoom({ ...editingRoom, floor: e.target.value })}
                  style={modalStyles.input}
                  required
                />
              </div>
              <div>
                <label style={modalStyles.label}>สถานะ:</label>
                <select 
                  value={editingRoom.status || 'Open'} 
                  onChange={(e) => setEditingRoom({ ...editingRoom, status: e.target.value })}
                  style={modalStyles.input}
                >
                  <option value="Open">Open</option>
                  <option value="Close">Close</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" style={modalStyles.btnConfirm}>บันทึก</button>
                <button type="button" onClick={() => setEditingRoom(null)} style={modalStyles.btnCancel}>ยกเลิก</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* เติมจากโค้ด 1: Modal Add New Room */}
      {showAddRoomModal && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.content}>
            <h3 style={{ marginTop: 0, color: '#5A3825' }}>➕ เพิ่มห้องเรียนใหม่</h3>
            <form onSubmit={handleAddRoomSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={modalStyles.label}>Room ID (เช่น B6107-A):</label>
                <input 
                  type="text" 
                  required 
                  style={modalStyles.input} 
                  value={newRoom.id} 
                  onChange={(e) => setNewRoom({...newRoom, id: e.target.value})} 
                />
              </div>
              <div>
                <label style={modalStyles.label}>อาคาร:</label>
                <select 
                  style={modalStyles.input} 
                  value={newRoom.building_id} 
                  onChange={(e) => {
                    const b = buildings.find(item => String(item.id) === String(e.target.value));
                    setNewRoom({...newRoom, building_id: e.target.value, building_name: b ? b.name : ''});
                  }}>
                  {buildings.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={modalStyles.label}>ชั้น:</label>
                <input 
                  type="number" 
                  required 
                  style={modalStyles.input} 
                  value={newRoom.floor} 
                  onChange={(e) => setNewRoom({...newRoom, floor: e.target.value})} 
                />
              </div>
              <div>
                <label style={modalStyles.label}>ประเภทห้อง:</label>
                <select 
                  style={modalStyles.input} 
                  value={newRoom.type} 
                  onChange={(e) => setNewRoom({...newRoom, type: e.target.value})}>
                  <option value="Lecture">Lecture</option>
                  <option value="Lab">Lab</option>
                </select>
              </div>
              <div>
                <label style={modalStyles.label}>สถานะ:</label>
                <select 
                  style={modalStyles.input} 
                  value={newRoom.status} 
                  onChange={(e) => setNewRoom({...newRoom, status: e.target.value})}>
                  <option value="Open">Open</option>
                  <option value="Close">Close</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" style={modalStyles.btnConfirm}>บันทึก</button>
                <button type="button" onClick={() => setShowAddRoomModal(false)} style={modalStyles.btnCancel}>ยกเลิก</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* เติมจากโค้ด 1: Modal View User Profile */}
      {selectedUserProfile && (() => {
        const currentData = users.find(u => (u.studentId || u.id) === (selectedUserProfile.studentId || selectedUserProfile.id)) || selectedUserProfile;
        return (
          <div style={modalStyles.overlay}>
            <div style={modalStyles.content}>
              <h3 style={{ marginTop: 0, color: '#5A3825' }}>👤 Student Profile</h3>
              <p style={{ margin: '8px 0' }}><b>Name:</b> {currentData.name || currentData.studentId}</p>
              <p style={{ margin: '8px 0' }}><b>Student ID:</b> {currentData.studentId || currentData.id}</p>
              <p style={{ margin: '8px 0' }}><b>Email:</b> {currentData.email || '-'}</p>
              <p style={{ margin: '8px 0' }}><b>Institute:</b> {currentData.institute || currentData.faculty || '-'}</p>
              <p style={{ margin: '8px 0' }}><b>Club:</b> {currentData.club || '-'}</p>
              <button 
                onClick={() => setSelectedUserProfile(null)} 
                style={{ ...modalStyles.btnConfirm, width: '100%', marginTop: '15px' }}
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        );
      })()}

      {/* Modals Add / Delete */}
      {showAddBuildingModal && (
        <AddBuildingModal 
          newBuilding={newBuilding} 
          setNewBuilding={setNewBuilding} 
          setShowAddBuildingModal={setShowAddBuildingModal} 
          handleAddBuildingSubmit={handleAddBuildingSubmit} 
        />
      )}

      {selectedBuilding && (
        <RoomDetailModal building={selectedBuilding} onClose={() => setSelectedBuilding(null)} />
      )}

      {buildingToDelete && (
        <div style={modalStyles.overlay}>
          <div style={{ ...modalStyles.content, textAlign: 'center' }}>
            <h4 style={{ marginTop: 0 }}>⚠️ ยืนยันการลบอาคาร</h4>
            <p>คุณต้องการลบ <b>{buildingToDelete.name}</b> ใช่หรือไม่?</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button 
                onClick={async () => {
                  try {
                    await axios.delete(`${API_BASE_URL}/buildings/${buildingToDelete.id}`);
                    setBuildingToDelete(null);
                    addToast('ลบอาคารสำเร็จ', 'success');
                    fetchBuildings();
                  } catch (err) { 
                    addToast('ลบไม่สำเร็จ', 'error'); 
                  }
                }}
                style={{ ...modalStyles.btnConfirm, backgroundColor: '#d32f2f' }}
              >
                ยืนยันลบ
              </button>
              <button onClick={() => setBuildingToDelete(null)} style={modalStyles.btnCancel}>
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

      {showLogoutModal && (
        <div style={modalStyles.overlay}>
          <div style={{ ...modalStyles.content, textAlign: 'center' }}>
            <h4 style={{ marginTop: 0 }}>🚪 ยืนยันออกจากระบบ</h4>
            <p>คุณต้องการออกจากระบบหรือไม่?</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button 
                onClick={() => {
                  localStorage.removeItem('admin_logged_in');
                  setIsLoggedIn(false);
                  setShowLogoutModal(false);
                }}
                style={{ ...modalStyles.btnConfirm, backgroundColor: '#d32f2f' }}
              >
                ออกจากระบบ
              </button>
              <button onClick={() => setShowLogoutModal(false)} style={modalStyles.btnCancel}>
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const modalStyles = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  content: { backgroundColor: '#fff', padding: '24px', borderRadius: '12px', width: '340px' },
  label: { fontSize: '13px', fontWeight: 'bold', color: '#5A3825', marginBottom: '4px', display: 'block' },
  input: { width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '14px' },
  disabledInput: { width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', backgroundColor: '#e9ecef', boxSizing: 'border-box' },
  btnConfirm: { flex: 1, padding: '10px', backgroundColor: '#5A3825', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  btnCancel: { flex: 1, padding: '10px', backgroundColor: '#757575', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' },
};