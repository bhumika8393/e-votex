const express = require("express")
const sqlite3 = require("sqlite3").verbose()
const bodyParser = require("body-parser")
const cors = require("cors")

const app = express()

app.use(cors())
app.use(bodyParser.json())

/* STORE OTP TEMPORARILY */

let otpStore = {}

/* DATABASE */

const db = new sqlite3.Database("./server/voters.db")

db.serialize(()=>{

/* CREATE VOTERS TABLE */

db.run(`
CREATE TABLE IF NOT EXISTS voters(
id INTEGER PRIMARY KEY AUTOINCREMENT,
name TEXT,
phone TEXT UNIQUE,
hasVoted INTEGER DEFAULT 0
)
`)

/* CREATE VOTES TABLE */

db.run(`
CREATE TABLE IF NOT EXISTS votes(
id INTEGER PRIMARY KEY AUTOINCREMENT,
phone TEXT,
candidate TEXT
)
`)

})

/* SEND OTP */

app.post("/send-otp",(req,res)=>{

const {phone} = req.body

db.get(
`SELECT * FROM voters WHERE phone=?`,
[phone],
(err,row)=>{

if(!row){

db.run(
`INSERT INTO voters(name,phone)
VALUES(?,?)`,
["New Voter",phone]
)

}

const otp =
Math.floor(100000 + Math.random()*900000)

otpStore[phone] = otp

console.log("OTP for",phone,"=",otp)

res.json({
success:true
})

})

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

db.get(
`SELECT * FROM voters WHERE phone=?`,
[phone],
(err,row)=>{

if(!row){

return res.json({
success:false,
message:"Voter not found"
})

}

if(row.hasVoted == 1){

return res.json({
success:false,
message:"You already voted"
})

}

/* STORE VOTE */

db.run(
`INSERT INTO votes(phone,candidate)
VALUES(?,?)`,
[phone,candidate]
)

/* MARK VOTER AS VOTED */

db.run(
`UPDATE voters
SET hasVoted=1
WHERE phone=?`,
[phone]
)

res.json({success:true})

})

})

/* RESULTS */

app.get("/results",(req,res)=>{

db.all(
`SELECT candidate,
COUNT(*) as votes
FROM votes
GROUP BY candidate`,
(err,rows)=>{

res.json(rows)

})

})

/* START SERVER */

app.listen(5000,()=>{

console.log("Server running on port 5000")

})