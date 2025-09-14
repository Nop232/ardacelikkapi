import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
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

// ----------------- TRANSLATIONS -----------------
const translations = { 
    en: {
        toptext: "Login",
        toptextregister: "Register",
        emailtext: "Email",
        passwordtext: "Password",
        passwordagaintext: "Password Again",
        remembertext: "Remember me",
        forgettext: "Forget Password?",
        loginbutton: "Login",
        registerbutton: "Register",
        dontaccount: "Don't have an account?",
        register: "Register",
        orlogin: "Login",
        username: "Username",
    },
    tr: {
        toptext: "Giriş Yap",
        toptextregister: "Kayıt Ol",
        emailtext: "Email",
        passwordtext: "Şifre",
        passwordagaintext: "Şifre Tekrar",
        remembertext: "Beni Hatırla",
        forgettext: "Şifremi Unuttum",
        loginbutton: "Giriş Yap",
        registerbutton: "Kayıt Ol",
        dontaccount: "Hesabın yokmu?",
        register: "Kayıt Ol",
        orlogin: "Giriş yap",
        username: "Kullanıcı isimi",
    }
};

// ----------------- LANGUAGE SWITCHER -----------------
const languageSelectop = document.querySelector("#languageSelect");
const setLanguage = (lang) => {
    if(document.getElementById("toptext")) document.getElementById("toptext").innerText = translations[lang].toptext;
    if(document.getElementById("toptextregister")) document.getElementById("toptextregister").innerText = translations[lang].toptextregister;
    if(document.getElementById("emailtext")) document.getElementById("emailtext").innerText = translations[lang].emailtext;
    if(document.getElementById("passwordtext")) document.getElementById("passwordtext").innerText = translations[lang].passwordtext;
    if(document.getElementById("passwordagaintext")) document.getElementById("passwordagaintext").innerText = translations[lang].passwordagaintext;
    if(document.getElementById("remembertext")) document.getElementById("remembertext").innerText = translations[lang].remembertext;
    if(document.getElementById("forgettext")) document.getElementById("forgettext").innerText = translations[lang].forgettext;
    if(document.getElementById("loginbutton")) document.getElementById("loginbutton").innerText = translations[lang].loginbutton;
    if(document.getElementById("registerbutton")) document.getElementById("registerbutton").innerText = translations[lang].registerbutton;
    if(document.getElementById("dontaccount")) document.getElementById("dontaccount").querySelector("span").innerText = translations[lang].dontaccount;
    if(document.getElementById("register")) document.getElementById("register").innerText = translations[lang].register;
    if(document.getElementById("orlogin")) document.getElementById("orlogin").innerText = translations[lang].orlogin;
    if(document.getElementById("username")) document.getElementById("username").innerText = translations[lang].username;
};
if(languageSelectop){
    languageSelectop.addEventListener("change", (e) => setLanguage(e.target.value));
}
setLanguage("tr");

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
            alert("Passwords do not match!");
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
            alert("Registration successful! Please check your email to verify your account.");

            window.location.href = "index.html";
        } catch(error) {
            alert(error.message);
        }
    });
}


// LOGIN
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

                const lang = languageSelectop.value;
                const message = lang === "en" ? "Login successful" : "Giriş başarılı";
                document.getElementById("succesful-or-not-text").innerText = message;

                setTimeout(() => {
                    window.location.href = "menu.html";
                }, 1000);
            } else {
                alert("Firestore'da kullanıcı bilgisi yok!");
            }

        } catch(error) {
            alert(error.message);
        }
    });
}


import { sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

// Forgot Password formunu yakala
const resetForm = document.querySelector("#passwordforgotForm");
if(resetForm){
    resetForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value;

        try {
            await sendPasswordResetEmail(auth, email);
            alert("Şifre sıfırlama linki email adresine gönderildi!");
            window.location.href = "index.html"; // Başarıyla gönderildikten sonra login sayfasına yönlendir
        } catch (error) {
            alert(error.message);
        }
    });
}



