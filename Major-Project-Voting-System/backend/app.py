"""
─────────────────────────────────────────────
Blockchain API Server — IILM VotingSystem
Flask REST API for vote blockchain operations
─────────────────────────────────────────────

Endpoints:
    POST /api/vote          — Record a vote hash on the blockchain
    GET  /api/chain         — Get the full blockchain
    GET  /api/verify        — Verify blockchain integrity
    GET  /api/latest        — Get the latest block
    GET  /api/health        — Health check
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from blockchain import VoteBlockchain

app = Flask(__name__)
CORS(app)  # Allow React Native to call this API

# Single blockchain instance (in production, persist to a database)
blockchain = VoteBlockchain()


@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({
        "status": "ok",
        "service": "IILM VotingSystem Blockchain",
        "chain_length": len(blockchain.chain),
    })


@app.route('/api/vote', methods=['POST'])
def record_vote():
    """
    Record a vote on the blockchain.
    
    Request body:
    {
        "user_id": "student@iilm.edu",
        "candidate_id": "candidate_123"
    }
    
    Response:
    {
        "success": true,
        "block": { index, timestamp, vote_hash, previous_hash, hash }
    }
    """
    data = request.get_json()

    if not data:
        return jsonify({"success": False, "error": "No JSON body provided"}), 400

    user_id = data.get('user_id')
    candidate_id = data.get('candidate_id')

    if not user_id or not candidate_id:
        return jsonify({
            "success": False,
            "error": "Both 'user_id' and 'candidate_id' are required",
        }), 400

    try:
        block = blockchain.add_vote(user_id, candidate_id)
        print(f"⛓️  Block #{block['index']} added | Hash: {block['hash'][:16]}...")
        return jsonify({"success": True, "block": block})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/chain', methods=['GET'])
def get_chain():
    """Return the full blockchain."""
    return jsonify({
        "chain": blockchain.get_chain(),
        "length": len(blockchain.chain),
    })


@app.route('/api/verify', methods=['GET'])
def verify_chain():
    """Verify blockchain integrity."""
    result = blockchain.verify_chain()
    return jsonify(result)


@app.route('/api/latest', methods=['GET'])
def get_latest():
    """Get the latest block."""
    latest = blockchain.get_latest_block()
    return jsonify({"block": latest.to_dict()})


if __name__ == '__main__':
    print("🗳️  IILM VotingSystem — Blockchain Server")
    print("⛓️  Genesis block created")
    print("🚀 Starting on http://0.0.0.0:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)
