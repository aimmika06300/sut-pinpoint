import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { styles } from './styles/themeStyles';

// Components
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import MapView from './components/MapView';
import DashboardView from './components/DashboardView';
import UsersView from './components/UsersView';
import NotificationView from './components/NotificationView';
import Login from './Login';

// Modals
import AddBuildingModal from './modals/AddBuildingModal';
import RoomDetailModal from './modals/RoomDetailModal';

const API_BASE = 'http://localhost:5000/api';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('admin_logged_in') === 'true');
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [activeSubTab, setActiveSubTab] = useState('Buildings Overview');
  const [globalSearch, setGlobalSearch] = useState('');
  
  // States
  const [buildings, setBuildings] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Admin Alerts: ตารางเรียนภาคการศึกษา 1/2569 อัปเดตแล้ว', time: '10 m ago' },
  ]);

  // Modals & Selection States
  const [showAddBuildingModal, setShowAddBuildingModal] = useState(false);
  const [, setShowAddRoomModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [buildingToDelete, setBuildingToDelete] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null); // State สำหรับ Modal แก้ไขห้อง

  // Filter States
  const [buildingFilter, setBuildingFilter] = useState('');
  const [filterBuildingSelect, setFilterBuildingSelect] = useState('All');
  const [filterFloorSelect, setFilterFloorSelect] = useState('All');
  const [filterTypeSelect, setFilterTypeSelect] = useState('All');
  const [newBuilding, setNewBuilding] = useState({ name: '', floors: '', rooms_count: '' });

  useEffect(() => {
    if (isLoggedIn) {
      fetchBuildings();
      fetchRooms();
      fetchUsers();
    }
  }, [isLoggedIn]);

  const fetchBuildings = async () => {
    try {
      const res = await axios.get(`${API_BASE}/buildings`);
      const rawData = Array.isArray(res.data) ? res.data : [];
      const normalized = rawData.map(item => ({
        id: item.id || item.docId || 'unknown',
        name: item.name || item.building_name || item.id || 'ไม่ระบุชื่ออาคาร',
        floors: item.floors || 0,
        rooms_count: item.rooms_count || item.total || 0,
        ...item
      }));
      setBuildings(normalized);
    } catch (err) { 
      console.error("Error fetching buildings:", err); 
      setBuildings([]);
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await axios.get(`${API_BASE}/rooms`);
      const rawData = Array.isArray(res.data) ? res.data : [];
      const normalized = rawData.map(item => ({
        id: item.id || item.room_number || item.name || 'unknown',
        building_name: item.building_name || item.building || item.building_id || '-',
        floor: item.floor || '1',
        status: item.status || (item.available ? 'Open' : 'Close'),
        type: item.type || 'Lecture',
        ...item
      }));
      setClassrooms(normalized);
    } catch (err) { 
      console.error("Error fetching rooms:", err); 
      setClassrooms([]);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/users`);
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error(err); }
  };

  const handleAddBuildingSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/buildings`, newBuilding);
      setShowAddBuildingModal(false);
      setNewBuilding({ name: '', floors: '', rooms_count: '' });
      fetchBuildings();
    } catch (err) { alert('เพิ่มอาคารไม่สำเร็จ'); }
  };

  const handleUpdateBuilding = async (updatedBuilding) => {
    try {
      await axios.put(`${API_BASE}/buildings/${updatedBuilding.id}`, updatedBuilding);
      fetchBuildings();
    } catch (err) {
      console.error("Error updating building:", err);
      alert('ไม่สามารถบันทึกข้อมูลอาคารได้');
    }
  };

  // --- เพิ่มฟังก์ชันจัดการห้องเรียน ---
  const handleOpenEditRoom = (room) => {
    setEditingRoom({ ...room });
  };

  const handleUpdateRoom = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE}/rooms/${editingRoom.id}`, editingRoom);
      setEditingRoom(null);
      fetchRooms();
    } catch (err) {
      console.error("Error updating room:", err);
      alert('ไม่สามารถบันทึกข้อมูลห้องได้');
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (window.confirm(`ยืนยันการลบห้อง ${roomId}?`)) {
      try {
        await axios.delete(`${API_BASE}/rooms/${roomId}`);
        fetchRooms();
      } catch (err) {
        alert('ลบห้องไม่สำเร็จ');
      }
    }
  };

  if (!isLoggedIn) {
    return <Login onLoginSuccess={() => { setIsLoggedIn(true); localStorage.setItem('admin_logged_in', 'true'); }} />;
  }

  return (
    <div style={styles.appContainer}>
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} setShowLogoutModal={setShowLogoutModal} />
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <TopHeader globalSearch={globalSearch} setGlobalSearch={setGlobalSearch} />
        
        <div style={{ padding: '20px 30px 40px', flex: 1 }}>
          {activeMenu === 'Dashboard' && (
            <DashboardView 
              activeSubTab={activeSubTab} setActiveSubTab={setActiveSubTab}
              buildings={buildings} classrooms={classrooms}
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
            <MapView onSelectBuilding={setSelectedBuilding} />
          )}

          {activeMenu === 'Users' && (
            <UsersView users={users} setSelectedUserProfile={() => {}} handleDeleteUser={() => {}} />
          )}

          {activeMenu === 'Notification' && (
            <NotificationView notifications={notifications} setNotifications={setNotifications} />
          )}
        </div>
      </div>

      {/* --- Modal แก้ไขห้อง (Edit Room Modal) --- */}
      {editingRoom && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', width: '340px' }}>
            <h3 style={{ marginTop: 0, color: '#4A3B32' }}>✏️ แก้ไขข้อมูลห้องเรียน</h3>
            <form onSubmit={handleUpdateRoom} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>รหัสห้อง / ชื่อห้อง:</label>
                <input 
                  type="text" 
                  value={editingRoom.id || ''} 
                  disabled
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', backgroundColor: '#e9ecef', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>อาคาร:</label>
                <select 
                  value={editingRoom.building_name || ''} 
                  onChange={(e) => setEditingRoom({ ...editingRoom, building_name: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                >
                  {buildings.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>ชั้น:</label>
                <input 
                  type="number" 
                  value={editingRoom.floor || '1'} 
                  onChange={(e) => setEditingRoom({ ...editingRoom, floor: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>สถานะ:</label>
                <select 
                  value={editingRoom.status || 'Open'} 
                  onChange={(e) => setEditingRoom({ ...editingRoom, status: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                >
                  <option value="Open">Open</option>
                  <option value="Close">Close</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" style={{ flex: 1, padding: '10px', backgroundColor: '#4A3B32', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                  บันทึก
                </button>
                <button type="button" onClick={() => setEditingRoom(null)} style={{ flex: 1, padding: '10px', backgroundColor: '#757575', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Modals อื่นๆ --- */}
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
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', width: '320px', textAlign: 'center' }}>
            <h4 style={{ marginTop: 0 }}>⚠️ ยืนยันการลบอาคาร</h4>
            <p>คุณต้องการลบ <b>{buildingToDelete.name}</b> ใช่หรือไม่?</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button 
                onClick={async () => {
                  try {
                    await axios.delete(`${API_BASE}/buildings/${buildingToDelete.id}`);
                    setBuildingToDelete(null);
                    fetchBuildings();
                  } catch (err) { alert('ลบไม่สำเร็จ'); }
                }}
                style={{ flex: 1, padding: '10px', backgroundColor: '#d32f2f', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                ยืนยันลบ
              </button>
              <button 
                onClick={() => setBuildingToDelete(null)}
                style={{ flex: 1, padding: '10px', backgroundColor: '#757575', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

      {showLogoutModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', width: '300px', textAlign: 'center' }}>
            <h4 style={{ marginTop: 0 }}>🚪 ยืนยันออกจากระบบ</h4>
            <p>คุณต้องการออกจากระบบหรือไม่?</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button 
                onClick={() => {
                  localStorage.removeItem('admin_logged_in');
                  setIsLoggedIn(false);
                  setShowLogoutModal(false);
                }}
                style={{ flex: 1, padding: '10px', backgroundColor: '#d32f2f', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                ออกจากระบบ
              </button>
              <button 
                onClick={() => setShowLogoutModal(false)}
                style={{ flex: 1, padding: '10px', backgroundColor: '#757575', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}