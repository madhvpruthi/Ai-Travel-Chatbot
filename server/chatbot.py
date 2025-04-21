import sys
import json
import google.generativeai as genai

genai.configure(api_key="API_KEY")

model = genai.GenerativeModel("models/gemini-1.5-pro-latest")

# Get full chat history
data = json.loads(sys.stdin.read())
history = data["history"]

# Build the conversation string
conversation = "You are a smart and concise AI travel assistant.\n"
conversation += """ONLY answer queries related to:
- Travel destinations 🌍
- Things to explore or visit ✈️
- Places to eat or stay 🏨🍴
- Budget or travel expenses 💰
- Tips and itinerary suggestions 🗺️

If the question is unrelated to travel or expenses, respond politely like this:
"Bhai main nahi bataunga 😎"

Your response should be:
- Very short (1–2 lines max per paragraph)
- Include emojis where helpful
- Avoid markdown formatting or long explanations
"""

for msg in history:
    if msg["role"] == "user":
        conversation += f'\nUser: {msg["content"]}'
    else:
        conversation += f'\nBot: {msg["content"]}'

# Gemini reply
response = model.generate_content(conversation)
print(response.text)
