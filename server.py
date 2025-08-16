from flask import Flask, request, jsonify, render_template
import requests, os, re, sys

app = Flask(__name__, static_folder="static", template_folder="templates")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Predefined custom answers
CREATOR_QUESTIONS = [
    r"who (made|created|developed) you",
    r"who is your developer",
    r"who built you",
    r"who programmed you",
    r"who is balram"
]

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/chat", methods=["POST"])
def chat():
    if not GEMINI_API_KEY:
        return jsonify({"reply": "⚠️ API key not set. Please configure GEMINI_API_KEY."}), 500

    user_message = request.json.get("message", "").strip()
    if not user_message:
        return jsonify({"error": "Message is required"}), 400

    # Custom developer replies
    for pattern in CREATOR_QUESTIONS:
        if re.search(pattern, user_message.lower()):
            return jsonify({"reply": "I was developed by Balram 😊"})

    # Gemini API request
    url = f"https://generativelanguage.googleapis.com/v1/models/gemini-2.5-pro:generateContent?key={GEMINI_API_KEY}"
    payload = {"contents": [{"parts": [{"text": user_message}]}]}
    headers = {"Content-Type": "application/json"}

    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        return jsonify({"reply": f"⚠️ Request failed: {str(e)}"}), 500

    try:
        data = response.json()
        bot_reply = (
            data.get("candidates", [{}])[0]
                .get("content", {})
                .get("parts", [{}])[0]
                .get("text", "")
        )
        if not bot_reply:
            return jsonify({"reply": "⚠️ Empty response from Balram API."}), 500

        # Remove Gemini/Google mentions
        bot_reply = re.sub(r"\b(gemini|google)\b", "my developer", bot_reply, flags=re.I)
    except Exception as e:
        return jsonify({"reply": f"⚠️ Error parsing response: {str(e)}"}), 500

    return jsonify({"reply": bot_reply})

if __name__ == "__main__":
    print("🚀 Server running at http://localhost:5000")
    app.run(host="0.0.0.0", port=5000, debug=True)
