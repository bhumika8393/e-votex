# 🗳️ SarvaMat — Blockchain E-Voting System

A secure, tamper-proof e-voting platform where every vote is recorded as an immutable block on a custom blockchain.

---

## ✨ Features

- **Voter** — Register with Aadhar + OTP, cast votes in live elections
- **Host** — Create & manage elections via an 8-step wizard, view live results
- **Blockchain** — Every vote = one mined SHA-256 block (Proof-of-Work)
- **Security** — AES-256 encryption, one-vote-per-voter enforcement

---

## 🛠️ Tech Stack

| | |
|---|---|
| Frontend | Vanilla HTML, CSS, JavaScript |
| Backend | Node.js + Express.js |
| Database | SQLite3 |
| Blockchain | Custom (`block.js` + `blockchain.js`) |

---

## 🚀 Getting Started
```bash
git clone https://github.com/bhumika8393/e-votex.git
cd e-votex
npm install express cors sqlite3
node server/server.js
```

Open **http://localhost:3000** — OTPs appear in the server console.

---

## 📁 Structure
```
e-votex/
├── public/        → index.html, App.js
├── blockchain/    → block.js, blockchain.js
├── server/        → server.js, voters.db
└── assets/        → screenshots
```

---

## 📸 Screenshots

**Role Selection**

<img src="assets/Screenshot 2026-03-14 063947.png" width="100%"/>

---

**Voter Login**

<img src="assets/Screenshot 2026-03-14 063830.png" width="100%"/>

---

**Voter Registration**

<img src="assets/Screenshot 2026-03-14 064042.png" width="100%"/>

---

**OTP Verification**

<img src="assets/Screenshot 2026-03-14 064135.png" width="100%"/>

---

**Password Reset**

<img src="assets/Screenshot 2026-03-14 064308.png" width="100%"/>

---

**Server Console — OTP Output**

<img src="assets/Screenshot 2026-03-14 064326.png" width="100%"/>

---

**Voter Dashboard**

<img src="assets/WhatsApp Image 2026-03-14 at 7.05.41 AM.jpeg" width="100%"/>

---

**Host Dashboard**

<img src="assets/WhatsApp Image 2026-03-14 at 7.06.33 AM.jpeg" width="100%"/>

---

**Results Dashboard**

<img src="assets/WhatsApp Image 2026-03-14 at 7.06.58 AM.jpeg" width="100%"/>

---

**Host Sign Up**

<img src="assets/WhatsApp Image 2026-03-14 at 7.07.27 AM.jpeg" width="100%"/>

---

**Step 1 — Election Details**

<img src="assets/WhatsApp Image 2026-03-14 at 7.08.10 AM.jpeg" width="100%"/>

---

**Step 2 — Organizer Info**

<img src="assets/WhatsApp Image 2026-03-14 at 7.08.33 AM.jpeg" width="100%"/>

---

**Step 3 — Add Candidates**

<img src="assets/WhatsApp Image 2026-03-14 at 7.08.52 AM.jpeg" width="100%"/>

---

**Step 4 — Ballot Config**

<img src="assets/WhatsApp Image 2026-03-14 at 7.09.10 AM.jpeg" width="100%"/>

---

**Step 5 — Security Settings**

<img src="assets/WhatsApp Image 2026-03-14 at 7.09.31 AM.jpeg" width="100%"/>

---

**Step 6 — Results Settings**

<img src="assets/WhatsApp Image 2026-03-14 at 7.09.46 AM.jpeg" width="100%"/>

---

**Step 7 — Notifications**

<img src="assets/WhatsApp Image 2026-03-14 at 7.10.01 AM.jpeg" width="100%"/>

---

**Step 8 — Review & Submit**

<img src="assets/WhatsApp Image 2026-03-14 at 7.10.24 AM.jpeg" width="100%"/>

---

<div align="center">Built with ⛓️ by the SarvaMat Team</div>
   git clone [https://github.com/bhumika8393/e-votex.git](https://github.com/bhumika8393/e-votex.git)
