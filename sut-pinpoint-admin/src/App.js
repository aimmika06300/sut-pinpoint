import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LayoutDashboard, Users, Bell, LogOut, 
  Search, Trash2, Edit 
} from 'lucide-react';
import Login from './Login';

const API_BASE = 'http://localhost:5000/api';

export default function App() {
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem('admin_logged_in') === 'true'
  );

  // Navigation & Sub-Tabs
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [activeSubTab, setActiveSubTab] = useState('Buildings Overview');

  // Search & Filters
  const [globalSearch, setGlobalSearch] = useState('');
  const [buildingFilter, setBuildingFilter] = useState('');
  const [filterBuildingSelect, setFilterBuildingSelect] = useState('All');
  const [filterFloorSelect, setFilterFloorSelect] = useState('All');
  const [filterTypeSelect, setFilterTypeSelect] = useState('All');

  // Database Data States
  const [buildings, setBuildings] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Admin Alerts: ตารางเรียนภาคการศึกษา 1/2569 อัปเดตแล้ว', time: '10 m ago' },
    { id: 2, title: 'Admin Alerts: มีการปรับปรุงข้อมูลห้องปฏิบัติการ Digitech Lab', time: '15 m ago' },
    { id: 3, title: 'Admin Alerts: ระบบเซิร์ฟเวอร์สำรองข้อมูลอัตโนมัติสำเร็จ', time: '20 m ago' },
    { id: 4, title: 'Admin Alerts: ตรวจพบการลงทะเบียนนักศึกษาใหม่ 5 รายการ', time: '22 m ago' },
    { id: 5, title: 'Admin Alerts: ตรวจสอบสถานะการเชื่อมต่อแผนที่ มทส.', time: '45 m ago' },
  ]);

  // Modal States
  const [showAddBuildingModal, setShowAddBuildingModal] = useState(false);
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [showEditRoomModal, setShowEditRoomModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] = useState(null);
  const [buildingToDelete, setBuildingToDelete] = useState(null);

  // Form States
  const [newBuilding, setNewBuilding] = useState({ name: '', floors: '', rooms_count: '' });
  const [newRoom, setNewRoom] = useState({ 
    id: '', 
    building_id: '', 
    building_name: '', 
    floor: '', 
    type: 'Lecture', 
    name: '', 
    status: 'Open' 
  });

  // State สำหรับห้องเรียนที่กำลังแก้ไข
  const [editingRoom, setEditingRoom] = useState(null);

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
      setBuildings(res.data);
      if (res.data.length > 0 && !newRoom.building_id) {
        setNewRoom(prev => ({ 
          ...prev, 
          building_id: res.data[0].id, 
          building_name: res.data[0].name 
        }));
      }
    } catch (err) {
      console.error('Error fetching buildings:', err);
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await axios.get(`${API_BASE}/rooms`);
      setClassrooms(res.data);
    } catch (err) {
      console.error('Error fetching classrooms:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/users`);
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  // Actions: เพิ่มอาคาร
  const handleAddBuildingSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/buildings`, newBuilding);
      setShowAddBuildingModal(false);
      setNewBuilding({ name: '', floors: '', rooms_count: '' });
      fetchBuildings();
    } catch (err) {
      alert('เพิ่มอาคารไม่สำเร็จ');
    }
  };

  // Actions: ลบอาคาร
  const handleConfirmDeleteBuilding = async () => {
    if (!buildingToDelete) return;
    try {
      await axios.delete(`${API_BASE}/buildings/${buildingToDelete.id}`);
      setBuildingToDelete(null);
      fetchBuildings();
      fetchRooms();
    } catch (err) {
      alert('ลบอาคารไม่สำเร็จ');
    }
  };

  // Actions: เพิ่มห้องเรียน
  const handleAddRoomSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/rooms`, newRoom);
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
      fetchRooms();
    } catch (err) {
      alert('เพิ่มห้องเรียนไม่สำเร็จ: ' + (err.response?.data?.error || err.message));
    }
  };

  // Actions: เปิด Modal แก้ไขห้องเรียน
  const handleOpenEditRoom = (room) => {
    setEditingRoom({
      originalId: room.id,
      id: room.id,
      building_id: room.building_id || '',
      building_name: room.building_name || '',
      floor: room.floor,
      type: room.type || 'Lecture',
      status: room.status === 'Close' ? 'Close' : 'Open'
    });
    setShowEditRoomModal(true);
  };

  // Actions: บันทึกการแก้ไขห้องเรียน
  const handleEditRoomSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE}/rooms/${editingRoom.originalId}`, editingRoom);
      setShowEditRoomModal(false);
      setEditingRoom(null);
      fetchRooms();
    } catch (err) {
      alert('แก้ไขห้องเรียนไม่สำเร็จ: ' + (err.response?.data?.error || err.message));
    }
  };

  // Actions: ลบห้องเรียน
  const handleDeleteRoom = async (id) => {
    if (window.confirm(`ยืนยันการลบห้องเรียน ${id}?`)) {
      try {
        await axios.delete(`${API_BASE}/rooms/${id}`);
        fetchRooms();
      } catch (err) {
        alert('ลบห้องเรียนไม่สำเร็จ');
      }
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('ยืนยันการลบผู้ใช้นี้?')) {
      try {
        await axios.delete(`${API_BASE}/users/${id}`);
        fetchUsers();
      } catch (err) {
        alert('ลบผู้ใช้ไม่สำเร็จ');
      }
    }
  };

  const handleDeleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const handleManageRooms = (buildingName) => {
    setFilterBuildingSelect(buildingName);
    setActiveSubTab('Classroom Table');
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    localStorage.setItem('admin_logged_in', 'true');
  };

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    setIsLoggedIn(false);
    localStorage.removeItem('admin_logged_in');
  };

  // Filters Calculation
  const filteredBuildings = buildings.filter(b => 
    b.name.toLowerCase().includes(buildingFilter.toLowerCase()) &&
    b.name.toLowerCase().includes(globalSearch.toLowerCase())
  );

  const filteredClassrooms = classrooms.filter(c => {
    const matchBuilding = filterBuildingSelect === 'All' || c.building_name === filterBuildingSelect;
    const matchFloor = filterFloorSelect === 'All' || String(c.floor) === String(filterFloorSelect);
    const matchType = filterTypeSelect === 'All' || c.type === filterTypeSelect;
    const matchSearch = (c.id && c.id.toLowerCase().includes(globalSearch.toLowerCase())) ||
                        (c.building_name && c.building_name.toLowerCase().includes(globalSearch.toLowerCase()));
    return matchBuilding && matchFloor && matchType && matchSearch;
  });

  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div style={styles.appContainer}>
      
      {/* 1. LEFT SIDEBAR */}
      <div style={styles.sidebar}>
        <div style={styles.brandBox}>
          <h1 style={styles.brandText}>PIN POINT</h1>
        </div>

        <div style={styles.adminProfileBox}>
          <div style={styles.avatarCircle}>👤</div>
          <div>
            <div style={styles.adminName}>ADMIN NAME</div>
            <div style={styles.adminRole}>(Admin)</div>
          </div>
        </div>

        <div style={styles.menuContainer}>
          <div style={styles.menuLabel}>Menu</div>
          
          <button 
            style={activeMenu === 'Dashboard' ? styles.menuItemActive : styles.menuItem}
            onClick={() => { setActiveMenu('Dashboard'); setActiveSubTab('Buildings Overview'); }}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>

          <button 
            style={activeMenu === 'Users' ? styles.menuItemActive : styles.menuItem}
            onClick={() => setActiveMenu('Users')}>
            <Users size={18} />
            <span>Users</span>
          </button>

          <button 
            style={activeMenu === 'Notification' ? styles.menuItemActive : styles.menuItem}
            onClick={() => { setActiveMenu('Notification'); setActiveSubTab('Notification'); }}>
            <Bell size={18} />
            <span>Notification</span>
          </button>

          <button 
            style={styles.menuItemLogout}
            onClick={() => setShowLogoutModal(true)}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* 2. RIGHT MAIN CONTENT */}
      <div style={styles.mainContent}>
        
        {/* Top Header */}
        <div style={styles.topHeader}>
          <h2 style={styles.headerTitle}>Admin Dashboard - Classroom Management</h2>
          <div style={styles.globalSearchBox}>
            <Search size={18} color="#5A3825" />
            <input 
              type="text" 
              placeholder="Search across all resources..." 
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              style={styles.globalSearchInput}
            />
          </div>
        </div>

        {/* Sub Navigation Bar */}
        <div style={styles.subNavBar}>
          <button 
            style={activeSubTab === 'Buildings Overview' && activeMenu === 'Dashboard' ? styles.subTabActive : styles.subTab}
            onClick={() => { setActiveMenu('Dashboard'); setActiveSubTab('Buildings Overview'); }}>
            Buildings Overview
          </button>
          <button 
            style={activeSubTab === 'Classroom Table' && activeMenu === 'Dashboard' ? styles.subTabActive : styles.subTab}
            onClick={() => { setActiveMenu('Dashboard'); setActiveSubTab('Classroom Table'); }}>
            Classroom Table
          </button>
          <button 
            style={activeMenu === 'Notification' || activeSubTab === 'Notification' ? styles.subTabActive : styles.subTab}
            onClick={() => { setActiveMenu('Notification'); setActiveSubTab('Notification'); }}>
            Notification
          </button>
        </div>

        {/* CARD CONTAINER */}
        <div style={styles.cardWrapper}>
          
          {/* ================= VIEW 1: BUILDINGS OVERVIEW ================= */}
          {activeMenu === 'Dashboard' && activeSubTab === 'Buildings Overview' && (
            <div style={styles.cardContent}>
              <div style={styles.cardHeaderRow}>
                <h3 style={styles.cardTitle}>Buildings Overview</h3>
                <button style={styles.addBuildingBtn} onClick={() => setShowAddBuildingModal(true)}>
                  Add New Building (+)
                </button>
              </div>

              <div style={styles.innerFilterBox}>
                <input 
                  type="text" 
                  placeholder="Filter..." 
                  value={buildingFilter}
                  onChange={(e) => setBuildingFilter(e.target.value)}
                  style={styles.innerFilterInput}
                />
              </div>

              <div style={styles.buildingTableHeader}>
                <div style={{ flex: 2, paddingLeft: '40px' }}>Building</div>
                <div style={{ flex: 1, textAlign: 'center' }}>Number</div>
                <div style={{ flex: 1, textAlign: 'center' }}>Rooms</div>
                <div style={{ flex: 2, textAlign: 'right', paddingRight: '30px' }}>Action</div>
              </div>

              <div style={styles.tableBody}>
                {filteredBuildings.length === 0 ? (
                  <div style={styles.emptyText}>ไม่พบข้อมูลอาคาร</div>
                ) : (
                  filteredBuildings.map((b) => (
                    <div key={b.id} style={styles.buildingTableRow}>
                      <div style={{ flex: 2, paddingLeft: '40px', fontWeight: 'bold', fontSize: '18px', color: '#000' }}>
                        {b.name}
                      </div>
                      <div style={{ flex: 1, textAlign: 'center', lineHeight: '1.2' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{b.floors}</div>
                        <div style={{ fontSize: '13px', color: '#222' }}>floors</div>
                      </div>
                      <div style={{ flex: 1, textAlign: 'center', lineHeight: '1.2' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{b.rooms_count || 0}</div>
                        <div style={{ fontSize: '13px', color: '#222' }}>floors</div>
                      </div>
                      <div style={{ flex: 2, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', paddingRight: '20px' }}>
                        <button style={styles.manageRoomBtn} onClick={() => handleManageRooms(b.name)}>
                          Manage Rooms
                        </button>
                        <button 
                          style={styles.deleteBuildingBtn} 
                          title="ลบอาคารนี้"
                          onClick={() => setBuildingToDelete(b)}>
                          <Trash2 size={16} color="#FFF" />
                          <span>ลบอาคาร</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ================= VIEW 2: CLASSROOM TABLE ================= */}
          {activeMenu === 'Dashboard' && activeSubTab === 'Classroom Table' && (
            <div style={styles.cardContent}>
              <div style={styles.cardHeaderRow}>
                <h3 style={styles.cardTitle}>Classroom Table</h3>
                <button style={styles.addBuildingBtn} onClick={() => setShowAddRoomModal(true)}>
                  Add New Room (+)
                </button>
              </div>

              <div style={styles.filterDropdownRow}>
                <div>
                  <label style={styles.dropdownLabel}>Building</label>
                  <select 
                    value={filterBuildingSelect} 
                    onChange={(e) => setFilterBuildingSelect(e.target.value)}
                    style={styles.selectBox}>
                    <option value="All">All Buildings</option>
                    {buildings.map(b => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={styles.dropdownLabel}>Floor</label>
                  <select 
                    value={filterFloorSelect} 
                    onChange={(e) => setFilterFloorSelect(e.target.value)}
                    style={styles.selectBox}>
                    <option value="All">All</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                  </select>
                </div>

                <div>
                  <label style={styles.dropdownLabel}>Room Type</label>
                  <select 
                    value={filterTypeSelect} 
                    onChange={(e) => setFilterTypeSelect(e.target.value)}
                    style={styles.selectBox}>
                    <option value="All">All Types</option>
                    <option value="Lecture">Lecture</option>
                    <option value="Lab">Lab</option>
                  </select>
                </div>
              </div>

              <div style={styles.buildingTableHeader}>
                <div style={{ flex: 1.5, paddingLeft: '20px' }}>Room</div>
                <div style={{ flex: 2 }}>Building</div>
                <div style={{ flex: 1, textAlign: 'center' }}>Floor</div>
                <div style={{ flex: 1, textAlign: 'center' }}>Status</div>
                <div style={{ flex: 1.2, textAlign: 'right', paddingRight: '20px' }}>Action</div>
              </div>

              <div style={styles.tableBody}>
                {filteredClassrooms.length === 0 ? (
                  <div style={styles.emptyText}>ไม่พบข้อมูลห้องเรียน</div>
                ) : (
                  filteredClassrooms.map((c) => {
                    const isOpen = c.status === 'Open' || c.status === 'Now';
                    return (
                      <div key={c.id} style={styles.buildingTableRow}>
                        <div style={{ flex: 1.5, paddingLeft: '20px', fontWeight: 'bold' }}>{c.id}</div>
                        <div style={{ flex: 2 }}>{c.building_name}</div>
                        <div style={{ flex: 1, textAlign: 'center' }}>{c.floor}</div>
                        <div style={{ flex: 1, textAlign: 'center', color: isOpen ? '#16a34a' : '#6b7280', fontWeight: 'bold' }}>
                          ● {isOpen ? 'Open' : 'Close'}
                        </div>
                        <div style={{ flex: 1.2, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', paddingRight: '20px' }}>
                          {/* ปุ่มดินสอแก้ไข */}
                          <button 
                            style={styles.actionIconBtn} 
                            title="แก้ไขห้องเรียน"
                            onClick={() => handleOpenEditRoom(c)}>
                            <Edit size={18} color="#E88147" />
                          </button>
                          {/* ปุ่มถังขยะลบ */}
                          <button 
                            style={styles.actionIconBtn} 
                            title="ลบห้องเรียน"
                            onClick={() => handleDeleteRoom(c.id)}>
                            <Trash2 size={18} color="#dc2626" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ================= VIEW 3: USERS MANAGER ================= */}
          {activeMenu === 'Users' && (
            <div style={styles.cardContent}>
              <div style={styles.cardHeaderRow}>
                <h3 style={styles.cardTitle}>Users Management</h3>
              </div>

              <div style={styles.buildingTableHeader}>
                <div style={{ flex: 0.8, paddingLeft: '20px' }}>No.</div>
                <div style={{ flex: 2 }}>Users (Name)</div>
                <div style={{ flex: 1.5 }}>Student ID</div>
                <div style={{ flex: 2, textAlign: 'right', paddingRight: '20px' }}>Action</div>
              </div>

              <div style={styles.tableBody}>
                {users.length === 0 ? (
                  <div style={styles.emptyText}>ไม่พบข้อมูลผู้ใช้งาน</div>
                ) : (
                  users.map((u, idx) => (
                    <div key={u.id} style={styles.buildingTableRow}>
                      <div style={{ flex: 0.8, paddingLeft: '20px' }}>{idx + 1}</div>
                      <div style={{ flex: 2, fontWeight: 'bold' }}>{u.name || `${u.first_name || ''} ${u.last_name || ''}`}</div>
                      <div style={{ flex: 1.5 }}>{u.student_id || `B${u.id}00000`}</div>
                      <div style={{ flex: 2, textAlign: 'right', paddingRight: '20px' }}>
                        <button style={styles.viewProfileBtn} onClick={() => setSelectedUserProfile(u)}>
                          VIEW PROFILE
                        </button>
                        <button style={styles.deleteUserBtn} onClick={() => handleDeleteUser(u.id)}>
                          DELETE
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ================= VIEW 4: NOTIFICATIONS ================= */}
          {(activeMenu === 'Notification' || activeSubTab === 'Notification') && (
            <div style={styles.cardContent}>
              <div style={styles.cardHeaderRow}>
                <h3 style={styles.cardTitle}>Notifications & System Alerts</h3>
              </div>

              <div style={{ padding: '10px 20px' }}>
                {notifications.map((n, idx) => (
                  <div key={n.id} style={styles.notiRow}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <span style={{ fontWeight: 'bold', color: '#5A3825' }}>{idx + 1}</span>
                      <div>
                        <div style={{ fontWeight: 'bold', color: '#222' }}>{n.title}</div>
                        <div style={{ fontSize: '12px', color: '#8C7A6B' }}>{n.time}</div>
                      </div>
                    </div>
                    <div>
                      <button style={styles.viewProfileBtn} onClick={() => alert(n.title)}>VIEW</button>
                      <button style={styles.deleteUserBtn} onClick={() => handleDeleteNotification(n.id)}>DELETE</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ================= MODAL: EDIT ROOM (ดินสอ) ================= */}
      {showEditRoomModal && editingRoom && (
        <div style={styles.modalOverlay}>
          <form style={styles.modalBox} onSubmit={handleEditRoomSubmit}>
            <h3 style={{ marginTop: 0, color: '#5A3825' }}>แก้ไขข้อมูลห้องเรียน</h3>
            
            <div style={styles.formGroup}>
              <label>Room ID (รหัสห้อง):</label>
              <input 
                required 
                style={styles.formInput} 
                value={editingRoom.id} 
                onChange={(e) => setEditingRoom({...editingRoom, id: e.target.value})} 
              />
            </div>

            <div style={styles.formGroup}>
              <label>Building (อาคาร):</label>
              <select 
                style={styles.formInput} 
                value={editingRoom.building_id} 
                onChange={(e) => {
                  const b = buildings.find(item => String(item.id) === String(e.target.value));
                  setEditingRoom({
                    ...editingRoom, 
                    building_id: e.target.value, 
                    building_name: b ? b.name : editingRoom.building_name
                  });
                }}>
                {buildings.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label>Floor (ชั้น):</label>
              <input 
                type="number" 
                required 
                style={styles.formInput} 
                value={editingRoom.floor} 
                onChange={(e) => setEditingRoom({...editingRoom, floor: e.target.value})} 
              />
            </div>

            <div style={styles.formGroup}>
              <label>Room Type (ประเภทห้อง):</label>
              <select 
                style={styles.formInput} 
                value={editingRoom.type} 
                onChange={(e) => setEditingRoom({...editingRoom, type: e.target.value})}>
                <option value="Lecture">Lecture</option>
                <option value="Lab">Lab</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label>Status (สถานะการใช้งาน):</label>
              <select 
                style={styles.formInput} 
                value={editingRoom.status} 
                onChange={(e) => setEditingRoom({...editingRoom, status: e.target.value})}>
                <option value="Open">Open (กำลังใช้งาน / เปิดใช้งาน)</option>
                <option value="Close">Close (ปิดใช้งาน)</option>
              </select>
            </div>

            <div style={styles.modalBtnRow}>
              <button type="button" style={styles.modalCancelBtn} onClick={() => setShowEditRoomModal(false)}>ยกเลิก</button>
              <button type="submit" style={styles.modalSaveBtn}>บันทึกการแก้ไข</button>
            </div>
          </form>
        </div>
      )}

      {/* ================= POPUP: CONFIRM DELETE BUILDING ================= */}
      {buildingToDelete && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalBox, textAlign: 'center', width: '360px' }}>
            <h3 style={{ marginTop: 0, color: '#DC2626' }}>ยืนยันการลบอาคาร</h3>
            <p style={{ color: '#5A3825', fontSize: '15px', lineHeight: '1.5' }}>
              คุณแน่ใจหรือไม่ว่าต้องการลบ <br/>
              <b>"{buildingToDelete.name}"</b> ออกจากระบบ?
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '24px' }}>
              <button 
                style={styles.modalCancelBtn} 
                onClick={() => setBuildingToDelete(null)}>
                ยกเลิก
              </button>
              <button 
                style={styles.deleteConfirmBtn} 
                onClick={handleConfirmDeleteBuilding}>
                ยืนยันลบอาคาร
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD BUILDING ================= */}
      {showAddBuildingModal && (
        <div style={styles.modalOverlay}>
          <form style={styles.modalBox} onSubmit={handleAddBuildingSubmit}>
            <h3 style={{ marginTop: 0, color: '#5A3825' }}>Add New Building</h3>
            <div style={styles.formGroup}>
              <label>Building Name:</label>
              <input 
                required 
                style={styles.formInput} 
                placeholder="e.g. อาคารสุรพัฒน์ 2" 
                value={newBuilding.name} 
                onChange={(e) => setNewBuilding({...newBuilding, name: e.target.value})} 
              />
            </div>
            <div style={styles.formGroup}>
              <label>Number of Floors:</label>
              <input 
                type="number" 
                required 
                style={styles.formInput} 
                placeholder="e.g. 4" 
                value={newBuilding.floors} 
                onChange={(e) => setNewBuilding({...newBuilding, floors: e.target.value})} 
              />
            </div>
            <div style={styles.formGroup}>
              <label>Rooms Count:</label>
              <input 
                type="number" 
                style={styles.formInput} 
                placeholder="e.g. 10" 
                value={newBuilding.rooms_count} 
                onChange={(e) => setNewBuilding({...newBuilding, rooms_count: e.target.value})} 
              />
            </div>
            <div style={styles.modalBtnRow}>
              <button type="button" style={styles.modalCancelBtn} onClick={() => setShowAddBuildingModal(false)}>Cancel</button>
              <button type="submit" style={styles.modalSaveBtn}>Save Building</button>
            </div>
          </form>
        </div>
      )}

      {/* ================= MODAL: ADD ROOM ================= */}
      {showAddRoomModal && (
        <div style={styles.modalOverlay}>
          <form style={styles.modalBox} onSubmit={handleAddRoomSubmit}>
            <h3 style={{ marginTop: 0, color: '#5A3825' }}>Add New Room</h3>
            <div style={styles.formGroup}>
              <label>Room ID (e.g. B6107-A):</label>
              <input 
                required 
                style={styles.formInput} 
                value={newRoom.id} 
                onChange={(e) => setNewRoom({...newRoom, id: e.target.value})} 
              />
            </div>
            <div style={styles.formGroup}>
              <label>Building:</label>
              <select 
                style={styles.formInput} 
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
            <div style={styles.formGroup}>
              <label>Floor:</label>
              <input 
                type="number" 
                required 
                style={styles.formInput} 
                value={newRoom.floor} 
                onChange={(e) => setNewRoom({...newRoom, floor: e.target.value})} 
              />
            </div>
            <div style={styles.formGroup}>
              <label>Type:</label>
              <select 
                style={styles.formInput} 
                value={newRoom.type} 
                onChange={(e) => setNewRoom({...newRoom, type: e.target.value})}>
                <option value="Lecture">Lecture</option>
                <option value="Lab">Lab</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label>Status:</label>
              <select 
                style={styles.formInput} 
                value={newRoom.status} 
                onChange={(e) => setNewRoom({...newRoom, status: e.target.value})}>
                <option value="Open">Open</option>
                <option value="Close">Close</option>
              </select>
            </div>
            <div style={styles.modalBtnRow}>
              <button type="button" style={styles.modalCancelBtn} onClick={() => setShowAddRoomModal(false)}>Cancel</button>
              <button type="submit" style={styles.modalSaveBtn}>Save Room</button>
            </div>
          </form>
        </div>
      )}

      {/* ================= MODAL: VIEW USER PROFILE ================= */}
      {selectedUserProfile && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <h3 style={{ marginTop: 0, color: '#5A3825' }}>Student Profile</h3>
            <p><b>Name:</b> {selectedUserProfile.name || `${selectedUserProfile.first_name} ${selectedUserProfile.last_name}`}</p>
            <p><b>Student ID:</b> {selectedUserProfile.student_id || selectedUserProfile.id}</p>
            <p><b>Institute:</b> {selectedUserProfile.institute || 'สำนักวิชาเทคโนโลยีดิจิทัล'}</p>
            <p><b>Club:</b> {selectedUserProfile.club || 'ชมรมคอมพิวเตอร์และนวัตกรรม'}</p>
            <button style={styles.modalCloseBtn} onClick={() => setSelectedUserProfile(null)}>Close</button>
          </div>
        </div>
      )}

      {/* ================= MODAL: LOGOUT CONFIRMATION ================= */}
      {showLogoutModal && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalBox, textAlign: 'center', width: '320px' }}>
            <h3 style={{ marginTop: 0, color: '#5A3825' }}>Logout</h3>
            <p style={{ color: '#666' }}>Are you sure you want to logout?</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '20px' }}>
              <button style={styles.logoutConfirmWhiteBtn} onClick={handleLogoutConfirm}>Logout</button>
              <button style={styles.logoutCancelRedBtn} onClick={() => setShowLogoutModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// STYLES
const styles = {
  appContainer: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backgroundColor: '#FFF8E7',
  },
  sidebar: {
    width: '240px',
    backgroundColor: '#5A453A',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
  },
  brandBox: {
    padding: '30px 20px 20px',
    textAlign: 'center',
  },
  brandText: {
    margin: 0,
    fontSize: '28px',
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: '1px',
  },
  adminProfileBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '0 25px 25px',
  },
  avatarCircle: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#FFF',
    color: '#5A453A',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
  },
  adminName: {
    fontWeight: 'bold',
    fontSize: '14px',
    color: '#FFF',
  },
  adminRole: {
    fontSize: '12px',
    color: '#E0D0C5',
  },
  menuContainer: {
    flex: 1,
    padding: '10px 15px',
  },
  menuLabel: {
    fontSize: '13px',
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: '10px',
    paddingLeft: '10px',
  },
  menuItem: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    background: 'none',
    border: 'none',
    color: '#FFFFFF',
    fontSize: '15px',
    cursor: 'pointer',
    borderRadius: '8px',
    marginBottom: '5px',
    textAlign: 'left',
  },
  menuItemActive: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    background: 'rgba(255, 255, 255, 0.2)',
    border: 'none',
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: '15px',
    cursor: 'pointer',
    borderRadius: '8px',
    marginBottom: '5px',
    textAlign: 'left',
  },
  menuItemLogout: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    background: 'none',
    border: 'none',
    color: '#FFFFFF',
    fontSize: '15px',
    cursor: 'pointer',
    borderRadius: '8px',
    marginTop: '20px',
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  topHeader: {
    backgroundColor: '#E88147',
    padding: '24px 30px',
  },
  headerTitle: {
    margin: '0 0 16px 0',
    color: '#000000',
    fontSize: '22px',
    fontWeight: 'bold',
  },
  globalSearchBox: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: '30px',
    padding: '8px 16px',
    gap: '10px',
    maxWidth: '550px',
  },
  globalSearchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '14px',
    color: '#5A3825',
  },
  subNavBar: {
    display: 'flex',
    gap: '40px',
    padding: '15px 40px 5px',
    backgroundColor: '#FFF8E7',
  },
  subTab: {
    background: 'none',
    border: 'none',
    fontSize: '15px',
    color: '#8C7A6B',
    fontWeight: 'bold',
    cursor: 'pointer',
    paddingBottom: '8px',
  },
  subTabActive: {
    background: 'none',
    border: 'none',
    fontSize: '15px',
    color: '#5A3825',
    fontWeight: 'bold',
    cursor: 'pointer',
    paddingBottom: '8px',
    borderBottom: '3px solid #5A3825',
  },
  cardWrapper: {
    padding: '20px 30px 40px',
    flex: 1,
  },
  cardContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 4px 15px rgba(0,0,0,0.06)',
  },
  cardHeaderRow: {
    backgroundColor: '#F39C6B',
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    margin: 0,
    fontSize: '20px',
    color: '#000000',
    fontWeight: 'bold',
  },
  addBuildingBtn: {
    backgroundColor: '#5A3825',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '10px',
    padding: '10px 20px',
    fontWeight: 'bold',
    fontSize: '14px',
    cursor: 'pointer',
  },
  innerFilterBox: {
    backgroundColor: '#F39C6B',
    padding: '0 24px 16px',
    display: 'flex',
    alignItems: 'center',
  },
  innerFilterInput: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '14px',
    outline: 'none',
  },
  buildingTableHeader: {
    backgroundColor: '#F39C6B',
    display: 'flex',
    padding: '12px 10px',
    fontWeight: 'bold',
    color: '#000000',
    fontSize: '16px',
    borderTop: '1px solid rgba(0,0,0,0.05)',
  },
  tableBody: {
    padding: '10px 0',
  },
  buildingTableRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px 10px',
    borderBottom: '1px solid #EFEFEF',
  },
  manageRoomBtn: {
    backgroundColor: '#5A3825',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 18px',
    fontWeight: 'bold',
    fontSize: '14px',
    cursor: 'pointer',
  },
  deleteBuildingBtn: {
    backgroundColor: '#DC2626',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 14px',
    fontWeight: 'bold',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  deleteConfirmBtn: {
    backgroundColor: '#DC2626',
    color: '#FFFFFF',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '14px',
  },
  filterDropdownRow: {
    display: 'flex',
    gap: '20px',
    padding: '16px 24px',
    backgroundColor: '#FFF8E7',
  },
  dropdownLabel: {
    display: 'block',
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#5A3825',
    marginBottom: '4px',
  },
  selectBox: {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #CCC',
    minWidth: '150px',
    outline: 'none',
  },
  actionIconBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewProfileBtn: {
    backgroundColor: '#5A3825',
    color: '#FFF',
    border: 'none',
    borderRadius: '6px',
    padding: '6px 14px',
    fontWeight: 'bold',
    fontSize: '12px',
    marginRight: '8px',
    cursor: 'pointer',
  },
  deleteUserBtn: {
    backgroundColor: '#DC2626',
    color: '#FFF',
    border: 'none',
    borderRadius: '6px',
    padding: '6px 14px',
    fontWeight: 'bold',
    fontSize: '12px',
    cursor: 'pointer',
  },
  notiRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 0',
    borderBottom: '1px solid #EEE',
  },
  emptyText: {
    textAlign: 'center',
    padding: '40px',
    color: '#8C7A6B',
    fontSize: '16px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    padding: '24px',
    borderRadius: '12px',
    width: '380px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
  },
  formGroup: {
    marginBottom: '14px',
  },
  formInput: {
    width: '100%',
    padding: '10px',
    marginTop: '6px',
    borderRadius: '6px',
    border: '1px solid #CCC',
    boxSizing: 'border-box',
  },
  modalBtnRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '20px',
  },
  modalCancelBtn: {
    padding: '8px 16px',
    borderRadius: '6px',
    border: '1px solid #CCC',
    background: '#FFF',
    cursor: 'pointer',
    color: '#333',
  },
  modalSaveBtn: {
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    background: '#E88147',
    color: '#FFF',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  modalCloseBtn: {
    width: '100%',
    padding: '10px',
    borderRadius: '6px',
    border: 'none',
    background: '#5A3825',
    color: '#FFF',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '15px',
  },
  logoutConfirmWhiteBtn: {
    backgroundColor: '#FFFFFF',
    color: '#000000',
    border: '1px solid #CCC',
    padding: '8px 24px',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  logoutCancelRedBtn: {
    backgroundColor: '#DC2626',
    color: '#FFFFFF',
    border: 'none',
    padding: '8px 24px',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
  }
};