let token = "";
let currentPhone = "";

/* ---------- UI SWITCHING ---------- */

function showSignup(){
    hideAll();
    document.getElementById("signupSection").style.display="block";
}

function showLogin(){
    hideAll();
    document.getElementById("loginSection").style.display="block";
}

function showForgot(){
    hideAll();
    document.getElementById("forgotSection").style.display="block";
}

function hideAll(){
    document.getElementById("signupSection").style.display="none";
    document.getElementById("loginSection").style.display="none";
    document.getElementById("forgotSection").style.display="none";
    document.getElementById("otpSection").style.display="none";
    document.getElementById("resetSection").style.display="none";
    document.getElementById("voteSection").style.display="none";
}

/* ---------- SIGNUP ---------- */

async function signup(){

    const name = document.getElementById("signupName").value;
    const phone = document.getElementById("signupPhone").value;
    const password = document.getElementById("signupPassword").value;

    const res = await fetch("http://localhost:5000/signup",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            name:name,
            phone:phone,
            password:password
        })
    });

    const data = await res.json();

    if(data.success){
        alert("Account created");
        showLogin();
    }else{
        alert(data.message);
    }
}

/* ---------- LOGIN ---------- */

async function login(){

    const phone = document.getElementById("loginPhone").value;
    const password = document.getElementById("loginPassword").value;

    const res = await fetch("http://localhost:5000/login",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            phone:phone,
            password:password
        })
    });

    const data = await res.json();

    if(data.success){
        token = data.token;

        alert("Login successful");

        hideAll();
        document.getElementById("voteSection").style.display="block";
    }else{
        alert(data.message);
    }
}

/* ---------- LOGOUT ---------- */

async function logout(){

    await fetch("http://localhost:5000/logout",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({token})
    });

    token="";
    showLogin();
}

/* ---------- SEND OTP ---------- */

async function sendOTP(){

    currentPhone = document.getElementById("forgotPhone").value;

    await fetch("http://localhost:5000/forgot-password",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            phone:currentPhone
        })
    });

    alert("OTP sent. Check server console.");

    hideAll();
    document.getElementById("otpSection").style.display="block";
}

/* ---------- VERIFY OTP ---------- */

async function verifyOTP(){

    const otp = document.getElementById("otpInput").value;

    const res = await fetch("http://localhost:5000/verify-otp",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            phone:currentPhone,
            otp:otp
        })
    });

    const data = await res.json();

    if(data.success){
        hideAll();
        document.getElementById("resetSection").style.display="block";
    }else{
        alert("Invalid OTP");
    }
}

/* ---------- RESET PASSWORD ---------- */

async function resetPassword(){

    const newPassword = document.getElementById("newPassword").value;

    await fetch("http://localhost:5000/reset-password",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            phone:currentPhone,
            newPassword:newPassword
        })
    });

    alert("Password changed");
    showLogin();
}

/* ---------- VOTE ---------- */

async function vote(candidate){

    await fetch("http://localhost:5000/vote",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            token:token,
            candidate:candidate
        })
    });

    alert("Vote recorded successfully");
}