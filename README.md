# 🗳️ SarvaMat: The Blockchain E-Voting Ecosystem

### Empowering Democracy through Cryptographic Integrity and AI-Driven Identity.
**SarvaMat** is a next-generation decentralized voting platform designed to eliminate electoral fraud. It combines **AES-256 encrypted payloads**, **Biometric Identity verification**, and **Immutable Blockchain ledgers** into a seamless, high-trust experience for both voters and hosts.

---

## 🚀 Key Features

### 🔐 Multi-Factor Identity (MFI)
* **Aadhaar Integration:** Secure 12-digit Digital ID validation to ensure "One Person, One Vote."
* **Biometric Shield:** Integrated FaceID and Fingerprint toggles for hardware-level authentication.
* **Dual-Channel OTP:** Server-side generated 6-digit codes for real-time mobile verification and password resets.

### ⛓️ Blockchain Integrity
* **Immutable Ledger:** Every cast vote is hashed and recorded on a tamper-proof blockchain.
* **Auditability:** A "Blockchain Valid" engine that allows hosts to verify the sanctity of the entire election in real-time.
* **AES-256 Defense:** Sensitive voter data is encrypted at rest using industry-standard AES-256 before being hashed.

### 📊 Intelligence & Management
* **Dual-Role Portals:** Distinct, optimized dashboards for **Voters** (Participation) and **Hosts** (Administration).
* **Live Analytics:** Real-time vote distribution heatmaps and countdown timers for active elections.
* **Status Tracking:** Persistent monitoring of "Verified" vs. "Pending" voter statuses to maintain system health.

---

## 📸 System Walkthrough

### 1. Onboarding & Authentication
The platform uses a clean, role-based entry system. Our backend console tracks every authentication event (OTP) to prevent brute-force attacks.

| Role Selection | Security Logs (OTP) |
|
### 2. Multi-Stage Registration
Identity is verified through a 4-step process: Identity -> OTP -> Face -> Biometric. This ensures 100% user accountability.

*Registration interface showing Aadhaar validation and biometric security toggles.*

### 3. Real-Time Dashboards
Voters can browse live elections like the **General Election 2024**, while Hosts manage local polls like the **Panchayat Election 2026** with deep administrative tools.

| Voter Dashboard | Host Management |


### 4. Verified Results
Hosts have access to a live "Vote Distribution" panel that displays the winner while confirming that the **Blockchain is Valid** and encryption is active

---

## 🛠️ Tech Stack

### Frontend (React / Next.js)
* **UI/UX:** High-fidelity, accessible components with Tailwind CSS.
* **State:** Real-time data fetching for live election countdowns.
* **Hardware:** Integration with WebAuthn/Biometric APIs for secure login.

### Backend & Security
* **Encryption:** AES-256 CBC mode for sensitive data storage.
* **Auth:** JWT-based sessions coupled with 6-digit OTP verification.
* **Ledger:** Distributed hashing to ensure data immutability.

---

## 🚦 Quick Start

### Prerequisites
* Node.js v18+
* NPM or Yarn

### Installation
1. **Clone the Repo**
   ```bash
   git clone [https://github.com/bhumika8393/e-votex.git](https://github.com/bhumika8393/e-votex.git)
