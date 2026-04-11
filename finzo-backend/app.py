"""
Finzo - Python Flask Backend
Excel-based database for all financial data
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import json
from datetime import datetime
from dotenv import load_dotenv
from database import FinzoDB
from fraud_engine import FraudEngine
from groq import Groq

# Load local .env if present
load_dotenv()

app = Flask(__name__)
CORS(app)  

DB_PATH = "finzo_database.xlsx"
db = FinzoDB(DB_PATH)
fraud_engine = FraudEngine()


GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "your_groq_api_key_here")
client = Groq(api_key=GROQ_API_KEY)

def get_user_id():
    """Extract user_id from Authorization header or query param (stub)."""
    return request.headers.get("X-User-Id") or request.args.get("user_id") or "demo_user"



#  TRANSACTIONS
@app.route("/api/transactions", methods=["GET"])
def get_transactions():
    user_id = get_user_id()
    txns = db.get_transactions(user_id)
    return jsonify({"success": True, "transactions": txns})


@app.route("/api/transactions", methods=["POST"])
def save_transactions():
    """
    Accepts a JSON array of transaction objects (from the frontend parser).
    Runs fraud detection, saves to Excel.
    """
    user_id = get_user_id()
    data = request.get_json()
    txns = data.get("transactions", [])
    filename = data.get("filename", "upload")

    if not txns:
        return jsonify({"success": False, "error": "No transactions provided"}), 400

    # Assign IDs, run fraud detection, stamp user/time
    enriched = []
    for i, t in enumerate(txns):
        t["id"] = t.get("id", i)
        t["user_id"] = user_id
        t["uploaded_at"] = datetime.now().isoformat()
        t["filename"] = filename

        # Auto-flag via rules engine
        flags = fraud_engine.check(t, txns)
        t["flagged"] = bool(flags) or t.get("flagged", False)
        t["triggered_rules"] = json.dumps(flags)
        enriched.append(t)

    upload_id = db.save_transactions(user_id, enriched, filename)
    db.log_upload(user_id, filename, len(enriched), upload_id)

    return jsonify({
        "success": True,
        "upload_id": upload_id,
        "count": len(enriched),
        "flagged": sum(1 for t in enriched if t["flagged"]),
    })


@app.route("/api/transactions/<int:txn_id>", methods=["PATCH"])
def update_transaction(txn_id):
    """Update a single transaction field (e.g. category, flagged)."""
    user_id = get_user_id()
    data = request.get_json()
    db.update_transaction(user_id, txn_id, data)
    return jsonify({"success": True})


@app.route("/api/transactions/<int:txn_id>", methods=["DELETE"])
def delete_transaction(txn_id):
    user_id = get_user_id()
    db.delete_transaction(user_id, txn_id)
    return jsonify({"success": True})


#  FRAUD ALERTS

@app.route("/api/fraud", methods=["GET"])
def get_fraud_alerts():
    user_id = get_user_id()
    txns = db.get_transactions(user_id)
    flagged = [t for t in txns if t.get("flagged")]
    resolved = db.get_resolved_alerts(user_id)
    return jsonify({"success": True, "flagged": flagged, "resolved": resolved})


@app.route("/api/fraud/<int:txn_id>/resolve", methods=["POST"])
def resolve_alert(txn_id):
    user_id = get_user_id()
    db.resolve_alert(user_id, txn_id)
    return jsonify({"success": True})


@app.route("/api/fraud/<int:txn_id>/unresolve", methods=["POST"])
def unresolve_alert(txn_id):
    user_id = get_user_id()
    db.unresolve_alert(user_id, txn_id)
    return jsonify({"success": True})



#  UPLOAD HISTORY

@app.route("/api/uploads", methods=["GET"])
def get_uploads():
    user_id = get_user_id()
    history = db.get_upload_history(user_id)
    return jsonify({"success": True, "uploads": history})


@app.route("/api/uploads/<upload_id>", methods=["DELETE"])
def delete_upload(upload_id):
    user_id = get_user_id()
    db.delete_upload(user_id, upload_id)
    return jsonify({"success": True})


#  DASHBOARD SUMMARY

@app.route("/api/dashboard", methods=["GET"])
def get_dashboard():
    user_id = get_user_id()
    txns = db.get_transactions(user_id)
    if not txns:
        return jsonify({"success": True, "has_data": False})

    spent = sum(abs(t["amount"]) for t in txns if t.get("type") == "debit")
    income = sum(t["amount"] for t in txns if t.get("type") == "credit")
    flagged = sum(1 for t in txns if t.get("flagged"))


    cats = {}
    for t in txns:
        if t.get("type") == "debit":
            c = t.get("category", "Other")
            cats[c] = cats.get(c, 0) + abs(t["amount"])
    sorted_cats = sorted(cats.items(), key=lambda x: x[1], reverse=True)

    recent = sorted(txns, key=lambda x: x.get("date", ""), reverse=True)[:5]

    return jsonify({
        "success": True,
        "has_data": True,
        "stats": {
            "total_transactions": len(txns),
            "total_spent": spent,
            "total_income": income,
            "flagged_count": flagged,
        },
        "categories": [{"name": k, "amount": v} for k, v in sorted_cats[:5]],
        "recent_transactions": recent,
    })



#  USER PROFILE

@app.route("/api/profile", methods=["GET"])
def get_profile():
    user_id = get_user_id()
    profile = db.get_profile(user_id)
    return jsonify({"success": True, "profile": profile})


@app.route("/api/profile", methods=["PUT"])
def update_profile():
    user_id = get_user_id()
    data = request.get_json()
    db.save_profile(user_id, data)
    return jsonify({"success": True})



#  EXPORT

@app.route("/api/export/excel", methods=["GET"])
def export_excel():
    """Download the raw Excel database file."""
    return send_file(DB_PATH, as_attachment=True, download_name="finzo_export.xlsx")


@app.route("/api/export/csv", methods=["GET"])
def export_csv():
    """Export user's transactions as CSV."""
    import io, csv
    user_id = get_user_id()
    txns = db.get_transactions(user_id)
    output = io.StringIO()
    if txns:
        writer = csv.DictWriter(output, fieldnames=txns[0].keys())
        writer.writeheader()
        writer.writerows(txns)
    output.seek(0)
    return app.response_class(
        output.getvalue(),
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment;filename=transactions.csv"}
    )



#  AI ADVISOR (GROQ)
@app.route("/chat", methods=["POST"])
def chat():
    """
    Simpler implementation of Groq chat completion.
    Expected JSON: { "message": "...", "history": [...] }
    """
    data = request.json
    message = data.get("message")
    history = data.get("history", [])
    context = data.get("context")

    messages = [
        {
            "role": "system",
            "content": context if context else """You are Finzo AI, a smart financial advisor.
Help users understand their bank statements, detect fraud, and improve savings.
Use ₹ for currency.
Give clear actionable advice.
Keep responses concise."""
        }
    ]

    for h in history:
        messages.append({
            "role": h["role"],
            "content": h["content"]
        })

    messages.append({
        "role": "user",
        "content": message
    })

    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.7,
            max_tokens=800
        )
        reply = completion.choices[0].message.content
        return jsonify({"reply": reply})
    except Exception as e:
        print(f"Groq API error: {e}")
        return jsonify({"error": str(e)}), 500



#  HEALTH CHECK
@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "db": DB_PATH})


if __name__ == "__main__":
    print("Finzo backend running at http://localhost:5000")
    app.run(debug=True, port=5000)
