import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, MapPin, Edit3, PlusCircle, Building, Layers, DoorOpen, X } from 'lucide-react';
import { colors } from '../styles/themeStyles';
import { API_BASE_URL, normalizeBuilding } from '../config';

import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

const createCustomIcon = (color = '#8b0f0f') => L.divIcon({
  className: 'custom-pin-icon',
  html: `<div style="
    background-color: ${color};
    width: 30px;
    height: 30px;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    border: 2px solid #FFFFFF;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
  "><div style="width: 10px; height: 10px; background-color: #FFF; border-radius: 50%;"></div></div>`,
  iconSize: [30, 42],
  iconAnchor: [15, 42],
  popupAnchor: [0, -38],
});

function ChangeView({ center, zoom }) {
  const map = useMap();
  if (Array.isArray(center) && center[0] != null && center[1] != null && !isNaN(center[0]) && !isNaN(center[1])) {
    map.setView(center, zoom);
  }
  return null;
}

function MapClickHandler({ isAddingMode, onMapClick }) {
  useMapEvents({
    click(e) {
      if (isAddingMode) {
        onMapClick(e.latlng);
      }
    },
  });
  return null;
}

export default function MapView({ addToast }) {
  const mapRef = useRef(null);
  
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [selectedLatLng, setSelectedLatLng] = useState(null);
  const [newBuildingName, setNewBuildingName] = useState('');
  const [floors, setFloors] = useState('');

  const defaultCenter = [14.8770, 102.0185];
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [zoomLevel, setZoomLevel] = useState(16.5);
  
  const [isLocked, setIsLocked] = useState(true);
  const [editingBuilding, setEditingBuilding] = useState(null);
  
  // 🟢 State สำหรับเปิด Modal รายละเอียดอาคาร
  const [viewingBuilding, setViewingBuilding] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [buildingsOnMap, setBuildingsOnMap] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBuildings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/buildings`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      const normalizedData = (Array.isArray(data) ? data : []).map(normalizeBuilding);
      setBuildingsOnMap(normalizedData);
    } catch (error) {
      console.error("Error fetching buildings:", error);
      if (addToast) addToast('ไม่สามารถดึงข้อมูลอาคารบนแผนที่ได้', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuildings();
  }, []);

  const handleSaveBuildingToFirebase = async (e) => {
    e.preventDefault();
    if (!selectedLatLng || !newBuildingName) return;

    try {
      await addDoc(collection(db, 'buildings'), {
        name: newBuildingName,
        floors: parseInt(floors) || 1,
        lat: selectedLatLng.lat,
        lng: selectedLatLng.lng,
        createdAt: new Date()
      });
      if (addToast) addToast('เพิ่มหมุดอาคารเรียบร้อยแล้ว', 'success');
      setSelectedLatLng(null);
      setNewBuildingName('');
      setFloors('');
      setIsAddingMode(false);
      fetchBuildings();
    } catch (err) {
      console.error(err);
      if (addToast) addToast('เกิดข้อผิดพลาดในการบันทึกหมุด', 'error');
    }
  };

  const handleSearchBuilding = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const found = buildingsOnMap.find(b => 
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      b.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (found) {
      setMapCenter([found.lat, found.lng]);
      setZoomLevel(18);
      if (addToast) addToast(`พิกัด: ${found.name}`, 'info');
    } else {
      if (addToast) addToast('ไม่พบอาคารที่คุณค้นหา', 'error');
    }
  };

  const handleMarkerDragEnd = async (docId, event) => {
    const { lat, lng } = event.target.getLatLng();
    const newLat = parseFloat(lat.toFixed(6));
    const newLng = parseFloat(lng.toFixed(6));

    try {
      const res = await fetch(`${API_BASE_URL}/buildings/${docId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat: newLat, lng: newLng }),
      });

      if (!res.ok) throw new Error('Update failed');
      if (addToast) addToast('บันทึกพิกัดใหม่สำเร็จ', 'success');
      fetchBuildings();
    } catch (error) {
      if (addToast) addToast('ไม่สามารถบันทึกตำแหน่งใหม่ได้', 'error');
    }
  };

  const handleSaveBuildingEdit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/buildings/${editingBuilding.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingBuilding.name,
          floors: Number(editingBuilding.floors),
          available_rooms: Number(editingBuilding.available_rooms),
          total_rooms: Number(editingBuilding.total_rooms),
        }),
      });

      if (!res.ok) throw new Error('Save failed');
      if (addToast) addToast('อัปเดตข้อมูลอาคารสำเร็จ', 'success');
      setEditingBuilding(null);
      fetchBuildings();
    } catch (error) {
      if (addToast) addToast('เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: colors.accentBrown, fontSize: '16px' }}>
        ⏳ กำลังโหลดแผนที่และพิกัดอาคาร...
      </div>
    );
  }

  return (
    <div style={mapStyles.wrapper}>
      <div style={mapStyles.headerBar}>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, color: colors.accentBrown }}>Interactive Campus Map (SUT Pinpoint)</h3>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: colors.subText }}>
            {isAddingMode 
              ? '📍 กำลังอยู่ในโหมดเพิ่มหมุด: คลิกตำแหน่งบนแผนที่เพื่อเลือกพิกัด' 
              : isLocked 
                ? '🔒 ล็อกหมุดตำแหน่งแล้ว' 
                : '🔓 ปลดล็อก: สามารถลากย้ายหมุดเพื่อปรับพิกัดได้'}
          </p>
        </div>

        <form onSubmit={handleSearchBuilding} style={mapStyles.searchBox}>
          <input 
            type="text" 
            placeholder="ค้นหาอาคารบนแผนที่..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={mapStyles.searchInput}
          />
          <button type="submit" style={mapStyles.searchBtn}>
            <Search size={16} />
          </button>
        </form>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={() => {
              setIsAddingMode(!isAddingMode);
              setSelectedLatLng(null);
            }}
            style={{
              ...mapStyles.actionBtn,
              backgroundColor: isAddingMode ? colors.danger : colors.accentBrown,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <PlusCircle size={15} />
            {isAddingMode ? 'ยกเลิกเพิ่มหมุด' : 'เพิ่มหมุดอาคาร'}
          </button>

          <button 
            type="button"
            onClick={() => setIsLocked(!isLocked)}
            style={{
              ...mapStyles.actionBtn,
              backgroundColor: isLocked ? '#2e7d32' : colors.danger,
            }}>
            {isLocked ? '🔒 ล็อกหมุด' : '🔓 ปลดล็อกหมุด'}
          </button>

          <button 
            type="button"
            onClick={() => { setMapCenter(defaultCenter); setZoomLevel(16.5); setSearchQuery(''); }}
            style={{ ...mapStyles.actionBtn, backgroundColor: colors.accentBrown }}>
            Reset Focus
          </button>
        </div>
      </div>

      {isAddingMode && (
        <div style={mapStyles.addingBanner}>
          👉 คลิกบนแผนที่ตรงตำแหน่งที่ต้องการปักหมุดอาคารใหม่
        </div>
      )}

      <div style={mapStyles.mapContainer}>
        <MapContainer center={mapCenter} zoom={zoomLevel} scrollWheelZoom={true} style={{ width: '100%', height: '100%' }}>
          <ChangeView center={mapCenter} zoom={zoomLevel} />
          
          <MapClickHandler isAddingMode={isAddingMode} onMapClick={(latlng) => setSelectedLatLng(latlng)} />

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {buildingsOnMap.map((b) => (
            <Marker 
              key={b.id} 
              position={[b.lat, b.lng]} 
              icon={createCustomIcon(colors.primary)}
              draggable={!isLocked}
              eventHandlers={{
                dragend: (e) => handleMarkerDragEnd(b.id, e),
                click: () => setMapCenter([b.lat, b.lng])
              }}
            >
              <Popup>
                <div style={mapStyles.popupBox}>
                  <h4 style={mapStyles.popupTitle}>{b.name}</h4>
                  
                  <div style={mapStyles.coordBadge}>
                    <MapPin size={12} /> {b.lat}, {b.lng}
                  </div>

                  <div style={mapStyles.popupDetail}>
                    <span>ห้องว่าง / ทั้งหมด:</span>
                    <strong style={{ color: colors.success }}> {b.available_rooms} / {b.total_rooms} ห้อง</strong>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {/* 🟢 เมื่อกดดูรายละเอียด ให้เซ็ต viewingBuilding เพื่อเปิด Popup Modal */}
                    <button 
                      style={mapStyles.popupBtn}
                      onClick={() => setViewingBuilding(b)}>
                      ดูรายละเอียดอาคาร
                    </button>
                    <button 
                      style={{ ...mapStyles.popupBtn, backgroundColor: colors.accentBrown }}
                      onClick={() => setEditingBuilding({ ...b })}>
                      <Edit3 size={13} style={{ marginRight: '4px' }} /> แก้ไขข้อมูลอาคาร
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {selectedLatLng && (
            <Marker 
              position={[selectedLatLng.lat, selectedLatLng.lng]} 
              icon={createCustomIcon('#1976d2')}
            >
              <Popup>📌 ตำแหน่งหมุดใหม่ที่เลือก</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {/* 🟢 Popup Modal แสดงรายละเอียดอาคาร */}
      {viewingBuilding && (
        <div style={mapStyles.modalOverlay}>
          <div style={{ ...mapStyles.modalContent, width: '360px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, color: colors.accentBrown, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building size={20} /> รายละเอียดอาคาร
              </h3>
              <button 
                onClick={() => setViewingBuilding(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <strong>อาคาร:</strong> {viewingBuilding.name}
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={16} color="#666" />
                <strong>จำนวนชั้น:</strong> {viewingBuilding.floors || 0} ชั้น
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <DoorOpen size={16} color="#666" />
                <strong>ห้องว่างปัจจุบัน:</strong> 
                <span style={{ color: colors.success, fontWeight: 'bold' }}>
                  {viewingBuilding.available_rooms || 0} ห้อง
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <DoorOpen size={16} color="#666" />
                <strong>จำนวนห้องทั้งหมด:</strong> {viewingBuilding.total_rooms || 0} ห้อง
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#777', marginTop: '6px' }}>
                <MapPin size={14} />
                <span>พิกัด: {viewingBuilding.lat}, {viewingBuilding.lng}</span>
              </div>
            </div>

            <button 
              onClick={() => setViewingBuilding(null)}
              style={{
                width: '100%',
                marginTop: '20px',
                padding: '10px',
                backgroundColor: colors.accentBrown,
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      )}

      {/* Modal เพิ่มหมุดใหม่ */}
      {selectedLatLng && (
        <div style={mapStyles.modalOverlay}>
          <div style={mapStyles.modalContent}>
            <h4 style={{ margin: '0 0 16px 0', color: colors.accentBrown }}>📍 เพิ่มหมุดอาคารใหม่</h4>
            <form onSubmit={handleSaveBuildingToFirebase} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={mapStyles.label}>ชื่ออาคาร:</label>
                <input 
                  type="text" 
                  placeholder="เช่น อาคารบรรสาร 1"
                  value={newBuildingName} 
                  onChange={(e) => setNewBuildingName(e.target.value)}
                  style={mapStyles.input}
                  required
                />
              </div>
              <div>
                <label style={mapStyles.label}>จำนวนชั้น:</label>
                <input 
                  type="number" 
                  placeholder="เช่น 4"
                  value={floors} 
                  onChange={(e) => setFloors(e.target.value)}
                  style={mapStyles.input}
                  required
                />
              </div>
              <div>
                <label style={mapStyles.label}>พิกัดที่เลือก:</label>
                <div style={{ fontSize: '12px', color: '#666', backgroundColor: '#F5F5F5', padding: '6px 8px', borderRadius: '4px' }}>
                  Lat: {selectedLatLng.lat.toFixed(6)}, Lng: {selectedLatLng.lng.toFixed(6)}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button type="submit" style={{ ...mapStyles.actionBtn, backgroundColor: colors.accentBrown, flex: 1 }}>
                  บันทึกหมุด
                </button>
                <button type="button" onClick={() => setSelectedLatLng(null)} style={{ ...mapStyles.actionBtn, backgroundColor: '#757575', flex: 1 }}>
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal แก้ไขข้อมูลอาคาร */}
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
                  value={editingBuilding.available_rooms || 0} 
                  onChange={(e) => setEditingBuilding({ ...editingBuilding, available_rooms: parseInt(e.target.value) || 0 })}
                  style={mapStyles.input}
                  required
                />
              </div>
              <div>
                <label style={mapStyles.label}>จำนวนห้องทั้งหมด:</label>
                <input 
                  type="number" 
                  value={editingBuilding.total_rooms || 0} 
                  onChange={(e) => setEditingBuilding({ ...editingBuilding, total_rooms: parseInt(e.target.value) || 0 })}
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
    gap: '16px',
  },
  addingBanner: {
    backgroundColor: colors.accentBrown || '#5A3825',
    color: '#fff',
    padding: '10px',
    borderRadius: '8px',
    textAlign: 'center',
    fontSize: '13.5px',
    fontWeight: 'bold',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #CCC',
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: colors.white,
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    padding: '8px 12px',
    fontSize: '13px',
    width: '180px',
  },
  searchBtn: {
    backgroundColor: colors.primary,
    color: colors.white,
    border: 'none',
    padding: '8px 12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
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
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    marginBottom: '8px',
  },
  popupDetail: {
    fontSize: '12.5px',
    marginBottom: '12px',
  },
  popupBtn: {
    width: '100%',
    padding: '8px 10px',
    backgroundColor: colors.primary,
    color: colors.white,
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: '24px',
    borderRadius: '12px',
    width: '320px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
  },
  label: { fontSize: '13px', fontWeight: 'bold', color: '#444', marginBottom: '4px', display: 'block' },
  input: { width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '14px', boxSizing: 'border-box' }
};