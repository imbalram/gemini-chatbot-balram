from flask import Flask, request, jsonify, send_from_directory
import requests, os, re

app = Flask(__name__, static_folder="static")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Predefined custom answers
CREATOR_QUESTIONS = [
    r"who (made|created|developed) you",
    r"who is your developer",
    r"who built you",
    r"who programmed you"
]

@app.route("/")
def index():
    return send_from_directory("static", "index.html")

@app.route("/chat", methods=["POST"])
def chat():
    user_message = request.json.get("message", "").strip()
    if not user_message:
        return jsonify({"error": "Message is required"}), 400

    # Check for "who developed you" type questions
    for pattern in CREATOR_QUESTIONS:
        if re.search(pattern, user_message.lower()):
            return jsonify({"reply": "Balram developed me."})

    # Call Gemini API
    url = f"https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key={GEMINI_API_KEY}"
    payload = {"contents": [{"parts": [{"text": user_message}]}]}
    headers = {"Content-Type": "application/json"}
    response = requests.post(url, json=payload, headers=headers)

    try:
        data = response.json()
        bot_reply = data["candidates"][0]["content"]["parts"][0]["text"]
        bot_reply = re.sub(r"\b(gemini|google)\b", "my developer", bot_reply, flags=re.I)
    except Exception:
        bot_reply = "⚠️ Oops! Something went wrong."

    return jsonify({"reply": bot_reply})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
