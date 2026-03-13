const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const crypto = require("crypto")

const Blockchain = require("../blockchain/blockchain")

const app = express()
app.use(cors())
app.use(bodyParser.json())

/* BLOCKCHAIN */

const voteChain = new Blockchain()

/* IN-MEMORY USER STORE */

let users = {} 
// phone -> { name, password }

/* SESSION STORE */

let sessions = {} 
// token -> phone

/* OTP STORE */

let otpStore = {} 
// phone -> otp

/* -------- SIGN UP -------- */

app.post("/signup",(req,res)=>{

const {name,phone,password} = req.body

if(users[phone]){
return res.json({
success:false,
message:"Account already exists"
})
}

users[phone] = {
name:name,
password:password
}

res.json({
success:true
})

})

/* -------- LOGIN -------- */

app.post("/login",(req,res)=>{

const {phone,password} = req.body

if(!users[phone]){
return res.json({
success:false,
message:"User not found"
})
}

if(users[phone].password !== password){
return res.json({
success:false,
message:"Wrong password"
})
}

/* CREATE SESSION TOKEN */

const token = crypto.randomBytes(16).toString("hex")
sessions[token] = phone

res.json({
success:true,
token:token,
name:users[phone].name
})

})

/* -------- LOGOUT -------- */

app.post("/logout",(req,res)=>{

const {token} = req.body
delete sessions[token]

res.json({success:true})

})

/* -------- FORGOT PASSWORD (SEND OTP) -------- */

app.post("/forgot-password",(req,res)=>{

const {phone} = req.body

if(!users[phone]){
return res.json({
success:false,
message:"User not found"
})
}

const otp =
Math.floor(100000 + Math.random()*900000)

otpStore[phone] = otp

console.log("Password reset OTP for",phone,"=",otp)

res.json({success:true})

})

/* -------- VERIFY OTP -------- */

app.post("/verify-otp",(req,res)=>{

const {phone,otp} = req.body

if(String(otpStore[phone]) === String(otp)){

delete otpStore[phone]

res.json({success:true})

}else{

res.json({success:false})

}

})

/* -------- RESET PASSWORD -------- */

app.post("/reset-password",(req,res)=>{

const {phone,newPassword} = req.body

if(!users[phone]){
return res.json({
success:false,
message:"User not found"
})
}

users[phone].password = newPassword

res.json({success:true})

})

/* -------- CAST VOTE -------- */

app.post("/vote",(req,res)=>{

const {token,candidate} = req.body

const phone = sessions[token]

if(!phone){
return res.json({
success:false,
message:"Not logged in"
})
}

voteChain.addBlock({
phone:phone,
candidate:candidate
})

console.log("New Vote Block Added")
console.log(voteChain.chain)

res.json({success:true})

})

/* -------- VIEW BLOCKCHAIN (ADMIN) -------- */

app.get("/blockchain",(req,res)=>{

res.json(voteChain.chain)

})



app.listen(5000,()=>{
console.log("Server running on port 5000")
})