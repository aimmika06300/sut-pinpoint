import React from 'react';

export default function AddBuildingModal({ 
  newBuilding, 
  setNewBuilding, 
  setShowAddBuildingModal, 
  handleAddBuildingSubmit 
}) {
  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.content}>
        <h3 style={{ marginTop: 0, color: '#5A3825' }}>Add New Building</h3>
        
        <form onSubmit={handleAddBuildingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={modalStyles.label}>Building Name:</label>
            <input 
              type="text" 
              placeholder="e.g. อาคารสุรพัฒน์ 2"
              value={newBuilding.name}
              onChange={(e) => setNewBuilding({ ...newBuilding, name: e.target.value })}
              style={modalStyles.input}
              required
            />
          </div>

          <div>
            <label style={modalStyles.label}>Number of Floors:</label>
            <input 
              type="number" 
              placeholder="e.g. 4"
              value={newBuilding.floors}
              onChange={(e) => setNewBuilding({ ...newBuilding, floors: e.target.value })}
              style={modalStyles.input}
              required
            />
          </div>

          <div>
            <label style={modalStyles.label}>Rooms Count:</label>
            <input 
              type="number" 
              placeholder="e.g. 10"
              value={newBuilding.total_rooms}
              onChange={(e) => setNewBuilding({ ...newBuilding, total_rooms: e.target.value })}
              style={modalStyles.input}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={() => setShowAddBuildingModal(false)} style={modalStyles.btnCancel}>
              Cancel
            </button>
            <button type="submit" style={modalStyles.btnConfirm}>
              Save Building
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const modalStyles = {
  // สำคัญมาก: ต้องมี position fixed เพื่อลอยคลุมทั้งหน้าจอ
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999
  },
  content: {
    backgroundColor: '#fff',
    padding: '24px',
    borderRadius: '12px',
    width: '360px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
  },
  label: {
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#5A3825',
    marginBottom: '4px',
    display: 'block'
  },
  input: {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    boxSizing: 'border-box',
    fontSize: '14px'
  },
  btnConfirm: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#5A3825',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  btnCancel: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#757575',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
  }
};