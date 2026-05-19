import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA_URhx9CxrHXqzOSIgeCVKUNEV5qYNo_M",
  authDomain: "myhaui-erp.firebaseapp.com",
  projectId: "myhaui-erp",
  storageBucket: "myhaui-erp.firebasestorage.app",
  messagingSenderId: "300611600702",
  appId: "1:300611600702:web:d7d1acb5642027d81dec6f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seed() {
  try {
    await setDoc(doc(db, "users", "gv_tudo"), {
      email: "gv_tudo@myhaui.com",
      fullName: "Giảng viên Tự do (Hệ thống)",
      role: "TEACHER",
      status: "APPROVED"
    });
    console.log("Seeded gv_tudo successfully!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
