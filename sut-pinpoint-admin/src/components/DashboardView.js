import React, { useState } from 'react';
import { Trash2, Edit, DoorOpen, Plus, Search } from 'lucide-react';
import { colors } from '../styles/themeStyles';

export default function DashboardView({
  activeSubTab, setActiveSubTab,
  buildings, classrooms, loading,
  buildingFilter, setBuildingFilter,
  filterBuildingSelect, setFilterBuildingSelect,
  filterFloorSelect, setFilterFloorSelect,
  filterTypeSelect, setFilterTypeSelect,
  setShowAddBuildingModal, setShowAddRoomModal,
  handleOpenEditRoom, handleDeleteRoom, setBuildingToDelete,
  onUpdateBuilding
}) {
  const [editingBuilding, setEditingBuilding] = useState(null);
  
  // State สำหรับค้นหาห้องเรียนใต้ Classroom Table
  const [roomSearch, setRoomSearch] = useState('');

  // ค้นหาอาคาร (Buildings Overview)
  const filteredBuildings = buildings.filter(b => 
    (b.name || '').toLowerCase().includes(buildingFilter.toLowerCase())
  );

  // กรองและค้นหาห้องเรียน (Classroom Table)
  const filteredClassrooms = classrooms.filter(c => {
    const matchBuilding = filterBuildingSelect === 'All' || c.building_name === filterBuildingSelect;
    const matchFloor = filterFloorSelect === 'All' || String(c.floor) === String(filterFloorSelect);
    const matchType = filterTypeSelect === 'All' || c.type === filterTypeSelect;
    const matchSearch = (c.id && c.id.toLowerCase().includes(roomSearch.toLowerCase())) ||
                        (c.building_name && c.building_name.toLowerCase().includes(roomSearch.toLowerCase()));
    return matchBuilding && matchFloor && matchType && matchSearch;
  });

  const handleSaveBuilding = (e) => {
    e.preventDefault();
    if (onUpdateBuilding) onUpdateBuilding(editingBuilding);
    setEditingBuilding(null);
  };

  const handleJumpToBuildingRooms = (buildingName) => {
    setFilterBuildingSelect(buildingName);
    setActiveSubTab('Classroom Table');
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Sub Nav Bar */}
      <div style={{ display: 'flex', gap: '30px', paddingBottom: '15px' }}>
        <button 
          style={activeSubTab === 'Buildings Overview' ? dashStyles.subTabActive : dashStyles.subTab}
          onClick={() => setActiveSubTab('Buildings Overview')}>
          Buildings Overview ({buildings.length})
        </button>
        <button 
          style={activeSubTab === 'Classroom Table' ? dashStyles.subTabActive : dashStyles.subTab}
          onClick={() => setActiveSubTab('Classroom Table')}>
          Classroom Table ({classrooms.length})
        </button>
      </div>

      <div style={{ backgroundColor: colors.white || '#FFF', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}>
        
        {/* VIEW 1: BUILDINGS OVERVIEW */}
        {activeSubTab === 'Buildings Overview' && (
          <div>
            <div style={dashStyles.cardHeader}>
              <h3 style={{ margin: 0, fontSize: '20px', color: colors.accentBrown || '#5A3825' }}>Buildings Overview</h3>
              <button style={dashStyles.addBtn} onClick={() => setShowAddBuildingModal(true)}>
                <Plus size={16} /> Add New Building
              </button>
            </div>
            <div style={{ backgroundColor: colors.cardHeaderBg || '#FAF6F0', padding: '0 24px 16px' }}>
              <div style={dashStyles.searchWrapper}>
                <Search size={16} color={colors.subText || '#757575'} />
                <input 
                  type="text" 
                  placeholder="ค้นหาชื่ออาคาร..." 
                  value={buildingFilter}
                  onChange={(e) => setBuildingFilter(e.target.value)}
                  style={dashStyles.searchInput}
                />
              </div>
            </div>

            <div style={dashStyles.tableHeader}>
              <div style={{ flex: 2, paddingLeft: '24px' }}>Building Name</div>
              <div style={{ flex: 1, textAlign: 'center' }}>Floors</div>
              <div style={{ flex: 1.2, textAlign: 'center' }}>Rooms (Avail/Total)</div>
              <div style={{ flex: 2.5, textAlign: 'right', paddingRight: '24px' }}>Action</div>
            </div>

            {loading ? (
              <div style={dashStyles.emptyState}>⏳ กำลังโหลดข้อมูลอาคาร...</div>
            ) : filteredBuildings.length === 0 ? (
              <div style={dashStyles.emptyState}>🚫 ไม่พบข้อมูลอาคารที่ค้นหา</div>
            ) : (
              filteredBuildings.map((b) => (
                <div key={b.id} style={dashStyles.tableRow}>
                  <div style={{ flex: 2, paddingLeft: '24px', fontWeight: 'bold', fontSize: '16px', color: colors.accentBrown || '#5A3825' }}>
                    {b.name}
                  </div>
                  <div style={{ flex: 1, textAlign: 'center' }}>{b.floors} floors</div>
                  <div style={{ flex: 1.2, textAlign: 'center' }}>
                    <span style={{ color: colors.success || '#2e7d32', fontWeight: 'bold' }}>{b.available_rooms}</span> / {b.total_rooms} rooms
                  </div>
                  <div style={{ flex: 2.5, display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingRight: '24px' }}>
                    <button style={dashStyles.btnGreen} onClick={() => handleJumpToBuildingRooms(b.name)}>
                      <DoorOpen size={15} /> ดูห้องในอาคารนี้
                    </button>
                    <button style={dashStyles.btnBrown} onClick={() => setEditingBuilding({ ...b })}>
                      <Edit size={15} /> Manage
                    </button>
                    <button style={dashStyles.btnRed} onClick={() => setBuildingToDelete(b)}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* VIEW 2: CLASSROOM TABLE */}
        {activeSubTab === 'Classroom Table' && (
          <div>
            <div style={dashStyles.cardHeader}>
              <h3 style={{ margin: 0, fontSize: '20px', color: colors.accentBrown || '#5A3825' }}>Classroom Table</h3>
              <button style={dashStyles.addBtn} onClick={() => setShowAddRoomModal(true)}>
                <Plus size={16} /> Add New Room
              </button>
            </div>
            
            {/* Filter & Search Bar สำหรับห้องเรียน */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '16px 24px', backgroundColor: colors.cardHeaderBg || '#FAF6F0', flexWrap: 'wrap' }}>
              {/* ช่องค้นหาห้องเรียนเพิ่มเติม */}
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={dashStyles.label}>Search Room</label>
                <div style={dashStyles.searchWrapper}>
                  <Search size={16} color={colors.subText || '#757575'} />
                  <input 
                    type="text" 
                    placeholder="ค้นหาชื่อห้อง / รหัสห้อง..." 
                    value={roomSearch}
                    onChange={(e) => setRoomSearch(e.target.value)}
                    style={dashStyles.searchInput}
                  />
                </div>
              </div>

              <div>
                <label style={dashStyles.label}>Building</label>
                <select value={filterBuildingSelect} onChange={(e) => setFilterBuildingSelect(e.target.value)} style={dashStyles.select}>
                  <option value="All">All Buildings</option>
                  {buildings.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label style={dashStyles.label}>Floor</label>
                <select value={filterFloorSelect} onChange={(e) => setFilterFloorSelect(e.target.value)} style={dashStyles.select}>
                  <option value="All">All Floors</option>
                  {['1','2','3','4','5','6','7','8'].map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label style={dashStyles.label}>Room Type</label>
                <select value={filterTypeSelect} onChange={(e) => setFilterTypeSelect(e.target.value)} style={dashStyles.select}>
                  <option value="All">All Types</option>
                  <option value="Lecture">Lecture</option>
                  <option value="Lab">Lab</option>
                </select>
              </div>
            </div>

            <div style={dashStyles.tableHeader}>
              <div style={{ flex: 1.5, paddingLeft: '24px' }}>Room Number</div>
              <div style={{ flex: 2 }}>Building</div>
              <div style={{ flex: 1, textAlign: 'center' }}>Floor</div>
              <div style={{ flex: 1, textAlign: 'center' }}>Status</div>
              <div style={{ flex: 1.2, textAlign: 'right', paddingRight: '24px' }}>Action</div>
            </div>

            {loading ? (
              <div style={dashStyles.emptyState}>⏳ กำลังโหลดข้อมูลห้องเรียน...</div>
            ) : filteredClassrooms.length === 0 ? (
              <div style={dashStyles.emptyState}>🚫 ไม่พบข้อมูลห้องเรียนตามเงื่อนไข</div>
            ) : (
              filteredClassrooms.map((c) => {
                const isOpen = c.status === 'Open' || c.status === 'Now';
                return (
                  <div key={c.id} style={dashStyles.tableRow}>
                    <div style={{ flex: 1.5, paddingLeft: '24px', fontWeight: 'bold' }}>{c.id}</div>
                    <div style={{ flex: 2 }}>{c.building_name}</div>
                    <div style={{ flex: 1, textAlign: 'center' }}>{c.floor}</div>
                    <div style={{ flex: 1, textAlign: 'center', color: isOpen ? (colors.success || '#2e7d32') : '#6b7280', fontWeight: 'bold' }}>
                      ● {isOpen ? 'Open' : 'Close'}
                    </div>
                    <div style={{ flex: 1.2, display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingRight: '24px' }}>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => handleOpenEditRoom(c)}>
                        <Edit size={18} color={colors.accentBrown || '#5A3825'} />
                      </button>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => handleDeleteRoom(c.id)}>
                        <Trash2 size={18} color={colors.danger || '#d32f2f'} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

      </div>

      {/* MODAL: Edit Building */}
      {editingBuilding && (
        <div style={dashStyles.modalOverlay}>
          <div style={dashStyles.modalContent}>
            <h3 style={{ margin: '0 0 16px 0', color: colors.accentBrown || '#5A3825' }}>✏️ แก้ไขข้อมูลอาคาร</h3>
            <form onSubmit={handleSaveBuilding} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={dashStyles.label}>ชื่ออาคาร:</label>
                <input 
                  type="text" 
                  value={editingBuilding.name || ''} 
                  onChange={(e) => setEditingBuilding({ ...editingBuilding, name: e.target.value })}
                  style={dashStyles.input}
                  required
                />
              </div>
              <div>
                <label style={dashStyles.label}>จำนวนชั้น:</label>
                <input 
                  type="number" 
                  value={editingBuilding.floors || 0} 
                  onChange={(e) => setEditingBuilding({ ...editingBuilding, floors: parseInt(e.target.value) || 0 })}
                  style={dashStyles.input}
                  required
                />
              </div>
              <div>
                <label style={dashStyles.label}>ห้องว่างปัจจุบัน (Available):</label>
                <input 
                  type="number" 
                  value={editingBuilding.available_rooms || 0} 
                  onChange={(e) => setEditingBuilding({ ...editingBuilding, available_rooms: parseInt(e.target.value) || 0 })}
                  style={dashStyles.input}
                  required
                />
              </div>
              <div>
                <label style={dashStyles.label}>จำนวนห้องทั้งหมด (Total Rooms):</label>
                <input 
                  type="number" 
                  value={editingBuilding.total_rooms || 0} 
                  onChange={(e) => setEditingBuilding({ ...editingBuilding, total_rooms: parseInt(e.target.value) || 0 })}
                  style={dashStyles.input}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                <button type="submit" style={{ ...dashStyles.btnBrown, flex: 1, justifyContent: 'center' }}>
                  บันทึก
                </button>
                <button type="button" onClick={() => setEditingBuilding(null)} style={{ ...dashStyles.btnGray, flex: 1 }}>
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const dashStyles = {
  subTab: { background: 'none', border: 'none', fontSize: '15px', color: colors.subText || '#757575', fontWeight: 'bold', cursor: 'pointer', paddingBottom: '8px' },
  subTabActive: { background: 'none', border: 'none', fontSize: '15px', color: colors.accentBrown || '#ff6f1b', fontWeight: 'bold', cursor: 'pointer', paddingBottom: '8px', borderBottom: `3px solid ${colors.accentBrown || '#5A3825'}` },
  cardHeader: { backgroundColor: colors.cardHeaderBg || '#FAF6F0', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  addBtn: { backgroundColor: colors.accentBrown || '#5A3825', color: colors.white || '#FFF', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' },
  tableHeader: { backgroundColor: colors.cardHeaderBg || '#FAF6F0', display: 'flex', padding: '12px 10px', fontWeight: 'bold', borderTop: '1px solid rgba(0,0,0,0.05)', color: colors.accentBrown || '#5A3825' },
  tableRow: { display: 'flex', alignItems: 'center', padding: '14px 10px', borderBottom: '1px solid #EFEFEF' },
  btnGreen: { backgroundColor: colors.success || '#2e7d32', color: colors.white || '#FFF', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' },
  btnBrown: { backgroundColor: colors.accentBrown || '#5A3825', color: colors.white || '#FFF', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' },
  btnGray: { backgroundColor: '#757575', color: colors.white || '#FFF', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' },
  btnRed: { backgroundColor: colors.danger || '#d32f2f', color: colors.white || '#FFF', border: 'none', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  label: { display: 'block', fontSize: '13px', fontWeight: 'bold', color: colors.accentBrown || '#5A3825', marginBottom: '4px' },
  select: { padding: '8px 12px', borderRadius: '6px', border: '1px solid #CCC', minWidth: '150px', backgroundColor: colors.white || '#FFF', height: '35px' },
  input: { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CCC', fontSize: '14px', boxSizing: 'border-box' },
  searchWrapper: { display: 'flex', alignItems: 'center', backgroundColor: colors.white || '#FFF', padding: '6px 12px', borderRadius: '8px', gap: '8px', border: '1px solid #CCC', height: '35px', boxSizing: 'border-box' },
  searchInput: { border: 'none', outline: 'none', width: '100%', fontSize: '14px' },
  emptyState: { padding: '40px', textAlign: 'center', color: colors.subText || '#757575', fontSize: '15px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: '#FFF', padding: '24px', borderRadius: '12px', width: '360px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }
};