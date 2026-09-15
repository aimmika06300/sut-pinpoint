const express = require('express');
const cors = require('cors');
const db = require('./firebase');
const admin = require('firebase-admin'); // เติมจากโค้ด 1: เพิ่ม Firebase Admin SDK

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

// PUT: แก้ไขข้อมูลอาคาร (รองรับการลากหมุดเปลี่ยนพิกัด lat/lng และแก้รายละเอียดใน Modal)
app.put('/api/buildings/:id', async (req, res) => {
  const buildingId = req.params.id;
  const { name, floors, available, total, lat, lng } = req.body;

  try {
    const buildingRef = db.collection('buildings').doc(buildingId);
    const buildingDoc = await buildingRef.get();

    if (!buildingDoc.exists) {
      return res.status(404).json({ error: 'Building not found' });
    }

    // สร้าง object ข้อมูลที่จะอัปเดตเฉพาะ field ที่ส่งมา
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (floors !== undefined) updateData.floors = Number(floors);
    if (available !== undefined) updateData.available = Number(available);
    if (total !== undefined) updateData.total = Number(total);
    if (lat !== undefined) updateData.lat = Number(lat);
    if (lng !== undefined) updateData.lng = Number(lng);

    await buildingRef.update(updateData);

    res.json({ message: 'Updated building successfully', data: updateData });
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

// เติมจากโค้ด 1: GET: ดึงข้อมูลผู้ใช้รายบุคคล (รองรับทั้งตาม doc id และ studentId)
app.get('/api/users/:id', async (req, res) => {
  try {
    const doc = await db.collection('users').doc(req.params.id).get();
    if (doc.exists) {
      return res.json({ id: doc.id, ...doc.data() });
    }

    const querySnap = await db.collection('users').where('studentId', '==', req.params.id).limit(1).get();
    if (!querySnap.empty) {
      return res.json({ id: querySnap.docs[0].id, ...querySnap.docs[0].data() });
    }

    res.status(404).json({ message: 'User not found' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// เติมจากโค้ด 1: POST: บันทึก/อัปเดตข้อมูลผู้ใช้ (Name, Student ID, Email, Institute, Club)
app.post('/api/users', async (req, res) => {
  const { studentId, name, institute, faculty, club, uid, email } = req.body;
  const docId = studentId || uid;

  if (!docId) {
    return res.status(400).json({ error: 'studentId or uid is required' });
  }

  try {
    await db.collection('users').doc(docId).set({
      studentId: studentId || docId,
      name: name || studentId || docId,
      email: email || '',
      institute: institute || faculty || 'สำนักวิชาวิศวกรรมศาสตร์',
      faculty: faculty || institute || 'สำนักวิชาวิศวกรรมศาสตร์',
      club: club || 'ชมรมพัฒนาซอฟต์แวร์',
      uid: uid || '',
      updatedAt: new Date().toISOString()
    }, { merge: true });

    res.status(200).json({ message: 'User synced successfully', id: docId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// เติมจากโค้ด 1: DELETE: ลบผู้ใช้ (ลบทั้งใน Firestore และ Firebase Authentication)
app.delete('/api/users/:id', async (req, res) => {
  const targetId = req.params.id;
  try {
    let uidsToDelete = [];
    let emailsToDelete = [];

    // 1. ตรวจสอบและดึงข้อมูลจาก Document ID ตรงๆ
    const directDoc = await db.collection('users').doc(targetId).get();
    if (directDoc.exists) {
      const data = directDoc.data();
      if (data.uid) uidsToDelete.push(data.uid);
      if (data.email) emailsToDelete.push(data.email);
      await db.collection('users').doc(targetId).delete();
    }

    // 2. ค้นหาเอกสารที่ studentId ตรงกัน (กรณี ID เอกสารเป็นอย่างอื่น)
    const querySnap = await db.collection('users').where('studentId', '==', targetId).get();
    for (const doc of querySnap.docs) {
      const data = doc.data();
      if (data.uid) uidsToDelete.push(data.uid);
      if (data.email) emailsToDelete.push(data.email);
      await doc.ref.delete();
    }

    // 3. ลบบัญชีใน Firebase Authentication ผ่าน UID
    for (const u of uidsToDelete) {
      try {
        await admin.auth().deleteUser(u);
        console.log(`Deleted Auth user by UID: ${u}`);
      } catch (authErr) {
        console.log(`Auth delete by UID skipped: ${authErr.message}`);
      }
    }

    // 4. ลบบัญชีใน Firebase Authentication ผ่าน Email (ป้องกันกรณีไม่มี UID)
    for (const em of emailsToDelete) {
      try {
        const userRecord = await admin.auth().getUserByEmail(em);
        if (userRecord && userRecord.uid) {
          await admin.auth().deleteUser(userRecord.uid);
          console.log(`Deleted Auth user by Email: ${em} (${userRecord.uid})`);
        }
      } catch (emErr) {
        console.log(`Auth delete by Email skipped: ${emErr.message}`);
      }
    }

    res.json({ message: 'Deleted user from DB and Auth successfully' });
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