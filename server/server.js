const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const Blockchain = require('../blockchain/blockchain');

const app = express();
const PORT = 3000;

// Initialize Blockchain
const voteChain = new Blockchain();
console.log('\n🗳️  SarvaMat Voting System Started');
console.log('📦 Blockchain initialized with Genesis Block\n');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Initialize SQLite Database
const db = new sqlite3.Database(path.join(__dirname, 'voters.db'), (err) => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('✅ Connected to SQLite database');
        initializeDatabase();
    }
});

function initializeDatabase() {
    // Users table
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            dob TEXT,
            phone TEXT UNIQUE NOT NULL,
            aadhar TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            has_voted INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // OTP table
    db.run(`
        CREATE TABLE IF NOT EXISTS otps (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            phone TEXT NOT NULL,
            otp TEXT NOT NULL,
            purpose TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            expires_at DATETIME
        )
    `);

    // Elections table
    db.run(`
        CREATE TABLE IF NOT EXISTS elections (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            status TEXT DEFAULT 'upcoming',
            start_time DATETIME,
            end_time DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, () => {
        // Insert default election if not exists
        db.get('SELECT * FROM elections WHERE id = 1', (err, row) => {
            if (!row) {
                db.run(`
                    INSERT INTO elections (name, status, start_time, end_time)
                    VALUES ('General Election 2024', 'active', datetime('now'), datetime('now', '+7 days'))
                `);
            }
        });
    });

    // Candidates table
    db.run(`
        CREATE TABLE IF NOT EXISTS candidates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            party TEXT NOT NULL,
            symbol TEXT,
            election_id INTEGER,
            FOREIGN KEY (election_id) REFERENCES elections(id)
        )
    `, () => {
        // Insert default candidates if not exists
        db.get('SELECT * FROM candidates WHERE id = 1', (err, row) => {
            if (!row) {
                const candidates = [
                    ['Rajesh Kumar', 'Bharatiya Janata Party', '🪷'],
                    ['Priya Sharma', 'Indian National Congress', '✋'],
                    ['Amit Singh', 'Aam Aadmi Party', '🧹'],
                    ['Sunita Devi', 'Bahujan Samaj Party', '🐘'],
                    ['Vikram Yadav', 'Independent', '⭐']
                ];
                candidates.forEach(([name, party, symbol]) => {
                    db.run('INSERT INTO candidates (name, party, symbol, election_id) VALUES (?, ?, ?, 1)',
                        [name, party, symbol]);
                });
            }
        });
    });
}

// Generate OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// ==================== AUTH ROUTES ====================

// Send OTP for signup
app.post('/api/send-otp', (req, res) => {
    const { phone, purpose } = req.body;

    if (!phone || phone.length !== 10) {
        return res.status(400).json({ error: 'Invalid phone number' });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    db.run(
        'INSERT INTO otps (phone, otp, purpose, expires_at) VALUES (?, ?, ?, ?)',
        [phone, otp, purpose, expiresAt.toISOString()],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to generate OTP' });
            }

            // Print OTP to console (in production, send via SMS)
            console.log('\n\x1b[43m\x1b[30m ======================================== \x1b[0m');
            console.log('\x1b[43m\x1b[30m           📱  OTP GENERATED              \x1b[0m');
            console.log('\x1b[43m\x1b[30m ======================================== \x1b[0m');
            console.log(`\x1b[36m  Phone   :\x1b[0m \x1b[97m${phone}\x1b[0m`);
            console.log(`\x1b[36m  Purpose :\x1b[0m \x1b[97m${purpose}\x1b[0m`);
            console.log(`\x1b[32m  OTP     :\x1b[0m \x1b[1m\x1b[97m${otp}\x1b[0m  <-- USE THIS`);
            console.log(`\x1b[36m  Expires :\x1b[0m \x1b[97m${expiresAt.toLocaleString()}\x1b[0m`);
            console.log('\x1b[43m\x1b[30m ======================================== \x1b[0m\n');

            res.json({ success: true, message: 'OTP sent successfully (check console)' });
        }
    );
});

// Verify OTP
app.post('/api/verify-otp', (req, res) => {
    const { phone, otp, purpose } = req.body;

    db.get(
        `SELECT * FROM otps WHERE phone = ? AND otp = ? AND purpose = ? 
         AND datetime(expires_at) > datetime('now') 
         ORDER BY created_at DESC LIMIT 1`,
        [phone, otp, purpose],
        (err, row) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            if (!row) {
                return res.status(400).json({ error: 'Invalid or expired OTP' });
            }

            // Delete used OTP
            db.run('DELETE FROM otps WHERE id = ?', [row.id]);

            res.json({ success: true, verified: true });
        }
    );
});

// Signup
app.post('/api/signup', (req, res) => {
    const { name, dob, phone, aadhar, password } = req.body;

    // Validation
    if (!name || !phone || !aadhar || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    if (phone.length !== 10) {
        return res.status(400).json({ error: 'Phone number must be 10 digits' });
    }

    if (aadhar.length !== 12) {
        return res.status(400).json({ error: 'Aadhar number must be 12 digits' });
    }

    // Check if user exists
    db.get('SELECT * FROM users WHERE phone = ? OR aadhar = ?', [phone, aadhar], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (row) {
            if (row.phone === phone) {
                return res.status(400).json({ error: 'Phone number already registered' });
            }
            if (row.aadhar === aadhar) {
                return res.status(400).json({ error: 'Aadhar number already registered' });
            }
        }

        // Insert new user
        db.run(
            'INSERT INTO users (name, dob, phone, aadhar, password) VALUES (?, ?, ?, ?, ?)',
            [name, dob, phone, aadhar, password],
            function(err) {
                if (err) {
                    return res.status(500).json({ error: 'Failed to create account' });
                }

                console.log(`\n✅ New user registered: ${name} (${phone})\n`);

                res.json({
                    success: true,
                    user: {
                        id: this.lastID,
                        name,
                        phone,
                        has_voted: 0
                    }
                });
            }
        );
    });
});

// Login
app.post('/api/login', (req, res) => {
    const { phone, password } = req.body;

    if (!phone || !password) {
        return res.status(400).json({ error: 'Phone and password are required' });
    }

    db.get(
        'SELECT id, name, phone, has_voted FROM users WHERE phone = ? AND password = ?',
        [phone, password],
        (err, user) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            if (!user) {
                return res.status(401).json({ error: 'Invalid phone number or password' });
            }

            console.log(`\n✅ User logged in: ${user.name} (${user.phone})\n`);

            res.json({ success: true, user });
        }
    );
});

// Reset Password
app.post('/api/reset-password', (req, res) => {
    const { phone, newPassword } = req.body;

    db.run(
        'UPDATE users SET password = ? WHERE phone = ?',
        [newPassword, phone],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to reset password' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            console.log(`\n🔐 Password reset for phone: ${phone}\n`);

            res.json({ success: true, message: 'Password reset successfully' });
        }
    );
});

// ==================== ELECTION ROUTES ====================

// Get election status
app.get('/api/election/status', (req, res) => {
    db.get('SELECT * FROM elections WHERE id = 1', (err, election) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        res.json({
            success: true,
            election: election || { status: 'upcoming', name: 'No Active Election' }
        });
    });
});

// Update election status (admin)
app.post('/api/election/status', (req, res) => {
    const { status } = req.body;

    if (!['upcoming', 'active', 'ended'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    db.run('UPDATE elections SET status = ? WHERE id = 1', [status], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to update status' });
        }

        console.log(`\n🗳️  Election status changed to: ${status.toUpperCase()}\n`);

        res.json({ success: true, status });
    });
});

// Get candidates
app.get('/api/candidates', (req, res) => {
    db.all('SELECT * FROM candidates WHERE election_id = 1', (err, candidates) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        res.json({ success: true, candidates });
    });
});


// Get all elections
app.get('/api/elections', (req, res) => {
    db.all('SELECT * FROM elections', (err, elections) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ success: true, elections: elections || [] });
    });
});

// ==================== VOTING ROUTES ====================

// Cast vote
app.post('/api/vote', (req, res) => {
    const { userId, candidateId } = req.body;

    // Check if user has already voted
    db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (user.has_voted) {
            return res.status(400).json({ error: 'You have already voted!' });
        }

        // Check election status
        db.get('SELECT * FROM elections WHERE id = 1', (err, election) => {
            if (err || !election) {
                return res.status(500).json({ error: 'Election not found' });
            }
            if (election.status !== 'active') {
                return res.status(400).json({ error: 'Voting is not active' });
            }

            // Get candidate
            db.get('SELECT * FROM candidates WHERE id = ?', [candidateId], (err, candidate) => {
                if (err || !candidate) {
                    return res.status(404).json({ error: 'Candidate not found' });
                }

                // Create vote data for blockchain
                const voteData = {
                    visibleVoterId: `VOTER-${user.id.toString().padStart(4, '0')}`,
                    candidate: candidate.name,
                    party: candidate.party,
                    timestamp: new Date().toISOString(),
                    electionId: 1
                };

                // Add vote to blockchain
                const block = voteChain.addVote(voteData);

                // Mark user as voted
                db.run('UPDATE users SET has_voted = 1 WHERE id = ?', [userId], (err) => {
                    if (err) {
                        return res.status(500).json({ error: 'Failed to record vote' });
                    }

                    res.json({
                        success: true,
                        message: 'Vote recorded successfully!',
                        blockHash: block.hash,
                        candidate: candidate.name
                    });
                });
            });
        });
    });
});

// Get vote results
app.get('/api/results', (req, res) => {
    const counts = voteChain.getVoteCount();
    const votes = voteChain.getAllVotes();
    const isValid = voteChain.isChainValid();

    res.json({
        success: true,
        results: counts,
        totalVotes: votes.length,
        chainValid: isValid,
        votes: votes
    });
});

// Get blockchain info
app.get('/api/blockchain', (req, res) => {
    res.json({
        success: true,
        chainLength: voteChain.chain.length,
        isValid: voteChain.isChainValid(),
        chain: voteChain.chain.map(block => ({
            index: block.index,
            hash: block.hash,
            previousHash: block.previousHash,
            data: block.data,
            timestamp: block.timestamp
        }))
    });
});


// ==================== HOST ROUTES ====================

app.post('/api/host/register', (req, res) => {
    const hostId = `HOST-${String(Math.floor(Math.random()*99999)).padStart(5,'0')}`;
    const password = Math.random().toString(36).slice(2,10).toUpperCase();
    const name = 'Host User';
    db.run(`CREATE TABLE IF NOT EXISTS hosts (id INTEGER PRIMARY KEY AUTOINCREMENT, host_id TEXT UNIQUE NOT NULL, name TEXT, password TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`, () => {
        db.run('INSERT INTO hosts (host_id, name, password) VALUES (?,?,?)', [hostId, name, password], function(err) {
            if (err) return res.status(500).json({ error: 'Failed to create host' });
            console.log(`\n\x1b[33m HOST CREATED  ID: ${hostId}  Pass: ${password}\x1b[0m\n`);
            res.json({ success: true, host: { id: this.lastID, hostId, name, password } });
        });
    });
});

app.post('/api/host/login', (req, res) => {
    const { hostId, password } = req.body;
    db.run(`CREATE TABLE IF NOT EXISTS hosts (id INTEGER PRIMARY KEY AUTOINCREMENT, host_id TEXT UNIQUE NOT NULL, name TEXT, password TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`, () => {
        db.get('SELECT * FROM hosts WHERE host_id = ? AND password = ?', [hostId, password], (err, host) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            if (!host) return res.status(401).json({ error: 'Invalid Host ID or password' });
            res.json({ success: true, host: { id: host.id, hostId: host.host_id, name: host.name || 'Host' } });
        });
    });
});

app.post('/api/host/create-election', (req, res) => {
    const { electionName, electionType, description, startDate, endDate, candidates } = req.body;
    if (!electionName) return res.status(400).json({ error: 'Election name is required' });
    const start = startDate ? new Date(startDate).toISOString() : new Date().toISOString();
    const end   = endDate   ? new Date(endDate).toISOString()   : new Date(Date.now()+7*24*3600000).toISOString();
    db.run('ALTER TABLE elections ADD COLUMN description TEXT', ()=>{});
    db.run('INSERT INTO elections (name, status, start_time, end_time, description) VALUES (?,?,?,?,?)',
        [electionName, 'upcoming', start, end, description||''], function(err) {
            if (err) return res.status(500).json({ error: 'Failed to create election: '+err.message });
            const electionId = this.lastID;
            console.log(`\n\x1b[32m ELECTION CREATED: ${electionName} (ID: ${electionId})\x1b[0m\n`);
            if (candidates && candidates.length > 0) {
                const stmt = db.prepare('INSERT INTO candidates (name, party, symbol, election_id) VALUES (?,?,?,?)');
                candidates.forEach(c => stmt.run([c.name, c.party, c.symbol||'🗳️', electionId]));
                stmt.finalize();
            }
            res.json({ success: true, electionId });
        });
});


// Serve frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 Server running at http://localhost:${PORT}`);
    console.log('📊 Check console for OTPs and blockchain hashes\n');
});
