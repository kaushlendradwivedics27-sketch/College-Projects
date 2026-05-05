"""
─────────────────────────────────────────────
Blockchain Module — IILM VotingSystem
Stores vote hashes in a SHA-256 linked chain
─────────────────────────────────────────────
"""

import hashlib
import json
import os
import time
from datetime import datetime, timezone


# Persistence file path (same directory as this script)
CHAIN_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'blockchain_data.json')


class Block:
    """A single block in the vote blockchain."""

    def __init__(self, index, timestamp, vote_hash, previous_hash):
        self.index = index
        self.timestamp = timestamp
        self.vote_hash = vote_hash          # hash(user_id + candidate_id + timestamp)
        self.previous_hash = previous_hash
        self.hash = self.calculate_hash()

    def calculate_hash(self):
        """SHA-256 hash of the block contents."""
        block_string = (
            str(self.index)
            + self.previous_hash
            + self.timestamp
            + self.vote_hash
        )
        return hashlib.sha256(block_string.encode('utf-8')).hexdigest()

    def to_dict(self):
        return {
            "index": self.index,
            "timestamp": self.timestamp,
            "vote_hash": self.vote_hash,
            "previous_hash": self.previous_hash,
            "hash": self.hash,
        }


class VoteBlockchain:
    """A simple blockchain for vote integrity verification."""

    def __init__(self):
        # Try to load existing chain from disk
        loaded = self._load_from_file()
        if loaded:
            self.chain = loaded
            print(f"⛓️  Loaded {len(self.chain)} blocks from {CHAIN_FILE}")
        else:
            self.chain = [self._create_genesis_block()]
            print("⛓️  Created new chain with genesis block")

    @staticmethod
    def _create_genesis_block():
        """Create the first block in the chain."""
        genesis = Block(
            index=0,
            timestamp="2025-01-01T00:00:00.000Z",
            vote_hash="GENESIS_BLOCK",
            previous_hash="0",
        )
        # Override with a deterministic genesis hash
        genesis.hash = "0" * 64
        return genesis

    @staticmethod
    def _hash_vote(user_id: str, candidate_id: str, timestamp: str) -> str:
        """
        Generate the core vote hash:
            hash(user_id + candidate_id + timestamp)
        """
        data = user_id + candidate_id + timestamp
        return hashlib.sha256(data.encode('utf-8')).hexdigest()

    def get_latest_block(self) -> Block:
        return self.chain[-1]

    def add_vote(self, user_id: str, candidate_id: str) -> dict:
        """
        Record a vote on the blockchain.
        
        1. hash(user_id + candidate_id + timestamp)
        2. Create a new block linked to the previous block
        3. Append to chain
        4. Persist to disk
        
        Returns the new block as a dict.
        """
        timestamp = datetime.now(timezone.utc).isoformat()
        vote_hash = self._hash_vote(user_id, candidate_id, timestamp)

        previous_block = self.get_latest_block()
        new_block = Block(
            index=previous_block.index + 1,
            timestamp=timestamp,
            vote_hash=vote_hash,
            previous_hash=previous_block.hash,
        )

        self.chain.append(new_block)
        self._save_to_file()
        return new_block.to_dict()

    def verify_chain(self) -> dict:
        """
        Verify the integrity of the entire chain.
        Each block's previous_hash must match the prior block's hash.
        """
        for i in range(1, len(self.chain)):
            current = self.chain[i]
            previous = self.chain[i - 1]

            # Check link
            if current.previous_hash != previous.hash:
                return {
                    "valid": False,
                    "length": len(self.chain),
                    "error": f"Chain broken at block {i}",
                }

            # Check self-integrity
            if current.hash != current.calculate_hash():
                return {
                    "valid": False,
                    "length": len(self.chain),
                    "error": f"Block {i} hash is invalid (tampered)",
                }

        return {"valid": True, "length": len(self.chain)}

    def get_chain(self) -> list:
        """Return the full chain as a list of dicts."""
        return [block.to_dict() for block in self.chain]

    # ── Persistence ──────────────────────

    def _save_to_file(self):
        """Save the entire chain to a JSON file."""
        try:
            data = [block.to_dict() for block in self.chain]
            with open(CHAIN_FILE, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"⚠️  Failed to save chain: {e}")

    @staticmethod
    def _load_from_file():
        """Load chain from JSON file, returns list of Block objects or None."""
        if not os.path.exists(CHAIN_FILE):
            return None
        try:
            with open(CHAIN_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
            if not data or len(data) == 0:
                return None

            blocks = []
            for item in data:
                block = Block(
                    index=item['index'],
                    timestamp=item['timestamp'],
                    vote_hash=item['vote_hash'],
                    previous_hash=item['previous_hash'],
                )
                # Restore the stored hash (genesis block has overridden hash)
                block.hash = item['hash']
                blocks.append(block)
            return blocks
        except Exception as e:
            print(f"⚠️  Failed to load chain from file: {e}")
            return None

