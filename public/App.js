let phone = ""

/* SEND OTP */

async function sendOTP(){

phone =
document.getElementById("phoneInput").value

const res =
await fetch(
"http://localhost:5000/send-otp",
{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
phone:phone
})

})

const data = await res.json()

if(data.success){

alert("OTP sent to your phone number")

document.getElementById("loginSection").style.display="none"

document.getElementById("otpSection").style.display="block"

}else{

alert(data.message)

}

}

/* VERIFY OTP */

async function verifyOTP(){

const otp =
document.getElementById("otpInput").value

const res =
await fetch(
"http://localhost:5000/verify-otp",
{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
phone:phone,
otp:otp
})

})

const data = await res.json()

if(data.success){

alert("Login successful")

document.getElementById("otpSection").style.display="none"

document.getElementById("voteSection").style.display="block"

}else{

alert("Invalid OTP")

}

}

/* CAST VOTE */

async function vote(candidate){

const res =
await fetch(
"http://localhost:5000/vote",
{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
phone:phone,
candidate:candidate
})

})

const data = await res.json()

if(data.success){

alert("Vote recorded")

document.getElementById("voteSection").style.display="none"

document.getElementById("resultSection").style.display="block"

loadResults()

}else{

alert(data.message)

}

}

/* LOAD RESULTS */

async function loadResults(){

const res =
await fetch("http://localhost:5000/results")

const data = await res.json()

let html=""

data.forEach(r=>{

html += r.candidate + " : " + r.votes + "<br>"

})

document.getElementById("results").innerHTML = html

}