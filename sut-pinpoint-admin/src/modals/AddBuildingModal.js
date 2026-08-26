import React from 'react';
import { styles, colors } from '../styles/themeStyles';

export default function AddBuildingModal({ newBuilding, setNewBuilding, setShowAddBuildingModal, handleAddBuildingSubmit }) {
  return (
    <div style={styles.modalOverlay}>
      <form style={styles.modalBox} onSubmit={handleAddBuildingSubmit}>
        <h3 style={{ marginTop: 0, color: colors.accentBrown }}>Add New Building</h3>
        <div style={styles.formGroup}>
          <label>Building Name:</label>
          <input required style={styles.formInput} placeholder="e.g. อาคารสุรพัฒน์ 2" value={newBuilding.name} onChange={(e) => setNewBuilding({...newBuilding, name: e.target.value})} />
        </div>
        <div style={styles.formGroup}>
          <label>Number of Floors:</label>
          <input type="number" required style={styles.formInput} placeholder="e.g. 4" value={newBuilding.floors} onChange={(e) => setNewBuilding({...newBuilding, floors: e.target.value})} />
        </div>
        <div style={styles.formGroup}>
          <label>Rooms Count:</label>
          <input type="number" style={styles.formInput} placeholder="e.g. 10" value={newBuilding.rooms_count} onChange={(e) => setNewBuilding({...newBuilding, rooms_count: e.target.value})} />
        </div>
        <div style={styles.modalBtnRow}>
          <button type="button" style={styles.modalCancelBtn} onClick={() => setShowAddBuildingModal(false)}>Cancel</button>
          <button type="submit" style={styles.modalSaveBtn}>Save Building</button>
        </div>
      </form>
    </div>
  );
}