import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyDw1ibYg2xGcbF1azF09JUSYMnfhQDySHg",
    authDomain: "ardacelikkapi-adcfb.firebaseapp.com",
    projectId: "ardacelikkapi-adcfb",
    storageBucket: "ardacelikkapi-adcfb.firebasestorage.app",
    messagingSenderId: "436173086063",
    appId: "1:436173086063:web:45b125b911b4a168a8dc9a",
    measurementId: "G-YRFLQJW6EP"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 🔹 Firebase hata kodlarını Türkçe'ye çeviren fonksiyon
function getErrorMessage(errorCode) {
    const errors = {
        "auth/email-already-in-use": "Bu e-posta adresi zaten kullanımda.",
        "auth/invalid-email": "Geçersiz e-posta adresi.",
        "auth/weak-password": "Şifre çok zayıf (en az 6 karakter olmalı).",
        "auth/user-not-found": "Kullanıcı bulunamadı.",
        "auth/wrong-password": "Hatalı şifre girdiniz.",
        "auth/missing-password": "Lütfen bir şifre girin.",
        "auth/too-many-requests": "Çok fazla deneme yapıldı, lütfen daha sonra tekrar deneyin.",
    };

    return errors[errorCode] || "Bilinmeyen bir hata oluştu: " + errorCode;
}


// ----------------- REGISTER -----------------
const registerForm = document.querySelector("#registerForm");

if(registerForm){
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const passwordAgain = document.getElementById("passwordagain").value;
        const username = document.getElementById("username").value;

        if(password !== passwordAgain){
            alert("Şifreler eşleşmiyor!");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Firestore'a kullanıcı adı ve UID kaydet
            await setDoc(doc(db, "users", user.uid), {
                username: username,
                email: email,
                role: "user"
            });

            // E-posta doğrulama gönder
            await sendEmailVerification(user);
            alert("Kayıt başarılı! Lütfen e-posta adresinizi doğrulayın.");

            window.location.href = "index.html";
        } catch(error) {
            alert(getErrorMessage(error.code)); // ✅ Türkçe hata mesajı
        }
    });
}

// ----------------- LOGIN -----------------
const loginForm = document.querySelector("#loginForm");
const rememberCheckbox = document.getElementById("remember");

if(loginForm){
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const usernameInput = document.getElementById("username").value;

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // ⚡ E-posta doğrulamasını kontrol et
            if(!user.emailVerified){
                alert("Lütfen e-posta adresinizi doğrulayın!");
                return;
            }

            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);

            if(docSnap.exists()){
                const userData = docSnap.data();

                if(userData.username !== usernameInput){
                    alert("Yanlış kullanıcı adı!");
                    return;
                }

                // remember işareti kontrolü
                if(rememberCheckbox.checked){
                    // kullanıcıyı kalıcı sakla
                    localStorage.setItem("username", userData.username);
                    localStorage.setItem("userEmail", userData.email);
                    localStorage.setItem("role", userData.role);
                } else {
                    // sadece oturum boyunca sakla
                    sessionStorage.setItem("username", userData.username);
                    sessionStorage.setItem("userEmail", userData.email);
                    sessionStorage.setItem("role", userData.role);
                }

                document.getElementById("succesful-or-not-text").innerText = "Giriş başarılı";

                setTimeout(() => {
                    window.location.href = "menu.html";
                }, 1000);
            } else {
                alert("Firestore'da kullanıcı bilgisi yok!");
            }

        } catch(error) {
            alert(getErrorMessage(error.code)); // ✅ Türkçe hata mesajı
        }
    });
}


// ----------------- PASSWORD RESET -----------------
const resetForm = document.querySelector("#passwordforgotForm");

if(resetForm){
    resetForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value;

        try {
            await sendPasswordResetEmail(auth, email);
            alert("Şifre sıfırlama linki e-posta adresine gönderildi!");
            window.location.href = "index.html"; // Başarıyla gönderildikten sonra login sayfasına yönlendir
        } catch (error) {
            alert(getErrorMessage(error.code)); // ✅ Türkçe hata mesajı
        }
    });
}



