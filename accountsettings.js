import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { 
  getAuth, 
  onAuthStateChanged, 
  updateEmail, 
  updatePassword, 
  sendEmailVerification, 
  signOut 
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteField 
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


const firebaseConfig = {
    apiKey: "AIzaSyDw1ibYg2xGcbF1azF09JUSYMnfhQDySHg",
    authDomain: "ardacelikkapi-adcfb.firebaseapp.com",
    projectId: "ardacelikkapi-adcfb",
    storageBucket: "ardacelikkapi-adcfb.firebasestorage.app",
    messagingSenderId: "436173086063",
    appId: "1:436173086063:web:45b125b911b4a168a8dc9a",
    measurementId: "G-YRFLQJW6EP"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const updateBtn = document.getElementById("updateBtn");
const statusMsg = document.getElementById("statusMsg");
const usernameDisplay = document.getElementById("usernameDisplay");

onAuthStateChanged(auth, async (user) => {
    if(!user){
        window.location.href = "index.html"; 
        return;
    }

    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if(docSnap.exists()){
        const data = docSnap.data();

        // Kullanıcının mevcut bilgilerini inputlara doldur
        usernameInput.value = data.username || "";
        emailInput.value = user.email || "";
        usernameDisplay.innerText = data.username || "Kullanıcı";

        // Eğer email onaylandıysa ve bekleyen değişiklik varsa uygula
        await user.reload();
        if(user.emailVerified && data.pendingChanges){
            const changes = data.pendingChanges;

            if(changes.username){
                await updateDoc(docRef, { username: changes.username });
                usernameDisplay.innerText = changes.username;
            }
            if(changes.email && changes.email !== user.email){
                await updateEmail(user, changes.email);
            }
            if(changes.password){
                await updatePassword(user, changes.password);
            }

            await updateDoc(docRef, { pendingChanges: deleteField() });

            statusMsg.style.color = "green";
            statusMsg.innerText = "Değişiklikler onaylandı ve uygulandı!";
        }
    }
});



updateBtn.addEventListener("click", async () => {
    const user = auth.currentUser;
    if(!user) return;

    const newUsername = usernameInput.value.trim();
    const newEmail = emailInput.value.trim();
    const newPassword = passwordInput.value.trim();

    const docRef = doc(db, "users", user.uid);

    try {
        // Pending değişiklikleri kaydet
        await updateDoc(docRef, {
            pendingChanges: {
                username: newUsername || null,
                email: newEmail || null,
                password: newPassword || null
            }
        });

        // Doğrulama maili gönder
        await sendEmailVerification(user);

        statusMsg.style.color = "orange";
        statusMsg.innerText = "E-postana onay linki gönderildi. Onayladıktan sonra değişikliklerin uygulanacak. (Sayfayı yenilemeyi unutmayın.)";

    } catch(error){
        statusMsg.style.color = "red";
        statusMsg.innerText = "Hata: " + error.message;
    }
});
// Hesaptan çıkış butonunu seç
const quitBtn = document.getElementById("quitBtn");

quitBtn.addEventListener("click", () => {
    signOut(auth).then(() => {
        // Çıkış başarılı
        alert("Hesaptan çıkış yapıldı!");
        window.location.href = "index.html"; // çıkınca anasayfaya yönlendir
    }).catch((error) => {
        alert("Hata: " + error.message);
    });
});
