import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth, onAuthStateChanged, updateEmail, updatePassword, sendEmailVerification, signOut } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

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
        window.location.href = "index.html"; // giriş yoksa ana sayfaya at
        return;
    }

    // Firestore'dan kullanıcı verilerini çek
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);
    if(docSnap.exists()){
        const userData = docSnap.data();
        usernameInput.value = userData.username || "";
        emailInput.value = user.email || "";
        usernameDisplay.innerText = userData.username || "Kullanıcı";
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
        // Firestore kullanıcı adını güncelle
        await updateDoc(docRef, { username: newUsername });

        // E-posta güncelle
        if(newEmail && newEmail !== user.email){
            await updateEmail(user, newEmail);
            await sendEmailVerification(user); // yeni email’e doğrulama maili gönder
            statusMsg.style.color = "orange";
            statusMsg.innerText = "Yeni email adresine doğrulama maili gönderildi. Lütfen onaylayın.";
        }

        // Şifre güncelle
        if(newPassword){
            await updatePassword(user, newPassword);
        }

        statusMsg.style.color = "green";
        statusMsg.innerText = "Hesap bilgileri başarıyla güncellendi!";
        usernameDisplay.innerText = newUsername;

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
