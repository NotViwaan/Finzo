import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq
from dotenv import load_dotenv


load_dotenv()

app = Flask(__name__)
CORS(app)


GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "YOUR_GROQ_API_KEY")
client = Groq(api_key=GROQ_API_KEY)

@app.route("/chat", methods=["POST"])
def chat():

    data = request.json
    message = data.get("message")
    history = data.get("history", [])

    messages = [
        {
            "role": "system",
            "content": """You are Finzo AI, a smart financial advisor.

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

    completion = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        temperature=0.7,
        max_tokens=800
    )

    reply = completion.choices[0].message.content

    return jsonify({
        "reply": reply
    })


if __name__ == "__main__":
    app.run(port=5000, debug=True)