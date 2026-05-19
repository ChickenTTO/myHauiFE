import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, updateDoc } from "firebase/firestore";

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

async function updateRole() {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, "test01@myhaui.com", "123456");
    const user = userCredential.user;
    
    await updateDoc(doc(db, 'users', user.uid), {
      role: "TESTER_ADMIN"
    });
    console.log("SUCCESS: User test01@myhaui.com role updated to TESTER_ADMIN");
    process.exit(0);
  } catch(e) {
    console.error("ERROR:", e.message);
    process.exit(1);
  }
}

updateRole();
