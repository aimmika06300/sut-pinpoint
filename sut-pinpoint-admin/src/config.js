export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// Helper Normalize Schema อาคารให้เป็นมาตรฐานเดียวกันทั้งระบบ
export const normalizeBuilding = (item) => ({
  id: item.id || item.docId || 'unknown',
  name: item.name || item.building_name || item.id || 'ไม่ระบุชื่ออาคาร',
  floors: Number(item.floors) || 0,
  total_rooms: Number(item.total_rooms ?? item.rooms_count ?? item.total ?? 0),
  available_rooms: Number(item.available_rooms ?? item.available ?? 0),
  lat: (item.lat != null && !isNaN(item.lat)) ? Number(item.lat) : 14.8770,
  lng: (item.lng != null && !isNaN(item.lng)) ? Number(item.lng) : 102.0185,
});

// Helper Normalize Schema ห้องเรียน
export const normalizeClassroom = (item) => ({
  id: item.id || item.room_number || item.name || 'unknown',
  building_name: item.building_name || item.building || item.building_id || '-',
  floor: String(item.floor || '1'),
  status: item.status || (item.available ? 'Open' : 'Close'),
  type: item.type || 'Lecture',
  capacity: Number(item.capacity || 40),
});