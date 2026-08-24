const express = require('express');
const cors = require('cors');
const db = require('./firebase');

const app = express();
app.use(cors());
app.use(express.json());

// ==========================================
// 1. API จัดการอาคาร (Buildings)
// ==========================================

// GET: ดึงรายการอาคารทั้งหมด
app.get('/api/buildings', async (req, res) => {
  try {
    const snapshot = await db.collection('buildings').get();
    const buildings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(buildings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: เพิ่มอาคารใหม่
app.post('/api/buildings', async (req, res) => {
  const { name, floors, rooms_count } = req.body;
  try {
    const docRef = await db.collection('buildings').add({
      name,
      floors: Number(floors),
      rooms_count: Number(rooms_count) || 0
    });
    res.status(201).json({ id: docRef.id, name, floors, rooms_count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE: ลบอาคาร (พร้อมลบห้องที่ผูกกับอาคารนั้น)
app.delete('/api/buildings/:id', async (req, res) => {
  const buildingId = req.params.id;
  try {
    const roomsSnapshot = await db.collection('classrooms').where('building_id', '==', buildingId).get();
    const batch = db.batch();
    roomsSnapshot.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    await db.collection('buildings').doc(buildingId).delete();
    res.json({ message: 'Deleted building successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. API จัดการห้องเรียน (Classrooms)
// ==========================================

// GET: ดึงรายการห้องเรียนทั้งหมด
app.get('/api/rooms', async (req, res) => {
  try {
    const snapshot = await db.collection('classrooms').get();
    const rooms = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: เพิ่มห้องเรียนใหม่
app.post('/api/rooms', async (req, res) => {
  const { id, building_id, building_name, floor, type, status } = req.body;
  try {
    await db.collection('classrooms').doc(id).set({
      building_id: building_id || '',
      building_name: building_name || '',
      floor: Number(floor),
      type: type || 'Lecture',
      status: status || 'Open'
    });
    res.status(201).json({ id, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT: แก้ไขข้อมูลห้องเรียน (ดินสอ)
app.put('/api/rooms/:id', async (req, res) => {
  const roomId = req.params.id;
  const { id: newId, building_id, building_name, floor, type, status } = req.body;

  try {
    if (newId && newId !== roomId) {
      await db.collection('classrooms').doc(newId).set({
        building_id,
        building_name,
        floor: Number(floor),
        type,
        status
      });
      await db.collection('classrooms').doc(roomId).delete();
    } else {
      await db.collection('classrooms').doc(roomId).update({
        building_id,
        building_name,
        floor: Number(floor),
        type,
        status
      });
    }
    res.json({ message: 'Updated room successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE: ลบห้องเรียน
app.delete('/api/rooms/:id', async (req, res) => {
  try {
    await db.collection('classrooms').doc(req.params.id).delete();
    res.json({ message: 'Deleted room successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. API จัดการผู้ใช้งาน (Users)
// ==========================================

app.get('/api/users', async (req, res) => {
  try {
    const snapshot = await db.collection('users').get();
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    await db.collection('users').doc(req.params.id).delete();
    res.json({ message: 'Deleted user successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`SUT Pinpoint Server (Firebase Firestore) running on port ${PORT}`);
});