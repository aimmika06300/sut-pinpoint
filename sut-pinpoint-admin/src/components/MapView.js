import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { colors } from '../styles/themeStyles';

const redPinIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [36, 36],
  iconAnchor: [19, 36],
  popupAnchor: [0, -32],
});

function ChangeView({ center, zoom }) {
  const map = useMap();
  // ป้องกัน Error Invalid LatLng object โดยตรวจสอบก่อนส่งให้ Leaflet
  if (Array.isArray(center) && center[0] != null && center[1] != null && !isNaN(center[0]) && !isNaN(center[1])) {
    map.setView(center, zoom);
  }
  return null;
}

export default function MapView({ onSelectBuilding }) {
  const defaultCenter = [14.8770, 102.0185];
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [zoomLevel, setZoomLevel] = useState(16.5);
  
  const [isLocked, setIsLocked] = useState(true);
  const [editingBuilding, setEditingBuilding] = useState(null);
  
  const [buildingsOnMap, setBuildingsOnMap] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. ดึงข้อมูลอาคารทั้งหมดจาก Express Backend
  const fetchBuildings = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/buildings');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setBuildingsOnMap(data);
    } catch (error) {
      console.error("Error fetching buildings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuildings();
  }, []);

  // 2. อัปเดตพิกัดหมุดเมื่อลากบนแผนที่ ยิงไปที่ PUT /api/buildings/:id
  const handleMarkerDragEnd = async (docId, event) => {
    const { lat, lng } = event.target.getLatLng();
    const newLat = parseFloat(lat.toFixed(6));
    const newLng = parseFloat(lng.toFixed(6));

    try {
      const res = await fetch(`http://localhost:5000/api/buildings/${docId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat: newLat, lng: newLng }),
      });

      if (!res.ok) throw new Error('Update failed');
      fetchBuildings(); // โหลดข้อมูลใหม่เพื่ออัปเดต State
    } catch (error) {
      console.error("Error updating location:", error);
      alert("ไม่สามารถบันทึกตำแหน่งใหม่ได้");
    }
  };

  // 3. บันทึกการแก้ไขข้อมูลอาคารจาก Modal ยิงไปที่ PUT /api/buildings/:id
  const handleSaveBuildingEdit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/buildings/${editingBuilding.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingBuilding.name,
          floors: Number(editingBuilding.floors),
          available: Number(editingBuilding.available),
          total: Number(editingBuilding.total),
        }),
      });

      if (!res.ok) throw new Error('Save failed');
      setEditingBuilding(null);
      fetchBuildings();
    } catch (error) {
      console.error("Error updating building edit:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: colors.accentBrown }}>
        ⏳ กำลังโหลดข้อมูลอาคาร...
      </div>
    );
  }

  return (
    <div style={mapStyles.wrapper}>
      <div style={mapStyles.headerBar}>
        <div>
          <h3 style={{ margin: 0, color: colors.accentBrown }}>Interactive Campus Map (SUT Pinpoint)</h3>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: colors.subText }}>
            {isLocked ? '🔒 สถานะหมุด: ล็อกตำแหน่งเรียบร้อย' : '🔓 สถานะหมุด: สามารถคลิกค้างเพื่อลากย้ายได้'}
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setIsLocked(!isLocked)}
            style={{
              ...mapStyles.actionBtn,
              backgroundColor: isLocked ? '#2e7d32' : '#d32f2f',
            }}>
            {isLocked ? '🔒 ล็อกหมุด' : '🔓 ปลดล็อกหมุด'}
          </button>

          <button 
            onClick={() => { setMapCenter(defaultCenter); setZoomLevel(16.5); }}
            style={{ ...mapStyles.actionBtn, backgroundColor: colors.accentBrown }}>
            Reset Focus
          </button>
        </div>
      </div>

      <div style={mapStyles.mapContainer}>
        <MapContainer center={mapCenter} zoom={zoomLevel} scrollWheelZoom={true} style={{ width: '100%', height: '100%' }}>
          <ChangeView center={mapCenter} zoom={zoomLevel} />
          
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {buildingsOnMap.map((b) => {
            // ตรวจสอบพิกัดว่ามีค่าถูกต้องหรือไม่ ถ้าไม่มีให้ใช้ค่าเริ่มต้น
            const lat = (b.lat != null && !isNaN(b.lat)) ? Number(b.lat) : defaultCenter[0];
            const lng = (b.lng != null && !isNaN(b.lng)) ? Number(b.lng) : defaultCenter[1];

            return (
              <Marker 
                key={b.id} 
                position={[lat, lng]} 
                icon={redPinIcon}
                draggable={!isLocked}
                eventHandlers={{
                  dragend: (e) => handleMarkerDragEnd(b.id, e),
                  click: () => {
                    // ตรวจสอบความถูกต้องก่อนโฟกัสพิกัดหมุด
                    if (lat != null && lng != null) {
                      setMapCenter([lat, lng]);
                    }
                  }
                }}
              >
                <Popup>
                  <div style={mapStyles.popupBox}>
                    <h4 style={mapStyles.popupTitle}>{b.name || b.id}</h4>
                    
                    <div style={mapStyles.coordBadge}>
                      📍 {lat}, {lng}
                    </div>

                    <div style={mapStyles.popupDetail}>
                      <span>ห้องว่าง / ทั้งหมด:</span>
                      <strong style={{ color: colors.success }}> {b.available ?? 0} / {b.total ?? 0} ห้อง</strong>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <button 
                        style={mapStyles.popupBtn}
                        onClick={() => onSelectBuilding(b)}>
                        ดูรายละเอียดอาคาร
                      </button>
                      <button 
                        style={{ ...mapStyles.popupBtn, backgroundColor: '#ed6c02' }}
                        onClick={() => setEditingBuilding({ ...b })}>
                        ✏️ แก้ไขข้อมูลอาคาร
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {editingBuilding && (
        <div style={mapStyles.modalOverlay}>
          <div style={mapStyles.modalContent}>
            <h4 style={{ margin: '0 0 16px 0', color: colors.accentBrown }}>✏️ แก้ไขข้อมูลอาคาร</h4>
            <form onSubmit={handleSaveBuildingEdit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={mapStyles.label}>ชื่ออาคาร:</label>
                <input 
                  type="text" 
                  value={editingBuilding.name || ''} 
                  onChange={(e) => setEditingBuilding({ ...editingBuilding, name: e.target.value })}
                  style={mapStyles.input}
                  required
                />
              </div>
              <div>
                <label style={mapStyles.label}>จำนวนชั้น:</label>
                <input 
                  type="number" 
                  value={editingBuilding.floors || 0} 
                  onChange={(e) => setEditingBuilding({ ...editingBuilding, floors: parseInt(e.target.value) || 0 })}
                  style={mapStyles.input}
                  required
                />
              </div>
              <div>
                <label style={mapStyles.label}>ห้องว่างปัจจุบัน:</label>
                <input 
                  type="number" 
                  value={editingBuilding.available || 0} 
                  onChange={(e) => setEditingBuilding({ ...editingBuilding, available: parseInt(e.target.value) || 0 })}
                  style={mapStyles.input}
                  required
                />
              </div>
              <div>
                <label style={mapStyles.label}>จำนวนห้องทั้งหมด:</label>
                <input 
                  type="number" 
                  value={editingBuilding.total || 0} 
                  onChange={(e) => setEditingBuilding({ ...editingBuilding, total: parseInt(e.target.value) || 0 })}
                  style={mapStyles.input}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button type="submit" style={{ ...mapStyles.actionBtn, backgroundColor: colors.accentBrown, flex: 1 }}>
                  บันทึก
                </button>
                <button type="button" onClick={() => setEditingBuilding(null)} style={{ ...mapStyles.actionBtn, backgroundColor: '#757575', flex: 1 }}>
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

const mapStyles = {
  wrapper: {
    backgroundColor: colors.white,
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.06)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    height: 'calc(100vh - 180px)',
    position: 'relative',
  },
  headerBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '12px',
    borderBottom: '1px solid #EFEFEF',
  },
  actionBtn: {
    color: colors.white,
    border: 'none',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  mapContainer: {
    flex: 1,
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid #E0E0E0',
  },
  popupBox: {
    padding: '4px',
    minWidth: '190px',
  },
  popupTitle: {
    margin: '0 0 4px 0',
    fontSize: '15px',
    color: colors.accentBrown,
    fontWeight: 'bold',
  },
  coordBadge: {
    fontSize: '11px',
    color: '#666',
    backgroundColor: '#F0F0F0',
    padding: '2px 6px',
    borderRadius: '4px',
    display: 'inline-block',
    marginBottom: '8px',
  },
  popupDetail: {
    fontSize: '12.5px',
    marginBottom: '12px',
  },
  popupBtn: {
    width: '100%',
    padding: '8px 10px',
    backgroundColor: colors.headerBg,
    color: colors.white,
    border: 'none',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: '24px',
    borderRadius: '12px',
    width: '320px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
  },
  label: {
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#444',
    marginBottom: '4px',
    display: 'block',
  },
  input: {
    width: '100%',
    padding: '8px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '14px',
    boxSizing: 'border-box',
  }
};