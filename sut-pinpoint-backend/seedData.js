const db = require('./firebase');

const initialBuildings = [
  { id: 'bldg_1', name: 'อาคารเรียนรวม 1', floors: 4, rooms_count: 35 },
  { id: 'bldg_2', name: 'อาคารเรียนรวม 2', floors: 4, rooms_count: 18 },
  { id: 'bldg_3', name: 'อาคารเรียนรวม 3', floors: 4, rooms_count: 16 }
];

const initialRooms = [
  // อาคารเรียนรวม 1 ชั้น 1
  { id: 'B1113', building_id: 'bldg_1', building_name: 'อาคารเรียนรวม 1', floor: 1, type: 'Lecture', status: 'Open' },
  { id: 'B1115', building_id: 'bldg_1', building_name: 'อาคารเรียนรวม 1', floor: 1, type: 'Lecture', status: 'Open' },
  { id: 'B1117', building_id: 'bldg_1', building_name: 'อาคารเรียนรวม 1', floor: 1, type: 'Lecture', status: 'Open' },
  { id: 'B1119', building_id: 'bldg_1', building_name: 'อาคารเรียนรวม 1', floor: 1, type: 'Lecture', status: 'Open' },
  { id: 'Seminar 1', building_id: 'bldg_1', building_name: 'อาคารเรียนรวม 1', floor: 1, type: 'Lecture', status: 'Open' },

  // อาคารเรียนรวม 1 ชั้น 2
  { id: 'B1203', building_id: 'bldg_1', building_name: 'อาคารเรียนรวม 1', floor: 2, type: 'Lecture', status: 'Open' },
  { id: 'LAB COM 1', building_id: 'bldg_1', building_name: 'อาคารเรียนรวม 1', floor: 2, type: 'Lab', status: 'Open' },
  { id: 'LAB COM 2', building_id: 'bldg_1', building_name: 'อาคารเรียนรวม 1', floor: 2, type: 'Lab', status: 'Open' },

  // อาคารเรียนรวม 2 ชั้น 1
  { id: 'B2101', building_id: 'bldg_2', building_name: 'อาคารเรียนรวม 2', floor: 1, type: 'Lecture', status: 'Open' },
  { id: 'B2102', building_id: 'bldg_2', building_name: 'อาคารเรียนรวม 2', floor: 1, type: 'Lecture', status: 'Open' },

  // อาคารเรียนรวม 3 ชั้น 1
  { id: 'B3101', building_id: 'bldg_3', building_name: 'อาคารเรียนรวม 3', floor: 1, type: 'Lecture', status: 'Open' },
  { id: 'B3102', building_id: 'bldg_3', building_name: 'อาคารเรียนรวม 3', floor: 1, type: 'Lecture', status: 'Open' }
];

async function seed() {
  console.log('⏳ กำลังนำเข้าข้อมูลลง Firebase Firestore...');
  const batch = db.batch();

  // สร้าง Buildings
  initialBuildings.forEach(b => {
    const docRef = db.collection('buildings').doc(b.id);
    batch.set(docRef, { name: b.name, floors: b.floors, rooms_count: b.rooms_count });
  });

  // สร้าง Classrooms
  initialRooms.forEach(r => {
    const docRef = db.collection('classrooms').doc(r.id);
    batch.set(docRef, {
      building_id: r.building_id,
      building_name: r.building_name,
      floor: r.floor,
      type: r.type,
      status: r.status
    });
  });

  await batch.commit();
  console.log('✅ เพิ่มข้อมูลเริ่มต้นลง Firestore เรียบร้อยแล้ว!');
  process.exit();
}

seed();