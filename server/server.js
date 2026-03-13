const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")

const Blockchain = require("../blockchain/blockchain")

const app = express()

app.use(cors())
app.use(bodyParser.json())

/* BLOCKCHAIN */

const voteChain = new Blockchain()

/* OTP STORAGE */

let otpStore = {}

/* SEND OTP */

app.post("/send-otp",(req,res)=>{

const {phone} = req.body

const otp =
Math.floor(100000 + Math.random()*900000)

otpStore[phone] = otp

console.log("OTP for",phone,"=",otp)

res.json({success:true})

})

/* VERIFY OTP */

app.post("/verify-otp",(req,res)=>{

const {phone,otp} = req.body

if(String(otpStore[phone]) === String(otp)){

delete otpStore[phone]

res.json({success:true})

}else{

res.json({success:false})

}

})

/* CAST VOTE */

app.post("/vote",(req,res)=>{

const {phone,candidate} = req.body

voteChain.addBlock({
phone:phone,
candidate:candidate
})

console.log("New Vote Block Added:")
console.log(voteChain.chain)

res.json({success:true})

})

/* VIEW BLOCKCHAIN (ADMIN ONLY) */

app.get("/blockchain",(req,res)=>{

res.json(voteChain.chain)

})

/* START SERVER */

app.listen(5000,()=>{

console.log("Server running on port 5000")

})