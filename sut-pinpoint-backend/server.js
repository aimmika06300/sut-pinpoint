const express = require('express');
const cors = require('cors');
const db = require('./db'); // นำเข้าตัวเชื่อมต่อฐานข้อมูล MySQL
const app = express();

app.use(cors());
app.use(express.json());

// ==========================================
// 1. API จัดการข้อมูลอาคารเรียน (Buildings)
// ==========================================

// GET: ดึงรายการอาคารเรียนทั้งหมด
app.get('/api/buildings', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM buildings');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching buildings:', err.message);
    res.status(500).json({ error: 'Failed to fetch buildings' });
  }
});

// POST: เพิ่มอาคารเรียนใหม่ (Admin)
app.post('/api/buildings', async (req, res) => {
  const { name, floors, rooms_count, latitude, longitude } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO buildings (name, floors, rooms_count, latitude, longitude) VALUES (?, ?, ?, ?, ?)',
      [name, floors, rooms_count || 0, latitude || null, longitude || null]
    );
    res.status(201).json({ id: result.insertId, name, floors, rooms_count, latitude, longitude });
  } catch (err) {
    console.error('Error adding building:', err.message);
    res.status(500).json({ error: 'Failed to add building' });
  }
});

// ==========================================
// 2. API จัดการข้อมูลห้องเรียน (Classrooms)
// ==========================================

// GET: ดึงรายการห้องเรียนทั้งหมด (พร้อมตัวกรองอาคารและชั้น)
app.get('/api/rooms', async (req, res) => {
  const { buildingId, floor } = req.query;
  try {
    let sql = 'SELECT * FROM classrooms';
    const params = [];

    if (buildingId || floor) {
      sql += ' WHERE';
      if (buildingId) {
        sql += ' building_id = ?';
        params.push(buildingId);
      }
      if (floor) {
        if (buildingId) sql += ' AND';
        sql += ' floor = ?';
        params.push(floor);
      }
    }

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching rooms:', err.message);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// POST: เพิ่มห้องเรียนใหม่ (Admin)
app.post('/api/rooms', async (req, res) => {
  const { id, building_id, building_name, floor, type, name, status } = req.body;
  try {
    await db.query(
      'INSERT INTO classrooms (id, building_id, building_name, floor, type, name, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, building_id || null, building_name, floor, type || 'Lecture', name || '', status || 'Now']
    );
    res.status(201).json({ id, building_id, building_name, floor, type, name, status: status || 'Now' });
  } catch (err) {
    console.error('Error adding room:', err.message);
    res.status(500).json({ error: 'Failed to add room' });
  }
});

// DELETE: ลบห้องเรียน (Admin)
app.delete('/api/rooms/:id', async (req, res) => {
  const roomId = req.params.id;
  try {
    const [result] = await db.query('DELETE FROM classrooms WHERE id = ?', [roomId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json({ message: 'Deleted room successfully', id: roomId });
  } catch (err) {
    console.error('Error deleting room:', err.message);
    res.status(500).json({ error: 'Failed to delete room' });
  }
});

// ==========================================
// 3. API จัดการผู้ใช้งาน (Users)
// ==========================================

// GET: ดึงรายการผู้ใช้งานทั้งหมด (Admin)
app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, student_id, name, email, institute, club FROM users');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching users:', err.message);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// DELETE: ลบผู้ใช้งาน (Admin)
app.delete('/api/users/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'Deleted user successfully' });
  } catch (err) {
    console.error('Error deleting user:', err.message);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// ==========================================
// 4. API จัดการตารางเรียนส่วนตัว (Schedules - Mobile App)
// ==========================================

// GET: ดึงตารางเรียนของผู้ใช้ตาม user_id
app.get('/api/schedules/:userId', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT s.*, c.building_name, c.floor, c.name AS room_name 
       FROM schedules s 
       JOIN classrooms c ON s.classroom_id = c.id 
       WHERE s.user_id = ?`,
      [req.params.userId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching schedules:', err.message);
    res.status(500).json({ error: 'Failed to fetch schedules' });
  }
});

// POST: เพิ่มวิชาเรียนในตารางเรียน
app.post('/api/schedules', async (req, res) => {
  const { user_id, classroom_id, course_code, course_name, day_of_week, start_time, end_time } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO schedules (user_id, classroom_id, course_code, course_name, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [user_id, classroom_id, course_code, course_name, day_of_week, start_time, end_time]
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (err) {
    console.error('Error adding schedule:', err.message);
    res.status(500).json({ error: 'Failed to add schedule' });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`SUT Pinpoint Server running on port ${PORT}`);
});

