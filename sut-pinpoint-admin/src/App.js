import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Edit, Trash2, Plus, Building, DoorOpen } from 'lucide-react';

function App() {
  const [rooms, setRooms] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [newRoom, setNewRoom] = useState({ id: '', buildingId: '1', buildingName: 'อาคารรัฐสีมาคุณากร', floor: '1', type: 'Lecture', name: '', status: 'Now' });
  const [showModal, setShowModal] = useState(false);

  // ดึงข้อมูลจาก Backend API
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const resRooms = await axios.get('http://localhost:5000/api/rooms');
      const resBuildings = await axios.get('http://localhost:5000/api/buildings');
      setRooms(resRooms.data);
      setBuildings(resBuildings.data);
    } catch (err) {
      console.error('Error connecting to backend:', err);
    }
  };

  // ลบห้องเรียน
  const handleDelete = async (id) => {
    if (window.confirm(`คุณต้องการลบห้องเรียน ${id} ใช่หรือไม่?`)) {
      try {
        await axios.delete(`http://localhost:5000/api/rooms/${id}`);
        fetchData();
      } catch (err) {
        alert('เกิดข้อผิดพลาดในการลบห้องเรียน');
      }
    }
  };

  // เพิ่มห้องเรียนใหม่
  const handleAddRoom = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/rooms', newRoom);
      setShowModal(false);
      setNewRoom({ id: '', buildingId: '1', buildingName: 'อาคารรัฐสีมาคุณากร', floor: '1', type: 'Lecture', name: '', status: 'Now' });
      fetchData();
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการเพิ่มห้องเรียน');
    }
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#fffbe1', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* Header Bar */}
      <header style={{ backgroundColor: '#f97316', color: 'white', padding: '16px 24px', borderRadius: '8px 8px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>SUT Pinpoint - Admin Dashboard</h1>
        <span>Admin Panel</span>
      </header>

      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '0 0 8px 8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        {/* Top Control Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px' }}>
              <Building size={18} />
              <span>อาคารทั้งหมด: {buildings.length}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px' }}>
              <DoorOpen size={18} />
              <span>ห้องเรียนทั้งหมด: {rooms.length}</span>
            </div>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            style={{ backgroundColor: '#78350f', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}
          >
            <Plus size={18} /> Add New Room (+)
          </button>
        </div>

        {/* Data Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#451a03', color: 'white' }}>
              <th style={{ padding: '12px' }}>Room Code</th>
              <th style={{ padding: '12px' }}>Room Name</th>
              <th style={{ padding: '12px' }}>Building</th>
              <th style={{ padding: '12px' }}>Floor</th>
              <th style={{ padding: '12px' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>{room.id}</td>
                <td style={{ padding: '12px' }}>{room.name || '-'}</td>
                <td style={{ padding: '12px' }}>{room.buildingName}</td>
                <td style={{ padding: '12px' }}>Floor {room.floor}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ color: '#16a34a', fontWeight: 'bold' }}>● {room.status}</span>
                </td>
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  <button onClick={() => handleDelete(room.id)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', marginLeft: '8px' }}>
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Popup Form สำหรับเพิ่มห้องเรียน */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <form onSubmit={handleAddRoom} style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', width: '400px' }}>
            <h3 style={{ marginTop: 0 }}>Add New Room</h3>
            <div style={{ marginBottom: '12px' }}>
              <label>Room ID (เช่น B6107-C):</label>
              <input required style={{ width: '100%', padding: '8px', marginTop: '4px' }} value={newRoom.id} onChange={e => setNewRoom({...newRoom, id: e.target.value})} />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label>Room Name (เช่น Computer Lab):</label>
              <input style={{ width: '100%', padding: '8px', marginTop: '4px' }} value={newRoom.name} onChange={e => setNewRoom({...newRoom, name: e.target.value})} />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label>Floor:</label>
              <input type="number" required style={{ width: '100%', padding: '8px', marginTop: '4px' }} value={newRoom.floor} onChange={e => setNewRoom({...newRoom, floor: e.target.value})} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button type="button" onClick={() => setShowModal(false)} style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #ccc' }}>Cancel</button>
              <button type="submit" style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', backgroundColor: '#f97316', color: 'white' }}>Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;