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

    const buildings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(buildings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: เพิ่มอาคารใหม่
app.post('/api/buildings', async (req, res) => {
  const { name, floors, rooms_count } = req.body;

  // ตรวจสอบชื่ออาคาร
  if (!name) {
    return res.status(400).json({
      error: 'Building name is required'
    });
  }

  // ตรวจสอบจำนวนชั้น
  const floorsNumber = Number(floors);

  if (!floors || Number.isNaN(floorsNumber) || floorsNumber <= 0) {
    return res.status(400).json({
      error: 'Floors must be a number greater than 0'
    });
  }

  try {
    const docRef = await db.collection('buildings').add({
      name,
      floors: floorsNumber,
      rooms_count: Number(rooms_count) || 0
    });

    res.status(201).json({
      id: docRef.id,
      name,
      floors: floorsNumber,
      rooms_count: Number(rooms_count) || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE: ลบอาคาร พร้อมลบห้องที่ผูกกับอาคารนั้น
app.delete('/api/buildings/:id', async (req, res) => {
  const buildingId = req.params.id;

  try {
    const roomsSnapshot = await db
      .collection('classrooms')
      .where('building_id', '==', buildingId)
      .get();

    const batch = db.batch();

    roomsSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    await db.collection('buildings').doc(buildingId).delete();

    res.json({
      message: 'Deleted building successfully'
    });
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

    const rooms = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: เพิ่มห้องเรียนใหม่
app.post('/api/rooms', async (req, res) => {
  const {
    id,
    building_id,
    building_name,
    floor,
    type,
    status
  } = req.body;

  // ตรวจสอบ Room ID
  if (!id) {
    return res.status(400).json({
      error: 'Room ID is required'
    });
  }

  // ตรวจสอบชั้น
  const floorNumber = Number(floor);

  if (
    floor === undefined ||
    floor === null ||
    floor === '' ||
    Number.isNaN(floorNumber) ||
    floorNumber < 0
  ) {
    return res.status(400).json({
      error: 'Floor must be a valid number'
    });
  }

  try {
    await db.collection('classrooms').doc(id).set({
      building_id: building_id || '',
      building_name: building_name || '',
      floor: floorNumber,
      type: type || 'Lecture',
      status: status || 'Open'
    });

    res.status(201).json({
      id,
      building_id: building_id || '',
      building_name: building_name || '',
      floor: floorNumber,
      type: type || 'Lecture',
      status: status || 'Open'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT: แก้ไขข้อมูลห้องเรียน
app.put('/api/rooms/:id', async (req, res) => {
  const roomId = req.params.id;

  const {
    id: newId,
    building_id,
    building_name,
    floor,
    type,
    status
  } = req.body;

  // ตรวจสอบชั้น
  const floorNumber = Number(floor);

  if (
    floor === undefined ||
    floor === null ||
    floor === '' ||
    Number.isNaN(floorNumber) ||
    floorNumber < 0
  ) {
    return res.status(400).json({
      error: 'Floor must be a valid number'
    });
  }

  try {
    const roomData = {
      building_id: building_id || '',
      building_name: building_name || '',
      floor: floorNumber,
      type: type || 'Lecture',
      status: status || 'Open'
    };

    // กรณีเปลี่ยน Room ID
    if (newId && newId !== roomId) {
      // ตรวจสอบว่า ID ใหม่มีอยู่แล้วหรือไม่
      const newRoom = await db
        .collection('classrooms')
        .doc(newId)
        .get();

      if (newRoom.exists) {
        return res.status(409).json({
          error: 'Room ID already exists'
        });
      }

      await db
        .collection('classrooms')
        .doc(newId)
        .set(roomData);

      await db
        .collection('classrooms')
        .doc(roomId)
        .delete();
    } else {
      // แก้ไขข้อมูลห้องเดิม
      await db
        .collection('classrooms')
        .doc(roomId)
        .update(roomData);
    }

    res.json({
      message: 'Updated room successfully'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE: ลบห้องเรียน
app.delete('/api/rooms/:id', async (req, res) => {
  const roomId = req.params.id;

  try {
    const room = await db
      .collection('classrooms')
      .doc(roomId)
      .get();

    if (!room.exists) {
      return res.status(404).json({
        error: 'Room not found'
      });
    }

    await db
      .collection('classrooms')
      .doc(roomId)
      .delete();

    res.json({
      message: 'Deleted room successfully'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. API จัดการผู้ใช้งาน (Users)
// ==========================================

// GET: ดึงรายการผู้ใช้งานทั้งหมด
app.get('/api/users', async (req, res) => {
  try {
    const snapshot = await db.collection('users').get();

    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE: ลบผู้ใช้งาน
app.delete('/api/users/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await db
      .collection('users')
      .doc(userId)
      .get();

    if (!user.exists) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    await db
      .collection('users')
      .doc(userId)
      .delete();

    res.json({
      message: 'Deleted user successfully'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// Start Server
// ==========================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `SUT Pinpoint Server (Firebase Firestore) running on port ${PORT}`
  );
});