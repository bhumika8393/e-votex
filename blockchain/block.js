const crypto = require('crypto');

class Block {
    constructor(index, timestamp, data, previousHash = '') {
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.nonce = 0;
        this.hash = this.calculateHash();
    }

    calculateHash() {
        return crypto.createHash('sha256')
            .update(
                this.index +
                this.previousHash +
                this.timestamp +
                JSON.stringify(this.data) +
                this.nonce
            )
            .digest('hex');
    }

    mineBlock(difficulty) {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log('\n========================================');
        console.log('🔗 BLOCK MINED!');
        console.log('========================================');
        console.log('Block Hash:', this.hash);
        console.log('Previous Hash:', this.previousHash);
        console.log('Vote Data:', JSON.stringify(this.data, null, 2));
        console.log('========================================\n');
    }
}

module.exports = Block;
