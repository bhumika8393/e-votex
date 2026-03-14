// SarvaMat E-Voting Application
const API_URL = 'http://localhost:3000';

let state = {
    user: null, role: null, currentPage: 'role-select',
    signupData: {}, biometricEnabled: false,
    faceCaptured: false, fingerprintCaptured: false, faceStream: null,
    elections: [], candidates: [], selectedElection: null, selectedCandidate: null, electionSearch: '', electionTab: 'live', votedElections: [],
    hostUser: null, hostStep: 1, hostAuthTab: 'login',
    hostData: {
        electionName:'', electionType:'College', description:'',
        startDate:'', endDate:'', adminName:'', organization:'',
        adminEmail:'', adminPhone:'', voters:[], candidates:[],
        votingRule:'one-per-voter', authMethod:'OTP', biometric:false,
        resultVisibility:'after-end', notifications:true
    },
    createdElectionId: null
};

function showToast(msg, type='info') {
    const t=document.getElementById('toast'); t.textContent=msg;
    t.className=`toast ${type} show`; setTimeout(()=>t.classList.remove('show'),3200);
}

async function apiCall(endpoint, method='GET', data=null) {
    try {
        const opts={method,headers:{'Content-Type':'application/json'}};
        if(data) opts.body=JSON.stringify(data);
        const res=await fetch(`${API_URL}${endpoint}`,opts);
        const json=await res.json();
        if(!res.ok) throw new Error(json.error||'Something went wrong');
        return json;
    } catch(e) { showToast(e.message,'error'); throw e; }
}

function render() {
    stopCamera();
    const app=document.getElementById('app');
    switch(state.currentPage) {
        case 'role-select':            app.innerHTML=renderRoleSelect(); break;
        case 'login':                  app.innerHTML=renderLoginPage(); break;
        case 'register-step1':         app.innerHTML=renderRegStep1(); break;
        case 'register-step2-otp':     app.innerHTML=renderRegStep2Otp(); break;
        case 'register-step3-face':    app.innerHTML=renderRegStep3Face(); setTimeout(initCamera,100); break;
        case 'register-step4-bio':     app.innerHTML=renderRegStep4Bio(); break;
        case 'forgot':                 app.innerHTML=renderForgotPage(); break;
        case 'voter-dashboard':        app.innerHTML=renderVoterDashboard(); break;
        case 'election-detail':        app.innerHTML=renderElectionDetail(); break;
        case 'host-login':             app.innerHTML=renderHostLogin(); break;
        case 'host-flow':              app.innerHTML=renderHostFlow(); break;
        case 'host-dashboard':         app.innerHTML=renderHostDashboard(); break;
        case 'host-results':           app.innerHTML=renderHostResults(); break;
        default:                       app.innerHTML=renderRoleSelect();
    }
    attachListeners();
}

// ── ROLE SELECT ──────────────────────────────────────────────────────────────
function renderRoleSelect() {
    return `
    <div class="role-page">
        <div class="role-header">
            <div class="role-brand">🗳️ SarvaMat</div>
            <div class="role-brand-sub">Blockchain E-Voting Platform</div>
        </div>
        <div class="role-body">
            <div class="role-title">How would you like to continue?</div>
            <div class="role-sub">Choose your role to get started</div>
            <div class="role-cards">
                <div class="role-card" id="chooseVoter">
                    <div class="role-card-icon">🗳️</div>
                    <div class="role-card-title">I'm a Voter</div>
                    <div class="role-card-desc">Register or login to cast your vote in active elections</div>
                    <div class="role-card-cta">Continue as Voter →</div>
                </div>
                <div class="role-card" id="chooseHost">
                    <div class="role-card-icon">🏛️</div>
                    <div class="role-card-title">I'm a Host</div>
                    <div class="role-card-desc">Create and manage elections, add candidates and voters</div>
                    <div class="role-card-cta">Continue as Host →</div>
                </div>
            </div>
            <div class="role-info-box">
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="#0891b2" stroke-width="1.5"/><path d="M10 9v5M10 7v.5" stroke="#0891b2" stroke-width="1.5" stroke-linecap="round"/></svg>
                All votes are encrypted with AES-256 and recorded on an immutable blockchain ledger
            </div>
        </div>
    </div>`;
}

// ── VOTER AUTH ────────────────────────────────────────────────────────────────
function renderLoginPage() {
    return `
    <div class="reg-page">
        <div class="reg-topbar">
            <div class="reg-brand">🗳️ SarvaMat</div>
            <div style="display:flex;align-items:center;gap:16px">
                <div class="reg-login-link">No account? <span id="goRegister">Register →</span></div>
                <button class="btn-back-role" id="backToRole">← Roles</button>
            </div>
        </div>
        <div class="reg-body" style="max-width:600px">
            <div class="reg-title">Welcome back</div>
            <div class="reg-sub">Login to access your voter dashboard</div>
            <form id="loginForm" class="reg-form-card">
                <div class="rf-group">
                    <label class="rf-label">Phone Number</label>
                    <div class="rf-input-wrap">
                        <svg class="rf-icon" viewBox="0 0 20 20" fill="none"><rect x="5" y="2" width="10" height="16" rx="2" stroke="#9ca3af" stroke-width="1.5"/><circle cx="10" cy="15" r="1" fill="#9ca3af"/></svg>
                        <input type="tel" id="loginPhone" class="rf-input" placeholder="10-digit phone" maxlength="10" required>
                    </div>
                </div>
                <div class="rf-group" style="margin-bottom:0">
                    <label class="rf-label">Password</label>
                    <div class="rf-input-wrap">
                        <svg class="rf-icon" viewBox="0 0 20 20" fill="none"><rect x="4" y="9" width="12" height="8" rx="2" stroke="#9ca3af" stroke-width="1.5"/><path d="M7 9V6a3 3 0 016 0v3" stroke="#9ca3af" stroke-width="1.5" stroke-linecap="round"/></svg>
                        <input type="password" id="loginPassword" class="rf-input" placeholder="Your password" required>
                    </div>
                </div>
            </form>
            <div style="height:20px"></div>
            <button type="submit" form="loginForm" class="rf-cta-btn">Login to Dashboard →</button>
            <div style="text-align:center;margin-top:12px">
                <button type="button" class="btn-sm-link" id="forgotLink">Forgot password?</button>
            </div>
            <div class="rf-cta-note" style="margin-top:10px">🔒 End-to-end encrypted</div>
        </div>
    </div>`;
}

function regStepHeader(active) {
    const steps=[{n:1,label:'Identity'},{n:2,label:'OTP'},{n:3,label:'Face'},{n:4,label:'Biometric'}];
    return `<div class="step-header">${steps.map((s,i)=>`
        <div class="step-item ${active===s.n?'active':(active>s.n?'done':'')}">
            <div class="step-num">${active>s.n?'✓':s.n}</div><span>${s.label}</span>
        </div>${i<steps.length-1?`<div class="step-divider"></div>`:''}`).join('')}</div>`;
}

function renderRegStep1() {
    const maxDob=(()=>{const d=new Date();d.setFullYear(d.getFullYear()-18);return d.toISOString().split('T')[0];})();
    return `
    <div class="reg-page">
        <div class="reg-topbar">
            <div class="reg-brand">🗳️ SarvaMat</div>
            <div class="reg-login-link">Already registered? <span id="goLogin">Login to Dashboard</span></div>
        </div>
        ${regStepHeader(1)}
        <div class="reg-body">
            <div class="reg-title">Voter Registration</div>
            <div class="reg-sub">Complete your digital identity verification to join the SarvaMat blockchain network.</div>
            <form id="regStep1Form" class="reg-form-card">
                <div class="rf-group">
                    <label class="rf-label">Full Legal Name</label>
                    <div class="rf-input-wrap">
                        <svg class="rf-icon" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="7" r="3.5" stroke="#9ca3af" stroke-width="1.5"/><path d="M3 17c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="#9ca3af" stroke-width="1.5" stroke-linecap="round"/></svg>
                        <input type="text" id="regName" class="rf-input" placeholder="As shown on government ID" required>
                    </div>
                </div>
                <div class="rf-row">
                    <div class="rf-group">
                        <label class="rf-label">Digital ID / Aadhar Number</label>
                        <div class="rf-input-wrap">
                            <svg class="rf-icon" viewBox="0 0 20 20" fill="none"><rect x="3" y="5" width="14" height="10" rx="2" stroke="#9ca3af" stroke-width="1.5"/></svg>
                            <input type="text" id="regAadhar" class="rf-input" placeholder="12-digit Aadhar" maxlength="12" required>
                        </div>
                    </div>
                    <div class="rf-group">
                        <label class="rf-label">Date of Birth</label>
                        <div class="rf-input-wrap">
                            <svg class="rf-icon" viewBox="0 0 20 20" fill="none"><rect x="3" y="4" width="14" height="13" rx="2" stroke="#9ca3af" stroke-width="1.5"/><path d="M3 8h14M7 2v4M13 2v4" stroke="#9ca3af" stroke-width="1.5" stroke-linecap="round"/></svg>
                            <input type="date" id="regDob" class="rf-input" max="${maxDob}" required>
                        </div>
                    </div>
                </div>
                <div class="rf-group">
                    <label class="rf-label">Password</label>
                    <div class="rf-input-wrap">
                        <svg class="rf-icon" viewBox="0 0 20 20" fill="none"><rect x="4" y="9" width="12" height="8" rx="2" stroke="#9ca3af" stroke-width="1.5"/><path d="M7 9V6a3 3 0 016 0v3" stroke="#9ca3af" stroke-width="1.5" stroke-linecap="round"/></svg>
                        <input type="password" id="regPassword" class="rf-input" placeholder="Create a strong password" required>
                    </div>
                </div>
                <div class="rf-group">
                    <label class="rf-label">Phone Number</label>
                    <div class="rf-phone-wrap">
                        <div class="rf-phone-prefix">+91</div>
                        <input type="tel" id="regPhone" class="rf-input rf-phone-input" placeholder="10-digit mobile number" maxlength="10" required>
                    </div>
                </div>
                <div class="rf-info-box">
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" style="flex-shrink:0;margin-top:1px"><circle cx="10" cy="10" r="8" stroke="#0891b2" stroke-width="1.5"/><path d="M10 9v5M10 7v.5" stroke="#0891b2" stroke-width="1.5" stroke-linecap="round"/></svg>
                    Your data is encrypted using AES-256 before being hashed onto the blockchain ledger. We never store your raw biometric data.
                </div>
            </form>
            <div class="rf-bio-row">
                <div><div class="rf-bio-label">Biometric Verification</div><div class="rf-bio-sub">Use FaceID or Fingerprint for faster voting</div></div>
                <button type="button" class="rf-toggle ${state.biometricEnabled?'on':''}" id="bioToggle"></button>
            </div>
            <button type="submit" form="regStep1Form" class="rf-cta-btn">Verify Identity &amp; Continue &nbsp;→</button>
            <div class="rf-cta-note">🔒 End-to-end encrypted registration</div>
        </div>
    </div>`;
}

function renderRegStep2Otp() {
    return `
    <div class="reg-page">
        <div class="reg-topbar"><div class="reg-brand">🗳️ SarvaMat</div><div class="reg-login-link">Already registered? <span id="goLogin">Login</span></div></div>
        ${regStepHeader(2)}
        <div class="reg-body" style="max-width:600px">
            <div class="reg-title">Verify Your Phone</div>
            <div class="reg-sub">We'll send a one-time code to +91 ${state.signupData.phone||''}. Check your server console.</div>
            <div class="reg-form-card">
                <div class="rf-group" style="margin-bottom:0">
                    <label class="rf-label">OTP Code</label>
                    <div style="display:flex;gap:8px">
                        <input type="text" class="rf-input" id="signupOtp" placeholder="Enter 6-digit OTP" maxlength="6" style="flex:1;padding-left:14px">
                        <button type="button" class="btn-otp-send" id="sendOtpBtn">Send OTP</button>
                    </div>
                </div>
            </div>
            <div style="height:20px"></div>
            <button class="rf-cta-btn" id="verifyOtpBtn" disabled>Verify &amp; Continue →</button>
            <div style="text-align:center;margin-top:12px"><button type="button" class="btn-sm-link" id="backToStep1">← Back</button></div>
        </div>
    </div>`;
}

function renderRegStep3Face() {
    return `
    <div class="reg-page">
        <div class="reg-topbar"><div class="reg-brand">🗳️ SarvaMat</div></div>
        ${regStepHeader(3)}
        <div class="bio-container">
            <div class="bio-icon-wrap">👁️</div>
            <div class="bio-title">Face Verification</div>
            <div class="bio-sub">Position your face within the frame and hold still</div>
            <div class="camera-box">
                <video id="cameraFeed" autoplay playsinline muted></video>
                <div class="camera-overlay">
                    <div class="face-frame ${state.faceCaptured?'captured':''}">
                        <div class="c tl"></div><div class="c tr"></div><div class="c bl"></div><div class="c br"></div>
                        ${state.faceCaptured?'<div class="face-captured-check">✓</div>':'<div class="scan-bar"></div>'}
                    </div>
                </div>
            </div>
            <div class="camera-status-row">
                <div style="display:flex;align-items:center"><div class="status-dot ${state.faceCaptured?'green':''}"></div><span id="camStatusText">${state.faceCaptured?'Face captured!':'Starting camera...'}</span></div>
                ${state.faceCaptured?'<span style="color:#22c55e;font-size:0.8rem;font-weight:600">✓ READY</span>':''}
            </div>
            <div style="padding:0 24px">
                ${!state.faceCaptured
                    ?`<button class="rf-cta-btn" id="captureFaceBtn" disabled style="margin-top:0">Capture Face</button>`
                    :`<button class="rf-cta-btn" id="toStep4Btn" style="margin-top:0">Continue to Fingerprint →</button>`}
                <button type="button" class="btn-sm-link" id="backToStep2" style="margin-top:10px;display:block;text-align:center">← Back</button>
            </div>
        </div>
    </div>`;
}

function renderRegStep4Bio() {
    return `
    <div class="reg-page">
        <div class="reg-topbar"><div class="reg-brand">🗳️ SarvaMat</div></div>
        ${regStepHeader(4)}
        <div class="bio-container">
            <div class="bio-icon-wrap">🫱</div>
            <div class="bio-title">Fingerprint Verification</div>
            <div class="bio-sub">Place your finger on the sensor area and hold until the scan completes</div>
            <div class="fp-wrap">
                <div class="fp-ring ${state.fingerprintCaptured?'scanned':''}" id="fpSensor">
                    <div class="fp-svg">${state.fingerprintCaptured
                        ?`<svg viewBox="0 0 72 72" fill="none"><circle cx="36" cy="36" r="33" stroke="#22c55e" stroke-width="3"/><path d="M22 36l9 9 19-19" stroke="#22c55e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`
                        :`<svg viewBox="0 0 72 72" fill="none"><path d="M36 10C22.7 10 12 20.7 12 34c0 9.6 4.8 18 12 23" stroke="#9ca3af" stroke-width="2.5" stroke-linecap="round"/><path d="M36 17c-9.4 0-17 7.6-17 17 0 6.6 3.6 12.4 9 15.5" stroke="#9ca3af" stroke-width="2.5" stroke-linecap="round"/><circle cx="36" cy="34" r="2.5" fill="#6b7280"/><path d="M36 17c9.4 0 17 7.6 17 17 0 6.6-3.6 12.4-9 15.5" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/><path d="M36 10c13.3 0 24 10.7 24 24 0 9.6-4.8 18-12 23" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/></svg>`
                    }</div>
                </div>
                <div class="fp-label" id="fpHint">${state.fingerprintCaptured?'✓ Fingerprint registered!':'Click the sensor to begin scan'}</div>
            </div>
            <div style="padding:0 24px">
                ${state.fingerprintCaptured
                    ?`<button class="rf-cta-btn" id="completeBioBtn" style="margin-top:0">Complete Setup &amp; Go to Voting 🗳️</button>`
                    :`<button class="rf-cta-btn" id="scanFpBtn" style="margin-top:0">Scan Fingerprint</button>`}
                <button type="button" class="btn-sm-link" id="backToStep3" style="margin-top:10px;display:block;text-align:center">← Back</button>
                <div class="rf-cta-note" style="margin-top:10px">🔒 End-to-end encrypted registration</div>
            </div>
        </div>
    </div>`;
}

function renderForgotPage() {
    return `
    <div class="reg-page">
        <div class="reg-topbar"><div class="reg-brand">🗳️ SarvaMat</div><div class="reg-login-link"><span id="backToLoginLink">← Back to Login</span></div></div>
        <div class="reg-body" style="max-width:600px">
            <div class="reg-title">Reset Password</div>
            <div class="reg-sub">Enter your registered phone number to receive an OTP</div>
            <form id="resetForm" class="reg-form-card">
                <div class="rf-group"><label class="rf-label">Phone Number</label>
                    <div class="rf-input-wrap"><svg class="rf-icon" viewBox="0 0 20 20" fill="none"><rect x="5" y="2" width="10" height="16" rx="2" stroke="#9ca3af" stroke-width="1.5"/><circle cx="10" cy="15" r="1" fill="#9ca3af"/></svg>
                    <input type="tel" id="resetPhone" class="rf-input" placeholder="Registered phone" maxlength="10" required></div>
                </div>
                <div class="rf-group"><label class="rf-label">OTP Verification</label>
                    <div style="display:flex;gap:8px">
                        <input type="text" class="rf-input" id="resetOtp" placeholder="6-digit OTP" maxlength="6" style="flex:1;padding-left:14px">
                        <button type="button" class="btn-otp-send" id="sendResetOtp">Send OTP</button>
                    </div>
                </div>
                <div class="rf-group hidden" id="newPasswordGroup" style="margin-bottom:0"><label class="rf-label">New Password</label>
                    <div class="rf-input-wrap"><svg class="rf-icon" viewBox="0 0 20 20" fill="none"><rect x="4" y="9" width="12" height="8" rx="2" stroke="#9ca3af" stroke-width="1.5"/><path d="M7 9V6a3 3 0 016 0v3" stroke="#9ca3af" stroke-width="1.5" stroke-linecap="round"/></svg>
                    <input type="password" id="newPassword" class="rf-input" placeholder="Enter new password"></div>
                </div>
            </form>
            <div style="height:20px"></div>
            <button type="submit" form="resetForm" class="rf-cta-btn" id="resetBtn" disabled>Reset Password →</button>
        </div>
    </div>`;
}

// ── EFFECTIVE STATUS (auto from dates, no manual override needed) ─────────────
function getEffectiveStatus(e) {
    const now = new Date();
    const start = e.start_time ? new Date(e.start_time) : null;
    const end   = e.end_time   ? new Date(e.end_time)   : null;
    if (end && now > end)         return 'ended';
    if (start && now >= start)    return 'active';
    return 'upcoming';
}

// ── DUMMY ELECTIONS (shown alongside real DB elections) ───────────────────────
const DUMMY_ELECTIONS = [
    // LIVE
    { id:'d1', status:'active',   name:'Sir MVIT Student Council Election', description:'Vote for your student representatives for 2025–26 academic year.', domain:'🎓 College', end_time: new Date(Date.now()+2*24*3600000).toISOString(),
      candidates:[{name:'Arjun Mehta',party:'Progressive Students Front'},{name:'Sneha Rao',party:'United Campus Alliance'},{name:'Karan Nair',party:'Independent'}] },
    { id:'d2', status:'active',   name:'Bengaluru Ward 42 Civic Poll', description:'Local civic body election for infrastructure & sanitation committee.', domain:'🏛️ Government', end_time: new Date(Date.now()+1*24*3600000+3*3600000).toISOString(),
      candidates:[{name:'Ramesh Gowda',party:'Janata Dal (S)'},{name:'Fatima Sheikh',party:'Indian National Congress'},{name:'Suresh Babu',party:'BJP'},{name:'Preethi Nair',party:'Independent'}] },
    { id:'d3', status:'active',   name:'TechCorp India Employee Choice Awards', description:'Vote for the best team, manager, and innovator of the year.', domain:'🏢 Corporate', end_time: new Date(Date.now()+3*3600000).toISOString(),
      candidates:[{name:'Platform Engineering Team',party:'Engineering'},{name:'Customer Success Team',party:'Operations'},{name:'Data & AI Team',party:'R&D'}] },
    // UPCOMING
    { id:'d4', status:'upcoming', name:'IIT Bombay Gymkhana Elections 2025', description:'Annual student gymkhana president and secretary elections.', domain:'🎓 College', end_time: new Date(Date.now()+5*24*3600000).toISOString(),
      candidates:[{name:'Dhruv Sharma',party:'Students for Change'},{name:'Ananya Iyer',party:'Gymkhana First'},{name:'Rohan Verma',party:'Independent'}] },
    { id:'d5', status:'upcoming', name:'Koramangala RWA Board Election', description:'Residents Welfare Association board member election.', domain:'🏘️ Community', end_time: new Date(Date.now()+7*24*3600000).toISOString(),
      candidates:[{name:'Vijay Kumar',party:'Residents Welfare'},{name:'Meena Pillai',party:'Green Koramangala'},{name:'Arun Shetty',party:'Independent'}] },
    { id:'d6', status:'upcoming', name:'Karnataka Medical Council – President', description:'Elect the new president of Karnataka Medical Council 2025.', domain:'🏥 Healthcare', end_time: new Date(Date.now()+10*24*3600000).toISOString(),
      candidates:[{name:'Dr. Ravi Shankar',party:'KMC Progressive Panel'},{name:'Dr. Leela Nair',party:'Medical Reform Group'}] },
    { id:'d7', status:'upcoming', name:'Delhi Public School Head Boy/Girl', description:'Annual school leadership election for DPS Dwarka.', domain:'🏫 School', end_time: new Date(Date.now()+4*24*3600000).toISOString(),
      candidates:[{name:'Aditya Kapoor',party:'Class 12-A'},{name:'Priya Singh',party:'Class 12-B'},{name:'Rahul Gupta',party:'Class 12-C'}] },
    // ENDED
    { id:'d8', status:'ended',    name:'Infosys CSR Grant Voting 2024', description:'Employees voted on NGO partners for annual CSR grants.', domain:'🏢 Corporate', end_time: new Date(Date.now()-2*24*3600000).toISOString(),
      candidates:[{name:'Teach For India',party:'Education NGO'},{name:'Goonj',party:'Relief NGO'},{name:'Pratham',party:'Literacy NGO'}] },
    { id:'d9', status:'ended',    name:'BITS Pilani Cultural Fest Head', description:'Student voted for cultural fest organizing committee head.', domain:'🎓 College', end_time: new Date(Date.now()-5*24*3600000).toISOString(),
      candidates:[{name:'Shruti Agarwal',party:'Arts Council'},{name:'Dev Patel',party:'Cultural Committee'},{name:'Nisha Joshi',party:'Independent'}] },
    { id:'d10',status:'ended',    name:'Pune PMC Ward Budget Priority Poll', description:'Citizens voted on spending priorities for ward development budget.', domain:'🏛️ Government', end_time: new Date(Date.now()-8*24*3600000).toISOString(),
      candidates:[{name:'Road & Infrastructure',party:'Development'},{name:'Parks & Sanitation',party:'Green Initiative'},{name:'Street Lighting',party:'Safety'}] },
    { id:'d11',status:'ended',    name:'Chennai Apartment Complex AGM Vote', description:'Annual general meeting resolution voting for Prestige Lakeside.', domain:'🏘️ Community', end_time: new Date(Date.now()-3*24*3600000).toISOString(),
      candidates:[{name:'Solar Panel Installation',party:'Proposal A'},{name:'CCTV Upgrade',party:'Proposal B'},{name:'Gym Renovation',party:'Proposal C'}] },
];

// ── VOTER DASHBOARD ───────────────────────────────────────────────────────────
function renderVoterDashboard() {
    const query = (state.electionSearch||'').toLowerCase().trim();
    const activeTab = state.electionTab || 'live';
    const allElections = [
        ...state.elections.map(e=>({...e, id:String(e.id), domain:'\u{1F5F3}\uFE0F General', status:getEffectiveStatus(e)})),
        ...DUMMY_ELECTIONS
    ];
    const filtered = query
        ? allElections.filter(e=>e.name.toLowerCase().includes(query)||e.description?.toLowerCase().includes(query)||(e.domain||'').toLowerCase().includes(query))
        : allElections;
    const live     = filtered.filter(e=>e.status==='active');
    const upcoming = filtered.filter(e=>e.status==='upcoming');
    const ended    = filtered.filter(e=>e.status==='ended');
    const voterId  = `VX-${String(state.user?.id||0).padStart(5,'0')}-00`;
    const tabList  = [
        {key:'live',label:'Live',count:live.length},
        {key:'upcoming',label:'Upcoming',count:upcoming.length},
        {key:'ended',label:'Ended',count:ended.length}
    ];
    const electionCard=(e,showClick=false)=>`
        <div class="election-item ${showClick?'ec-click':''}" ${showClick?`data-eid="${e.id}"`:''}>
            <div class="election-item-top">
                ${e.status==='active'?'<span class="live-badge">LIVE</span>':e.status==='upcoming'?'<span class="upcoming-badge">UPCOMING</span>':'<span class="ended-badge">ENDED</span>'}
                <span class="election-time">${e.end_time?timeRemaining(e.end_time):(e.status==='ended'?'Ended':'Active')}</span>
            </div>
            <div class="election-name">${e.name}</div>
            <div class="election-desc">${e.description||'Click to view candidates and cast your vote'}</div>
            <div class="election-footer">
                <span style="font-size:0.72rem;font-weight:600;color:#6b7280">${e.domain||''}</span>
                ${showClick?`<button class="btn-outline view-cand-btn" data-eid="${e.id}">View Candidates</button>`:''}
            </div>
        </div>`;
    const simpleCard=(e)=>`
        <div class="simple-election-card">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
                ${e.status==='upcoming'?'<span class="upcoming-badge">UPCOMING</span>':'<span class="ended-badge">ENDED</span>'}
                <span style="font-size:0.7rem;color:#6b7280">${e.domain||''}</span>
            </div>
            <div class="simple-election-name">${e.name}</div>
            <div class="simple-election-desc">${e.description||''}</div>
            <div style="font-size:0.72rem;color:#9ca3af;margin-top:4px">${e.status==='upcoming'?(e.end_time?'Opens '+new Date(e.end_time).toLocaleDateString():''):(e.end_time?'Ended '+new Date(e.end_time).toLocaleDateString():'')}</div>
        </div>`;
    let tabContent='';
    if(activeTab==='live'){
        tabContent=live.length===0?`<div class="col-empty-msg" style="padding:32px;text-align:center">${query?'No matches':'No live elections right now'}</div>`:`<div class="election-list">${live.map(e=>electionCard(e,true)).join('')}</div>`;
    } else if(activeTab==='upcoming'){
        tabContent=upcoming.length===0?`<div class="col-empty-msg" style="padding:32px;text-align:center">${query?'No matches':'No upcoming elections'}</div>`:`<div class="election-list">${upcoming.map(e=>simpleCard(e)).join('')}</div>`;
    } else {
        tabContent=ended.length===0?`<div class="col-empty-msg" style="padding:32px;text-align:center">${query?'No matches':'No ended elections'}</div>`:`<div class="election-list">${ended.map(e=>simpleCard(e)).join('')}</div>`;
    }
    return `
    <div class="page">
        <div style="position:sticky;top:0;z-index:100;background:#fff;border-bottom:1px solid #e5e7eb;box-shadow:0 1px 6px rgba(0,0,0,0.06)">
            <div class="dash-topbar" style="border-bottom:none">
                <div class="dash-brand">SARVAMAT // DASHBOARD<span>Welcome, ${state.user?.name||''}</span></div>
                <div style="display:flex;align-items:center;gap:12px">
                    <button class="logout-link" id="logoutBtn">Logout</button>
                </div>
            </div>
            <div style="display:flex;padding:0 20px;gap:4px;background:#fff">
                ${tabList.map(t=>`<button class="dash-tab-btn" data-tab="${t.key}" style="padding:10px 18px;border:none;background:none;font-size:0.82rem;font-weight:700;cursor:pointer;border-bottom:2px solid ${activeTab===t.key?'#00b896':'transparent'};color:${activeTab===t.key?'#00b896':'#6b7280'};letter-spacing:0.04em">${t.label} <span style="background:${activeTab===t.key?'#00b896':'#e5e7eb'};color:${activeTab===t.key?'#fff':'#6b7280'};border-radius:999px;padding:1px 7px;font-size:0.72rem;margin-left:4px">${t.count}</span></button>`).join('')}
            </div>
        </div>
        <div class="dash-body">
            <div class="voter-card">
                <div class="voter-card-grid">
                    <div><div class="voter-stat-label">Voter ID</div><div class="voter-stat-val">${voterId}</div></div>
                    <div><div class="voter-stat-label">Status</div><div class="voter-stat-val verified">VERIFIED</div></div>
                    <div><div class="voter-stat-label">Votes Cast</div><div class="voter-stat-val">${state.votedElections?.length||0}</div></div>
                </div>
            </div>
            <div style="display:flex;gap:10px;align-items:center;margin-bottom:12px">
                <div style="position:relative;flex:1">
                    <svg style="position:absolute;left:12px;top:50%;transform:translateY(-50%);pointer-events:none" width="16" height="16" viewBox="0 0 20 20" fill="none"><circle cx="9" cy="9" r="6" stroke="#9ca3af" stroke-width="1.5"/><path d="M13.5 13.5L17 17" stroke="#9ca3af" stroke-width="1.5" stroke-linecap="round"/></svg>
                    <input id="electionSearchInput" type="text" value="${state.electionSearch||''}" placeholder="Search by name, domain, keyword..." style="width:100%;box-sizing:border-box;padding:10px 12px 10px 36px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:0.88rem;outline:none;background:#fafafa;color:#111">
                </div>
                <button id="electionSearchBtn" style="padding:10px 18px;background:#111;color:#fff;border:none;border-radius:10px;font-size:0.85rem;font-weight:700;cursor:pointer;white-space:nowrap">\u{1F50D} Search</button>
                ${query?`<button id="electionClearBtn" style="padding:10px 14px;background:#f3f4f6;color:#374151;border:1px solid #e5e7eb;border-radius:10px;font-size:0.82rem;font-weight:600;cursor:pointer">\u2715 Clear</button>`:''}
            </div>
            ${query?`<div style="font-size:0.8rem;color:#6b7280;margin-bottom:14px">${filtered.length} result${filtered.length!==1?'s':''} for "<strong>${state.electionSearch}</strong>"</div>`:''}
            ${tabContent}
        </div>
    </div>`;
}

function timeRemaining(endTime) {
    const diff=new Date(endTime)-new Date(); if(diff<=0) return 'Ended';
    const h=Math.floor(diff/3600000),m=Math.floor((diff%3600000)/60000);
    return h>24?`${Math.floor(h/24)}d ${h%24}h remaining`:`${h}h ${m}m remaining`;
}

function renderElectionDetail() {
    const e=state.selectedElection; if(!e) return '';
    return `
    <div class="page">
        <div class="dash-topbar"><div class="dash-brand">SARVAMAT // VOTING<span>${e.name}</span></div>
        <button class="btn-outline" id="backToDash">← Back</button></div>
        <div class="dash-body">
            ${state.votedElections?.map(Number).includes(Number(state.selectedElection?.id))?`
            <div class="voted-banner"><div class="voted-check">✅</div><div class="voted-title">Vote Cast Successfully!</div>
            <div class="voted-sub">Your vote is securely recorded on the blockchain.<br><span style="color:#00b896;font-weight:600">Block hash logged in server console.</span></div></div>`
            :`<div class="candidate-section">
                <div class="candidate-section-header">
                    <svg viewBox="0 0 16 16" fill="none" width="16" height="16"><rect x="1" y="1" width="14" height="14" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M4 5h8M4 8h8M4 11h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                    <span class="candidate-section-title">Select Candidate</span>
                </div>
                <div class="candidate-election-name">${e.name}</div>
                ${state.candidates.map(c=>`
                <div class="candidate-row ${state.selectedCandidate?.id===c.id?'selected':''}" data-cid="${c.id}">
                    <div class="cand-avatar">${c.symbol}</div>
                    <div><div class="cand-name">${c.name}</div><div class="cand-party">${c.party}</div></div>
                    <div class="cand-radio"></div>
                </div>`).join('')}
                <div class="vote-btn-bar ${state.selectedCandidate?'':'disabled'}" id="castVoteBar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2a10 10 0 100 20A10 10 0 0012 2z" stroke="#fff" stroke-width="1.5"/><path d="M8 12l3 3 5-5" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    <span>CAST ENCRYPTED VOTE</span>
                </div>
            </div>`}
        </div>
    </div>`;
}

// ── HOST LOGIN / SIGNUP ────────────────────────────────────────────────────────
function renderHostLogin() {
    const tab = state.hostAuthTab || 'login';
    return `
    <div class="reg-page">
        <div class="reg-topbar">
            <div class="reg-brand">🗳️ SarvaMat <span style="color:#6b7280;font-size:0.75rem;font-weight:400">HOST PORTAL</span></div>
            <button class="btn-back-role" id="backToRole">← Roles</button>
        </div>
        <div class="reg-body" style="max-width:600px">
            <div class="reg-title">${tab==='login'?'Host Login':'Create Host Account'}</div>
            <div class="reg-sub">${tab==='login'?'Sign in using your Host ID and password':'Register to get your unique Host ID'}</div>

            <!-- TABS -->
            <div style="display:flex;border:1.5px solid #e5e7eb;border-radius:10px;overflow:hidden;margin-bottom:24px">
                <button id="tabLogin" style="flex:1;padding:10px;font-weight:700;font-size:0.85rem;border:none;cursor:pointer;background:${tab==='login'?'#111':'#fff'};color:${tab==='login'?'#fff':'#6b7280'}">LOGIN</button>
                <button id="tabSignup" style="flex:1;padding:10px;font-weight:700;font-size:0.85rem;border:none;cursor:pointer;background:${tab==='signup'?'#111':'#fff'};color:${tab==='signup'?'#fff':'#6b7280'}">SIGN UP</button>
            </div>

            ${tab==='login'?`
            <form id="hostLoginForm" class="reg-form-card">
                <div class="rf-group"><label class="rf-label">Host ID</label>
                    <div class="rf-input-wrap"><svg class="rf-icon" viewBox="0 0 20 20" fill="none"><rect x="3" y="5" width="14" height="10" rx="2" stroke="#9ca3af" stroke-width="1.5"/></svg>
                    <input type="text" id="hostId" class="rf-input" placeholder="e.g. HOST-00001" required></div>
                </div>
                <div class="rf-group" style="margin-bottom:0"><label class="rf-label">Password</label>
                    <div class="rf-input-wrap"><svg class="rf-icon" viewBox="0 0 20 20" fill="none"><rect x="4" y="9" width="12" height="8" rx="2" stroke="#9ca3af" stroke-width="1.5"/><path d="M7 9V6a3 3 0 016 0v3" stroke="#9ca3af" stroke-width="1.5" stroke-linecap="round"/></svg>
                    <input type="password" id="hostPassword" class="rf-input" placeholder="Your password" required></div>
                </div>
            </form>
            <div style="height:20px"></div>
            <button type="submit" form="hostLoginForm" class="rf-cta-btn">Login as Host →</button>`
            :`
            <form id="hostSignupForm" class="reg-form-card">
                <div class="rf-group"><label class="rf-label">Full Name</label>
                    <div class="rf-input-wrap"><svg class="rf-icon" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="7" r="3.5" stroke="#9ca3af" stroke-width="1.5"/><path d="M3 17c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="#9ca3af" stroke-width="1.5" stroke-linecap="round"/></svg>
                    <input type="text" id="hostName" class="rf-input" placeholder="Your full name" required></div>
                </div>
                <div class="rf-group"><label class="rf-label">Email Address</label>
                    <div class="rf-input-wrap"><svg class="rf-icon" viewBox="0 0 20 20" fill="none"><rect x="3" y="5" width="14" height="10" rx="2" stroke="#9ca3af" stroke-width="1.5"/><path d="M3 5l7 6 7-6" stroke="#9ca3af" stroke-width="1.5" stroke-linecap="round"/></svg>
                    <input type="email" id="hostEmail" class="rf-input" placeholder="you@example.com" required></div>
                </div>
                <div class="rf-group" style="margin-bottom:0"><label class="rf-label">Password</label>
                    <div class="rf-input-wrap"><svg class="rf-icon" viewBox="0 0 20 20" fill="none"><rect x="4" y="9" width="12" height="8" rx="2" stroke="#9ca3af" stroke-width="1.5"/><path d="M7 9V6a3 3 0 016 0v3" stroke="#9ca3af" stroke-width="1.5" stroke-linecap="round"/></svg>
                    <input type="password" id="hostSignupPassword" class="rf-input" placeholder="Min 6 characters" required></div>
                </div>
            </form>
            <div style="height:20px"></div>
            <button type="submit" form="hostSignupForm" class="rf-cta-btn">Create Host Account →</button>`}

            <div class="rf-cta-note" style="margin-top:14px">🔒 Your Host ID will be shown after signup — save it!</div>
        </div>
    </div>`;
}

// ── HOST FLOW (9 steps) ────────────────────────────────────────────────────────
const HOST_STEPS=['Election Details','Organizer Info','Add Candidates','Ballot Config','Security','Results','Notifications','Review'];

function renderHostFlow() {
    const fns=[renderHostStep1,renderHostStep2,renderHostStep4,renderHostStep5,renderHostStep6,renderHostStep7,renderHostStep8,renderHostStep9];
    const pct=((state.hostStep-1)/(HOST_STEPS.length-1))*100;
    return `
    <div class="host-page">
        <div class="host-topbar">
            <button class="host-back-btn" id="hostNavBack">← HOST ELECTION</button>
            <div class="host-step-tabs">${HOST_STEPS.map((l,i)=>`<button class="host-tab ${state.hostStep===i+1?'active':''}" data-hstep="${i+1}">${l.toUpperCase()}</button>`).join('')}</div>
        </div>
        <div class="host-step-meta">
            <div class="host-step-num">STEP ${state.hostStep} OF ${HOST_STEPS.length}</div>
            <div class="host-step-title">${HOST_STEPS[state.hostStep-1].toUpperCase()}</div>
            <div class="host-progress-bar"><div class="host-progress-fill" style="width:${pct}%"></div></div>
        </div>
        <div class="host-body">${fns[state.hostStep-1]()}</div>
    </div>`;
}

function hostNavBtns(isLast=false) {
    return `<div class="host-nav-btns">${state.hostStep>1?`<button class="host-btn-prev" id="hostPrev">PREVIOUS</button>`:`<div></div>`}<button class="host-btn-next" id="hostNext">${isLast?'SUBMIT ELECTION':'NEXT'}</button></div>`;
}

function renderHostStep1() {
    const d=state.hostData;
    return `<div class="hs-section">
        <div class="hs-title">ELECTION DETAILS</div><div class="hs-sub">Provide basic information about your election</div>
        <div class="hs-field"><label class="hs-label">Election Name</label><input class="hs-input" id="h_electionName" placeholder="e.g., Student Council Election 2026" value="${d.electionName}"></div>
        <div class="hs-field"><label class="hs-label">Election Type</label>
            <select class="hs-input hs-select" id="h_electionType">${['College','School','Corporate','Government','Community','Other'].map(t=>`<option ${d.electionType===t?'selected':''}>${t}</option>`).join('')}</select>
        </div>
        <div class="hs-field"><label class="hs-label">Description / Purpose</label><textarea class="hs-input hs-textarea" id="h_description" placeholder="Brief description of the election">${d.description}</textarea></div>
        <div class="hs-field"><label class="hs-label">Start Date &amp; Time</label><input type="datetime-local" class="hs-input" id="h_startDate" value="${d.startDate}"></div>
        <div class="hs-field"><label class="hs-label">End Date &amp; Time</label><input type="datetime-local" class="hs-input" id="h_endDate" value="${d.endDate}"></div>
    </div>${hostNavBtns()}`;
}

function renderHostStep2() {
    const d=state.hostData;
    return `<div class="hs-section">
        <div class="hs-title">ORGANIZER INFORMATION</div><div class="hs-sub">Enter admin and organization details</div>
        <div class="hs-field"><label class="hs-label">Admin Name</label><input class="hs-input" id="h_adminName" placeholder="Full name of the administrator" value="${d.adminName}"></div>
        <div class="hs-field"><label class="hs-label">Organization / Institution</label><input class="hs-input" id="h_organization" placeholder="Name of the organizing body" value="${d.organization}"></div>
        <div class="hs-field"><label class="hs-label">Admin Email</label><input type="email" class="hs-input" id="h_adminEmail" placeholder="admin@example.com" value="${d.adminEmail}"></div>
        <div class="hs-field"><label class="hs-label">Admin Phone Number</label><input type="tel" class="hs-input" id="h_adminPhone" placeholder="+1 234 567 8900" value="${d.adminPhone}"></div>
    </div>${hostNavBtns()}`;
}

function renderHostStep4() {
    const d=state.hostData;
    return `<div class="hs-section">
        <div class="hs-title">ADD CANDIDATES</div><div class="hs-sub">Add candidates running in this election</div>
        <div class="hs-list-box">
            ${d.candidates.length===0?`<div class="hs-empty"><svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M9 12h6M12 9v6" stroke="#9ca3af" stroke-width="1.5" stroke-linecap="round"/><rect x="3" y="3" width="18" height="18" rx="3" stroke="#9ca3af" stroke-width="1.5"/></svg><div>No candidates added yet</div></div>`
            :d.candidates.map((c,i)=>`<div class="hs-list-item"><div class="hs-list-avatar" style="background:#f0fdfb;color:#00b896">${c.symbol}</div><div><div class="hs-list-name">${c.name}</div><div class="hs-list-sub">${c.party}</div></div><button class="hs-remove-btn" data-remove-cand="${i}">✕</button></div>`).join('')}
        </div>
        <div class="hs-add-row">
            <input class="hs-mini-input" id="h_candName" placeholder="Candidate name">
            <input class="hs-mini-input" id="h_candParty" placeholder="Party / affiliation">
            <input class="hs-mini-input" style="width:80px;flex:none" id="h_candSymbol" placeholder="🗳️" maxlength="2">
            <button class="hs-add-btn" id="addCandBtn">+ ADD CANDIDATE</button>
        </div>
    </div>${hostNavBtns()}`;
}

function renderHostStep5() {
    const d=state.hostData;
    return `<div class="hs-section">
        <div class="hs-title">BALLOT CONFIGURATION</div><div class="hs-sub">Configure voting rules and ballot settings</div>
        <div class="hs-info-card"><div class="hs-ic-icon" style="background:#f0fdfb">📋</div><div><div class="hs-ic-label">Candidates on Ballot</div><div class="hs-ic-val">${d.candidates.length} candidates</div></div></div>
        <div class="hs-info-card"><div class="hs-ic-icon" style="background:#f0fdfb">⚖️</div><div><div class="hs-ic-label">Voting Rule</div><div class="hs-ic-val">One vote per voter</div></div></div>
    </div>${hostNavBtns()}`;
}

function renderHostStep6() {
    const d=state.hostData;
    return `<div class="hs-section">
        <div class="hs-title">SECURITY SETTINGS</div><div class="hs-sub">Configure authentication and encryption</div>
        <div class="hs-field"><label class="hs-label">Authentication Method</label>
            <select class="hs-input hs-select" id="h_authMethod">${['OTP','Password','Biometric'].map(m=>`<option ${d.authMethod===m?'selected':''}>${m}</option>`).join('')}</select>
        </div>
        <div class="hs-toggle-row"><div><div class="hs-toggle-label">Enable Biometric Verification</div><div class="hs-toggle-sub">Require face or fingerprint scan</div></div>
        <button type="button" class="rf-toggle ${d.biometric?'on':''}" id="h_bioToggle"></button></div>
        <div class="hs-info-card" style="margin-top:20px"><div class="hs-ic-icon" style="background:#f0fdfb">🔐</div><div><div class="hs-ic-label">Encryption</div><div class="hs-ic-val">AES-256 (always enabled)</div></div></div>
    </div>${hostNavBtns()}`;
}

function renderHostStep7() {
    const d=state.hostData;
    return `<div class="hs-section">
        <div class="hs-title">RESULTS SETTINGS</div><div class="hs-sub">Configure when and how results are displayed</div>
        <div class="hs-field"><label class="hs-label">Result Visibility</label>
            <select class="hs-input hs-select" id="h_resultVis">${[['after-end','After voting ends'],['real-time','Real-time (live count)'],['manual','Manual release']].map(([v,l])=>`<option value="${v}" ${d.resultVisibility===v?'selected':''}>${l}</option>`).join('')}</select>
        </div>
        <div class="hs-info-card"><div class="hs-ic-icon" style="background:#fef9c3">📊</div><div><div class="hs-ic-label">Chart Type</div><div class="hs-ic-val">Bar chart + percentage breakdown</div></div></div>
        <div class="hs-info-card"><div class="hs-ic-icon" style="background:#f0fdfb">🔗</div><div><div class="hs-ic-label">Blockchain Audit</div><div class="hs-ic-val">Full chain available to host</div></div></div>
    </div>${hostNavBtns()}`;
}

function renderHostStep8() {
    const d=state.hostData;
    return `<div class="hs-section">
        <div class="hs-title">NOTIFICATIONS</div><div class="hs-sub">Configure alerts and communication settings</div>
        <div class="hs-toggle-row"><div><div class="hs-toggle-label">Send voter notifications</div><div class="hs-toggle-sub">Notify voters when election goes live</div></div>
        <button type="button" class="rf-toggle ${d.notifications?'on':''}" id="h_notifToggle"></button></div>
        <div class="hs-toggle-row"><div><div class="hs-toggle-label">Result announcement</div><div class="hs-toggle-sub">Notify all voters when results are published</div></div>
        <button type="button" class="rf-toggle on" id="h_resultNotifToggle"></button></div>
        <div class="hs-toggle-row" style="border-bottom:none"><div><div class="hs-toggle-label">Admin reminders</div><div class="hs-toggle-sub">Reminders before election starts/ends</div></div>
        <button type="button" class="rf-toggle on" id="h_reminderToggle"></button></div>
    </div>${hostNavBtns()}`;
}

function renderHostStep9() {
    const d=state.hostData;
    return `<div class="hs-section">
        <div class="hs-title">REVIEW</div><div class="hs-sub">Review all settings before submitting your election</div>
        <div class="hs-review-card">
            <div class="hs-review-section-title">ELECTION</div>
            <div class="hs-review-row"><span>Name</span><span>${d.electionName||'Not provided'}</span></div>
            <div class="hs-review-row"><span>Type</span><span>${d.electionType}</span></div>
            <div class="hs-review-row"><span>Start</span><span>${d.startDate?new Date(d.startDate).toLocaleString():'Not set'}</span></div>
            <div class="hs-review-row"><span>End</span><span>${d.endDate?new Date(d.endDate).toLocaleString():'Not set'}</span></div>
        </div>
        <div class="hs-review-card">
            <div class="hs-review-section-title">ORGANIZER</div>
            <div class="hs-review-row"><span>Admin</span><span>${d.adminName||'Not provided'}</span></div>
            <div class="hs-review-row"><span>Organization</span><span>${d.organization||'Not provided'}</span></div>
            <div class="hs-review-row"><span>Email</span><span>${d.adminEmail||'Not provided'}</span></div>
        </div>
        <div class="hs-review-card">
            <div class="hs-review-section-title">PARTICIPANTS</div>
            <div class="hs-review-row"><span>Total Voters</span><span>${d.voters.length}</span></div>
            <div class="hs-review-row"><span>Total Candidates</span><span>${d.candidates.length}</span></div>
        </div>
        <div class="hs-review-card">
            <div class="hs-review-section-title">SECURITY</div>
            <div class="hs-review-row"><span>Auth Method</span><span>${d.authMethod}</span></div>
            <div class="hs-review-row"><span>Biometric</span><span>${d.biometric?'Enabled':'Disabled'}</span></div>
            <div class="hs-review-row"><span>Encryption</span><span>AES-256</span></div>
        </div>
    </div>${hostNavBtns(true)}`;
}

// ── HOST DASHBOARD ─────────────────────────────────────────────────────────────
function renderHostDashboard() {
    return `
    <div class="page">
        <div class="dash-topbar">
            <div class="dash-brand">SARVAMAT // HOST<span>Welcome, ${state.hostUser?.name||'Host'}</span></div>
            <button class="logout-link" id="hostLogoutBtn">Logout</button>
        </div>
        <div class="dash-body">
            <div class="voter-card" style="margin-bottom:24px">
                <div class="voter-card-grid">
                    <div><div class="voter-stat-label">Host ID</div><div class="voter-stat-val">${state.hostUser?.hostId||'N/A'}</div></div>
                    <div><div class="voter-stat-label">Name</div><div class="voter-stat-val">${state.hostUser?.name||'Host'}</div></div>
                    <div><div class="voter-stat-label">Elections</div><div class="voter-stat-val">${state.elections.length}</div></div>
                </div>
                <div style="margin-top:10px;padding-top:10px;border-top:1px solid #f3f4f6;font-size:0.75rem;color:#6b7280">
                    🔑 Save your Host ID: <strong style="color:#111;user-select:all">${state.hostUser?.hostId}</strong> — you'll need it to login next time
                </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:28px">
                <button class="rf-cta-btn" id="createElectionBtn" style="margin:0;padding:14px">+ Create New Election</button>
                <button class="rf-cta-btn" id="viewResultsBtn" style="margin:0;padding:14px;background:#065f46">📊 View Results</button>
            </div>
            <div class="dash-section-label"><span>ALL ELECTIONS</span></div>
            <div class="election-list">
                ${state.elections.length===0?'<div class="col-empty-msg" style="padding:20px">No elections yet. Create one above.</div>'
                :state.elections.map(e=>{
                    const eff=getEffectiveStatus(e);
                    return `
                <div class="election-item">
                    <div class="election-item-top">
                        ${eff==='active'?'<span class="live-badge">LIVE</span>':eff==='upcoming'?'<span class="upcoming-badge">UPCOMING</span>':'<span class="ended-badge">ENDED</span>'}
                        <span class="election-time">${e.end_time?timeRemaining(e.end_time):''}</span>
                    </div>
                    <div class="election-name">${e.name}</div>
                    <div style="font-size:0.75rem;color:#6b7280;margin-top:4px">
                        ${e.start_time?'Starts: '+new Date(e.start_time).toLocaleString():''} 
                        ${e.end_time?'&nbsp;→&nbsp; Ends: '+new Date(e.end_time).toLocaleString():''}
                    </div>
                </div>`}).join('')}
            </div>
        </div>
    </div>`;
}

// ── HOST RESULTS ───────────────────────────────────────────────────────────────
function renderHostResults() {
    return `
    <div class="page">
        <div class="dash-topbar"><div class="dash-brand">SARVAMAT // RESULTS<span>Election Results</span></div>
        <button class="btn-outline" id="backToHostDash">← Dashboard</button></div>
        <div class="dash-body"><div id="resultsContent"><div style="text-align:center;padding:40px;color:#6b7280">Loading results...</div></div></div>
    </div>`;
}

function buildResultsHTML(results, candidates) {
    const total=results.totalVotes||0, counts=results.results||{};
    const sorted=candidates.map(c=>({...c,votes:counts[c.name]||0})).sort((a,b)=>b.votes-a.votes);
    const winner=sorted[0], maxVotes=winner?.votes||1;
    return `
    <div class="results-winner-card">
        <div class="results-winner-icon">🏆</div>
        <div class="results-winner-label">WINNER</div>
        <div class="results-winner-name">${total===0?'No votes cast yet':(winner?.name||'N/A')}</div>
        ${total>0?`<div class="results-winner-party">${winner?.party||''}</div>`:''}
        <div class="results-total-badge">${total} total vote${total!==1?'s':''}</div>
    </div>
    <div class="results-chart-card">
        <div class="results-chart-title">VOTE DISTRIBUTION</div>
        ${sorted.map((c,i)=>{
            const pct=total>0?((c.votes/total)*100).toFixed(1):0;
            const barW=total>0?((c.votes/maxVotes)*100):0;
            return `<div class="results-bar-row">
                <div class="results-bar-meta">
                    <div class="results-bar-left">
                        <span class="results-bar-rank">#${i+1}</span>
                        ${i===0&&total>0?`<span style="font-size:1.1rem">🏆</span>`:''}
                        <span class="results-bar-name">${c.name}</span>
                        <span class="results-bar-party">${c.party}</span>
                    </div>
                    <div class="results-bar-right"><span class="results-bar-votes">${c.votes} votes</span><span class="results-bar-pct">${pct}%</span></div>
                </div>
                <div class="results-bar-track"><div class="results-bar-fill ${i===0?'winner':''}" style="width:${barW}%"></div></div>
            </div>`;
        }).join('')}
    </div>
    <div class="results-meta-card">
        <div class="results-meta-row"><span>Blockchain Valid</span><span style="color:${results.chainValid?'#22c55e':'#ef4444'}">${results.chainValid?'✅ Valid':'❌ Invalid'}</span></div>
        <div class="results-meta-row"><span>Total Votes Cast</span><span>${total}</span></div>
        <div class="results-meta-row"><span>Encryption</span><span>AES-256</span></div>
    </div>`;
}

// ── CAMERA ─────────────────────────────────────────────────────────────────────
async function initCamera() {
    if(state.faceCaptured) return;
    try {
        const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user'}});
        state.faceStream=stream;
        const vid=document.getElementById('cameraFeed');
        if(vid){vid.srcObject=stream;vid.onloadedmetadata=()=>{
            const st=document.getElementById('camStatusText');if(st)st.textContent='Face detected — click to capture';
            const btn=document.getElementById('captureFaceBtn');if(btn)btn.disabled=false;
        };}
    } catch {
        const st=document.getElementById('camStatusText');if(st)st.textContent='Camera denied — click to simulate';
        const btn=document.getElementById('captureFaceBtn');if(btn){btn.disabled=false;btn.textContent='Simulate Capture';}
    }
}
function stopCamera(){if(state.faceStream){state.faceStream.getTracks().forEach(t=>t.stop());state.faceStream=null;}}

// ── LISTENERS ──────────────────────────────────────────────────────────────────
function attachListeners() {
    // Role
    document.getElementById('chooseVoter')?.addEventListener('click',()=>{state.role='voter';state.currentPage='login';render();});
    document.getElementById('chooseHost')?.addEventListener('click',()=>{state.role='host';state.currentPage='host-login';render();});
    document.querySelectorAll('#backToRole').forEach(el=>el.addEventListener('click',()=>{state.currentPage='role-select';render();}));

    // Voter auth
    document.getElementById('loginForm')?.addEventListener('submit',handleLogin);
    document.getElementById('goRegister')?.addEventListener('click',()=>{state.currentPage='register-step1';render();});
    document.getElementById('forgotLink')?.addEventListener('click',()=>{state.currentPage='forgot';render();});
    document.getElementById('regStep1Form')?.addEventListener('submit',handleRegStep1);
    document.getElementById('goLogin')?.addEventListener('click',()=>{state.currentPage='login';render();});
    document.getElementById('bioToggle')?.addEventListener('click',()=>{state.biometricEnabled=!state.biometricEnabled;document.getElementById('bioToggle').classList.toggle('on',state.biometricEnabled);});
    document.getElementById('sendOtpBtn')?.addEventListener('click',()=>handleSendOtp('signup'));
    document.getElementById('signupOtp')?.addEventListener('input',e=>{const btn=document.getElementById('verifyOtpBtn');if(btn)btn.disabled=e.target.value.length!==6;});
    document.getElementById('verifyOtpBtn')?.addEventListener('click',handleVerifyOtp);
    document.getElementById('backToStep1')?.addEventListener('click',()=>{state.currentPage='register-step1';render();});
    document.getElementById('captureFaceBtn')?.addEventListener('click',()=>{stopCamera();state.faceCaptured=true;showToast('Face captured!','success');render();});
    document.getElementById('toStep4Btn')?.addEventListener('click',()=>{state.currentPage='register-step4-bio';render();});
    document.getElementById('backToStep2')?.addEventListener('click',()=>{state.currentPage='register-step2-otp';render();});
    document.getElementById('scanFpBtn')?.addEventListener('click',()=>{
        const sensor=document.getElementById('fpSensor'),hint=document.getElementById('fpHint'),btn=document.getElementById('scanFpBtn');
        if(sensor)sensor.classList.add('scanning');if(hint)hint.textContent='Scanning... hold still';if(btn){btn.disabled=true;btn.textContent='Scanning...';}
        setTimeout(()=>{state.fingerprintCaptured=true;showToast('Fingerprint registered!','success');render();},2200);
    });
    document.getElementById('completeBioBtn')?.addEventListener('click',async()=>{await loadAllElections();state.currentPage='voter-dashboard';render();});
    document.getElementById('backToStep3')?.addEventListener('click',()=>{state.currentPage='register-step3-face';render();});
    document.getElementById('backToLoginLink')?.addEventListener('click',()=>{state.currentPage='login';render();});
    document.getElementById('sendResetOtp')?.addEventListener('click',()=>handleSendOtp('reset'));
    document.getElementById('resetOtp')?.addEventListener('input',e=>{const btn=document.getElementById('resetBtn');if(btn&&document.getElementById('newPasswordGroup')?.classList.contains('hidden'))btn.disabled=e.target.value.length!==6;});
    document.getElementById('resetForm')?.addEventListener('submit',handleResetPassword);

    // Election tabs
    document.querySelectorAll('.dash-tab-btn').forEach(btn=>btn.addEventListener('click',()=>{state.electionTab=btn.dataset.tab;render();}));

    // Election search
    document.getElementById('electionSearchBtn')?.addEventListener('click',()=>{state.electionSearch=document.getElementById('electionSearchInput')?.value||'';render();});
    document.getElementById('electionSearchInput')?.addEventListener('keydown',e=>{if(e.key==='Enter'){state.electionSearch=e.target.value;render();}});
    document.getElementById('electionClearBtn')?.addEventListener('click',()=>{state.electionSearch='';render();});

    // Voter dashboard
    document.getElementById('logoutBtn')?.addEventListener('click',handleLogout);
    document.querySelectorAll('.ec-click,.view-cand-btn').forEach(el=>{
        el.addEventListener('click',async(ev)=>{ev.stopPropagation();
            const eid = el.dataset.eid;
            const isDummy = String(eid).startsWith('d');
            if(isDummy) {
                state.selectedElection = DUMMY_ELECTIONS.find(e=>e.id===eid);
                state.selectedCandidate = null;
                // Use candidates defined directly on the dummy election, give them fake ids
                state.candidates = (state.selectedElection?.candidates||[]).map((c,i)=>({...c, id:i+1, symbol:''}));
                state.currentPage='election-detail'; render();
            } else {
                const numId = parseInt(eid);
                state.selectedElection = state.elections.find(e=>e.id===numId||String(e.id)===String(eid));
                state.selectedCandidate = null;
                await loadCandidates(numId);
                state.currentPage='election-detail'; render();
            }
        });
    });
    document.querySelectorAll('.candidate-row').forEach(row=>{
        row.addEventListener('click',()=>{state.selectedCandidate=state.candidates.find(c=>c.id===parseInt(row.dataset.cid));render();});
    });
    const voteBar=document.getElementById('castVoteBar');
    if(voteBar&&!voteBar.classList.contains('disabled'))voteBar.addEventListener('click',handleVote);
    document.getElementById('backToDash')?.addEventListener('click',()=>{state.currentPage='voter-dashboard';state.selectedElection=null;state.selectedCandidate=null;render();});
    document.querySelectorAll('.admin-tag[data-status]').forEach(btn=>btn.addEventListener('click',()=>handleStatusChange(btn.dataset.status)));

    // Host login / signup tabs
    document.getElementById('tabLogin')?.addEventListener('click',()=>{state.hostAuthTab='login';render();});
    document.getElementById('tabSignup')?.addEventListener('click',()=>{state.hostAuthTab='signup';render();});
    document.getElementById('hostLoginForm')?.addEventListener('submit',handleHostLogin);
    document.getElementById('hostSignupForm')?.addEventListener('submit',handleHostSignup);

    // Host flow
    document.getElementById('hostNavBack')?.addEventListener('click',()=>{if(state.hostStep>1){state.hostStep--;render();}else{state.currentPage='host-dashboard';render();}});
    document.querySelectorAll('.host-tab').forEach(tab=>tab.addEventListener('click',()=>{state.hostStep=parseInt(tab.dataset.hstep);render();}));
    document.getElementById('hostNext')?.addEventListener('click',handleHostNext);
    document.getElementById('hostPrev')?.addEventListener('click',()=>{state.hostStep--;render();});
    document.querySelectorAll('[data-remove-voter]').forEach(btn=>btn.addEventListener('click',()=>{state.hostData.voters.splice(parseInt(btn.dataset.removeVoter),1);render();}));
    document.getElementById('addCandBtn')?.addEventListener('click',()=>{
        const name=document.getElementById('h_candName')?.value?.trim(),party=document.getElementById('h_candParty')?.value?.trim(),symbol=document.getElementById('h_candSymbol')?.value?.trim()||'🗳️';
        if(!name||!party){showToast('Enter candidate name and party','error');return;}
        state.hostData.candidates.push({name,party,symbol,id:Date.now()});render();
    });
    document.querySelectorAll('[data-remove-cand]').forEach(btn=>btn.addEventListener('click',()=>{state.hostData.candidates.splice(parseInt(btn.dataset.removeCand),1);render();}));
    document.getElementById('h_bioToggle')?.addEventListener('click',()=>{state.hostData.biometric=!state.hostData.biometric;document.getElementById('h_bioToggle').classList.toggle('on',state.hostData.biometric);});
    document.getElementById('h_notifToggle')?.addEventListener('click',()=>{state.hostData.notifications=!state.hostData.notifications;document.getElementById('h_notifToggle').classList.toggle('on',state.hostData.notifications);});

    // Host dashboard
    document.getElementById('hostLogoutBtn')?.addEventListener('click',handleLogout);
    document.getElementById('createElectionBtn')?.addEventListener('click',()=>{state.hostStep=1;state.hostData={electionName:'',electionType:'College',description:'',startDate:'',endDate:'',adminName:'',organization:'',adminEmail:'',adminPhone:'',voters:[],candidates:[],votingRule:'one-per-voter',authMethod:'OTP',biometric:false,resultVisibility:'after-end',notifications:true};state.currentPage='host-flow';render();});
    document.getElementById('viewResultsBtn')?.addEventListener('click',async()=>{
        state.currentPage='host-results';render();
        try{
            const r = await apiCall(`/api/host/results?hostId=${state.hostUser?.hostId}`);
            document.getElementById('resultsContent').innerHTML=buildResultsHTML(r, r.candidates||[]);
        }
        catch{document.getElementById('resultsContent').innerHTML='<div style="padding:20px;color:#ef4444">Failed to load results</div>';}
    });
    document.getElementById('backToHostDash')?.addEventListener('click',()=>{state.currentPage='host-dashboard';render();});
    document.querySelectorAll('[data-set-status]').forEach(btn=>btn.addEventListener('click',async()=>{
        try{await apiCall('/api/election/status','POST',{status:btn.dataset.newStatus});await loadAllElections();showToast(`Set to ${btn.dataset.newStatus}`,'success');render();}catch{}
    }));
}

// ── HANDLERS ───────────────────────────────────────────────────────────────────
async function handleLogin(e){e.preventDefault();try{const r=await apiCall('/api/login','POST',{phone:document.getElementById('loginPhone').value,password:document.getElementById('loginPassword').value});state.user=r.user;await loadAllElections();try{const v=await apiCall(`/api/user/voted-elections?userId=${r.user.id}`);state.votedElections=v.electionIds||[];}catch{state.votedElections=[];}state.currentPage='voter-dashboard';showToast('Login successful!','success');render();}catch{}}
function handleRegStep1(e){e.preventDefault();const name=document.getElementById('regName').value,aadhar=document.getElementById('regAadhar').value,dob=document.getElementById('regDob').value,password=document.getElementById('regPassword').value,phone=document.getElementById('regPhone').value;if(phone.length!==10){showToast('Phone must be 10 digits','error');return;}if(aadhar.length!==12){showToast('Aadhar must be 12 digits','error');return;}if(!dob){showToast('Please enter date of birth','error');return;}state.signupData={name,aadhar,dob,password,phone};state.currentPage='register-step2-otp';render();}
async function handleSendOtp(purpose){const phone=purpose==='signup'?state.signupData.phone:document.getElementById('resetPhone')?.value;if(!phone||phone.length!==10){showToast('Invalid phone number','error');return;}try{await apiCall('/api/send-otp','POST',{phone,purpose});showToast('OTP sent! Check server console.','success');}catch{}}
async function handleVerifyOtp(){const otp=document.getElementById('signupOtp').value,phone=state.signupData.phone;try{await apiCall('/api/verify-otp','POST',{phone,otp,purpose:'signup'});const r=await apiCall('/api/signup','POST',{name:state.signupData.name,dob:state.signupData.dob,phone,aadhar:state.signupData.aadhar,password:state.signupData.password});state.user=r.user;showToast('Account created!','success');state.currentPage='register-step3-face';state.faceCaptured=false;state.fingerprintCaptured=false;render();}catch{}}
async function handleResetPassword(e){e.preventDefault();const phone=document.getElementById('resetPhone').value,otp=document.getElementById('resetOtp').value,newPassword=document.getElementById('newPassword')?.value;if(!otp){showToast('Enter OTP','error');return;}try{await apiCall('/api/verify-otp','POST',{phone,otp,purpose:'reset'});const npg=document.getElementById('newPasswordGroup'),btn=document.getElementById('resetBtn');if(npg.classList.contains('hidden')){npg.classList.remove('hidden');btn.disabled=false;btn.textContent='Set New Password →';showToast('OTP verified!','success');return;}if(!newPassword){showToast('Enter new password','error');return;}await apiCall('/api/reset-password','POST',{phone,newPassword});showToast('Password reset!','success');state.currentPage='login';render();}catch{}}
function handleLogout(){stopCamera();state.user=null;state.hostUser=null;state.selectedCandidate=null;state.selectedElection=null;state.votedElections=[];state.currentPage='role-select';state.faceCaptured=false;state.fingerprintCaptured=false;showToast('Logged out','success');render();}
async function handleVote(){if(!state.selectedCandidate){showToast('Select a candidate first','error');return;}try{const r=await apiCall('/api/vote','POST',{userId:state.user.id,candidateId:state.selectedCandidate.id});if(!state.votedElections)state.votedElections=[];state.votedElections.push(r.electionId);console.log(`\x1b[32m Block Hash: ${r.blockHash}\x1b[0m`);showToast(`Vote cast for ${r.candidate}! ✅`,'success');render();}catch{}}
async function handleStatusChange(status){try{await apiCall('/api/election/status','POST',{status});await loadAllElections();if(state.selectedElection)state.selectedElection=state.elections.find(e=>e.id===state.selectedElection.id)||null;showToast(`Election → ${status}`,'success');render();}catch{}}
async function handleHostLogin(e){e.preventDefault();const hostId=document.getElementById('hostId').value,password=document.getElementById('hostPassword').value;try{const r=await apiCall('/api/host/login','POST',{hostId,password});state.hostUser=r.host;await loadAllElections();state.currentPage='host-dashboard';showToast(`Welcome back, ${r.host.name}!`,'success');render();}catch{}}
async function handleHostSignup(e){e.preventDefault();const name=document.getElementById('hostName').value,email=document.getElementById('hostEmail').value,password=document.getElementById('hostSignupPassword').value;try{const r=await apiCall('/api/host/register','POST',{name,email,password});state.hostUser=r.host;await loadAllElections();state.currentPage='host-dashboard';showToast(`Account created! Your Host ID: ${r.host.hostId} — save this!`,'success');render();}catch{}}
function hostSaveStep(){const d=state.hostData,get=id=>document.getElementById(id)?.value||'';switch(state.hostStep){case 1:d.electionName=get('h_electionName');d.electionType=get('h_electionType');d.description=get('h_description');d.startDate=get('h_startDate');d.endDate=get('h_endDate');break;case 2:d.adminName=get('h_adminName');d.organization=get('h_organization');d.adminEmail=get('h_adminEmail');d.adminPhone=get('h_adminPhone');break;case 6:d.authMethod=get('h_authMethod');break;case 7:d.resultVisibility=get('h_resultVis');break;}}
async function handleHostNext(){hostSaveStep();if(state.hostStep===8){if(!state.hostData.electionName){showToast('Election name is required','error');state.hostStep=1;render();return;}try{const r=await apiCall('/api/host/create-election','POST',{...state.hostData,hostId:state.hostUser?.hostId});state.createdElectionId=r.electionId;await loadAllElections();showToast('Election created! 🎉','success');state.currentPage='host-dashboard';render();}catch{}return;}state.hostStep++;render();}
async function loadAllElections(){
    try {
        if(state.hostUser) {
            const r=await apiCall(`/api/host/elections?hostId=${state.hostUser.hostId}`);
            state.elections=r.elections||[];
        } else {
            const r=await apiCall('/api/elections');
            state.elections=r.elections||[];
        }
    } catch {
        try{const r=await apiCall('/api/election/status');state.elections=r.election?[r.election]:[];}
        catch{state.elections=[];}
    }
}
async function loadCandidates(electionId){try{const r=await apiCall(`/api/candidates?electionId=${electionId||''}`);state.candidates=r.candidates||[];}catch{state.candidates=[];}}

window.closeModal=()=>render();
render();
