const Block = require('./block');

class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;
        this.pendingVotes = [];
    }

    createGenesisBlock() {
        return new Block(0, Date.now(), { message: 'Genesis Block - SarvaMat Voting System' }, '0');
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addVote(voteData) {
        const newBlock = new Block(
            this.chain.length,
            Date.now(),
            voteData,
            this.getLatestBlock().hash
        );
        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);
        return newBlock;
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }
        return true;
    }

    getVoteCount() {
        const counts = {};
        for (let i = 1; i < this.chain.length; i++) {
            const candidate = this.chain[i].data.candidate;
            if (candidate) {
                counts[candidate] = (counts[candidate] || 0) + 1;
            }
        }
        return counts;
    }

    getAllVotes() {
        return this.chain.slice(1).map(block => ({
            hash: block.hash,
            voter: block.data.visibleVoterId,
            candidate: block.data.candidate,
            timestamp: block.timestamp
        }));
    }
}

module.exports = Blockchain;
