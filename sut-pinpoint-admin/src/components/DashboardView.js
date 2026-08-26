import React, { useState } from 'react';
import { Trash2, Edit } from 'lucide-react';
import { colors } from '../styles/themeStyles';

export default function DashboardView({
  activeSubTab, setActiveSubTab,
  buildings, classrooms,
  buildingFilter, setBuildingFilter,
  filterBuildingSelect, setFilterBuildingSelect,
  filterFloorSelect, setFilterFloorSelect,
  filterTypeSelect, setFilterTypeSelect,
  setShowAddBuildingModal, setShowAddRoomModal,
  handleOpenEditRoom, handleDeleteRoom, setBuildingToDelete,
  globalSearch, onUpdateBuilding
}) {
  // State สำหรับจัดการ Modal แก้ไขอาคาร
  const [editingBuilding, setEditingBuilding] = useState(null);

  const filteredBuildings = buildings.filter(b => 
    (b.name || '').toLowerCase().includes(buildingFilter.toLowerCase()) &&
    (b.name || '').toLowerCase().includes(globalSearch.toLowerCase())
  );

  const filteredClassrooms = classrooms.filter(c => {
    const matchBuilding = filterBuildingSelect === 'All' || c.building_name === filterBuildingSelect;
    const matchFloor = filterFloorSelect === 'All' || String(c.floor) === String(filterFloorSelect);
    const matchType = filterTypeSelect === 'All' || c.type === filterTypeSelect;
    const matchSearch = (c.id && c.id.toLowerCase().includes(globalSearch.toLowerCase())) ||
                        (c.building_name && c.building_name.toLowerCase().includes(globalSearch.toLowerCase()));
    return matchBuilding && matchFloor && matchType && matchSearch;
  });

  const handleSaveBuilding = (e) => {
    e.preventDefault();
    if (onUpdateBuilding) {
      onUpdateBuilding(editingBuilding);
    }
    setEditingBuilding(null);
  };

  return (
    <div>
      {/* Sub Nav Bar */}
      <div style={{ display: 'flex', gap: '40px', paddingBottom: '15px' }}>
        <button 
          style={activeSubTab === 'Buildings Overview' ? dashStyles.subTabActive : dashStyles.subTab}
          onClick={() => setActiveSubTab('Buildings Overview')}>
          Buildings Overview
        </button>
        <button 
          style={activeSubTab === 'Classroom Table' ? dashStyles.subTabActive : dashStyles.subTab}
          onClick={() => setActiveSubTab('Classroom Table')}>
          Classroom Table
        </button>
      </div>

      <div style={{ backgroundColor: colors.white, borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}>
        
        {/* VIEW 1: BUILDINGS OVERVIEW */}
        {activeSubTab === 'Buildings Overview' && (
          <div>
            <div style={dashStyles.cardHeader}>
              <h3 style={{ margin: 0, fontSize: '20px' }}>Buildings Overview</h3>
              <button style={dashStyles.addBtn} onClick={() => setShowAddBuildingModal(true)}>
                Add New Building (+)
              </button>
            </div>
            <div style={{ backgroundColor: colors.cardHeaderBg, padding: '0 24px 16px' }}>
              <input 
                type="text" 
                placeholder="Filter..." 
                value={buildingFilter}
                onChange={(e) => setBuildingFilter(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: 'none', outline: 'none' }}
              />
            </div>
            <div style={dashStyles.tableHeader}>
              <div style={{ flex: 2, paddingLeft: '40px' }}>Building</div>
              <div style={{ flex: 1, textAlign: 'center' }}>Number</div>
              <div style={{ flex: 1, textAlign: 'center' }}>Rooms</div>
              <div style={{ flex: 2, textAlign: 'right', paddingRight: '30px' }}>Action</div>
            </div>
            {filteredBuildings.map((b) => (
              <div key={b.id} style={dashStyles.tableRow}>
                <div style={{ flex: 2, paddingLeft: '40px', fontWeight: 'bold', fontSize: '18px' }}>{b.name}</div>
                <div style={{ flex: 1, textAlign: 'center' }}>{b.floors} floors</div>
                <div style={{ flex: 1, textAlign: 'center' }}>{b.rooms_count || 0} rooms</div>
                <div style={{ flex: 2, display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingRight: '20px' }}>
                  <button style={dashStyles.btnBrown} onClick={() => setEditingBuilding({ ...b })}>
                    Manage Building
                  </button>
                  <button style={dashStyles.btnRed} onClick={() => setBuildingToDelete(b)}>
                    <Trash2 size={16} /> ลบอาคาร
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* VIEW 2: CLASSROOM TABLE */}
        {activeSubTab === 'Classroom Table' && (
          <div>
            <div style={dashStyles.cardHeader}>
              <h3 style={{ margin: 0, fontSize: '20px' }}>Classroom Table</h3>
              <button style={dashStyles.addBtn} onClick={() => setShowAddRoomModal(true)}>Add New Room (+)</button>
            </div>
            <div style={{ display: 'flex', gap: '20px', padding: '16px 24px', backgroundColor: colors.primaryBg }}>
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
                  <option value="All">All</option>
                  {['1','2','3','4','5','6'].map(f => <option key={f} value={f}>{f}</option>)}
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
              <div style={{ flex: 1.5, paddingLeft: '20px' }}>Room</div>
              <div style={{ flex: 2 }}>Building</div>
              <div style={{ flex: 1, textAlign: 'center' }}>Floor</div>
              <div style={{ flex: 1, textAlign: 'center' }}>Status</div>
              <div style={{ flex: 1.2, textAlign: 'right', paddingRight: '20px' }}>Action</div>
            </div>
            {filteredClassrooms.map((c) => {
              const isOpen = c.status === 'Open' || c.status === 'Now';
              return (
                <div key={c.id} style={dashStyles.tableRow}>
                  <div style={{ flex: 1.5, paddingLeft: '20px', fontWeight: 'bold' }}>{c.id}</div>
                  <div style={{ flex: 2 }}>{c.building_name}</div>
                  <div style={{ flex: 1, textAlign: 'center' }}>{c.floor}</div>
                  <div style={{ flex: 1, textAlign: 'center', color: isOpen ? colors.success : '#6b7280', fontWeight: 'bold' }}>
                    ● {isOpen ? 'Open' : 'Close'}
                  </div>
                  <div style={{ flex: 1.2, display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingRight: '20px' }}>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => handleOpenEditRoom(c)}>
                      <Edit size={18} color={colors.headerBg} />
                    </button>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => handleDeleteRoom(c.id)}>
                      <Trash2 size={18} color={colors.danger} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* --- Modal แก้ไขอาคาร (Manage Building) --- */}
      {editingBuilding && (
        <div style={dashStyles.modalOverlay}>
          <div style={dashStyles.modalContent}>
            <h3 style={{ margin: '0 0 16px 0', color: colors.accentBrown }}>✏️ แก้ไขข้อมูลอาคาร</h3>
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
                <label style={dashStyles.label}>จำนวนห้องทั้งหมด:</label>
                <input 
                  type="number" 
                  value={editingBuilding.rooms_count || 0} 
                  onChange={(e) => setEditingBuilding({ ...editingBuilding, rooms_count: parseInt(e.target.value) || 0 })}
                  style={dashStyles.input}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                <button type="submit" style={{ ...dashStyles.btnBrown, flex: 1 }}>
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
  subTab: { background: 'none', border: 'none', fontSize: '15px', color: colors.subText, fontWeight: 'bold', cursor: 'pointer', paddingBottom: '8px' },
  subTabActive: { background: 'none', border: 'none', fontSize: '15px', color: colors.accentBrown, fontWeight: 'bold', cursor: 'pointer', paddingBottom: '8px', borderBottom: `3px solid ${colors.accentBrown}` },
  cardHeader: { backgroundColor: colors.cardHeaderBg, padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  addBtn: { backgroundColor: colors.accentBrown, color: colors.white, border: 'none', borderRadius: '10px', padding: '10px 20px', fontWeight: 'bold', cursor: 'pointer' },
  tableHeader: { backgroundColor: colors.cardHeaderBg, display: 'flex', padding: '12px 10px', fontWeight: 'bold', borderTop: '1px solid rgba(0,0,0,0.05)' },
  tableRow: { display: 'flex', alignItems: 'center', padding: '16px 10px', borderBottom: '1px solid #EFEFEF' },
  btnBrown: { backgroundColor: colors.accentBrown, color: colors.white, border: 'none', borderRadius: '8px', padding: '10px 18px', fontWeight: 'bold', cursor: 'pointer' },
  btnGray: { backgroundColor: '#757575', color: colors.white, border: 'none', borderRadius: '8px', padding: '10px 18px', fontWeight: 'bold', cursor: 'pointer' },
  btnRed: { backgroundColor: colors.danger, color: colors.white, border: 'none', borderRadius: '8px', padding: '10px 14px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' },
  label: { display: 'block', fontSize: '13px', fontWeight: 'bold', color: colors.accentBrown, marginBottom: '4px' },
  select: { padding: '8px 12px', borderRadius: '6px', border: '1px solid #CCC', minWidth: '150px' },
  input: { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CCC', fontSize: '14px', boxSizing: 'border-box' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: '#FFF', padding: '24px', borderRadius: '12px', width: '340px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }
};