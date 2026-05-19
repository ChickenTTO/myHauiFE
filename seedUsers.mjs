import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA_URhx9CxrHXqzOSIgeCVKUNEV5qYNo_M",
  authDomain: "myhaui-erp.firebaseapp.com",
  projectId: "myhaui-erp",
  storageBucket: "myhaui-erp.firebasestorage.app",
  messagingSenderId: "300611600702",
  appId: "1:300611600702:web:d7d1acb5642027d81dec6f"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const usersToCreate = [
  { email: 'admin_test@myhaui.com', password: 'password123', name: 'Admin Test', role: 'SYSTEM_ADMIN' },
  { email: 'gvtest01@myhaui.com', password: 'password123', name: 'Giảng viên Test 1', role: 'TEACHER' },
  { email: 'svtest01@myhaui.com', password: 'password123', name: 'Sinh viên Test 1', role: 'STUDENT' },
  { email: 'faculty_test01@myhaui.com', password: 'password123', name: 'Giáo vụ Test 1', role: 'FACULTY_MANAGER' },
  { email: 'daotao_test01@myhaui.com', password: 'password123', name: 'Đào tạo Test 1', role: 'ACADEMIC_ADMIN' }
];

async function seed() {
  console.log("Bắt đầu tạo tài khoản hàng loạt...");
  let successCount = 0;
  
  for (const u of usersToCreate) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, u.email, u.password);
      const user = userCredential.user;
      
      await setDoc(doc(db, 'users', user.uid), {
        fullName: u.name,
        email: u.email,
        role: u.role,
        createdAt: new Date().toISOString()
      });
      console.log(`[OK] Đã tạo thành công: ${u.email} (${u.role})`);
      successCount++;
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
         console.log(`[SKIP] Tài khoản đã tồn tại: ${u.email}`);
      } else {
         console.error(`[LỖI] Không thể tạo ${u.email}:`, err.message);
      }
    }
  }
  
  console.log(`\nHoàn tất! Đã tạo thành công ${successCount}/${usersToCreate.length} tài khoản.`);
  process.exit(0);
}

seed();
