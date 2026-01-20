# 🥘 FridgeChef

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-C4704B?style=for-the-badge&logo=none)
![Build](https://img.shields.io/badge/build-passing-7D8B6E?style=for-the-badge&logo=github)
![License](https://img.shields.io/badge/license-MIT-2D2A26?style=for-the-badge)

**Reduce Waste. Save Money. Eat Well.**

An intelligent kitchen assistant that turns your random ingredients into culinary masterpieces using Google Gemini AI.

[View Demo](https://fridgechef.vercel.app) • [Report Bug](https://github.com/rithwik1510/FridgeChef/issues) • [Request Feature](https://github.com/rithwik1510/FridgeChef/issues)

</div>

---

## 🎨 The "Kitchen Table" Philosophy

FridgeChef isn't just a utility; it's designed to feel like home. Our interface is built on a **"Kitchen Table"** aesthetic—warm, inviting, and organic.

- **Cream & Charcoal**: A base of `#FBF8F3` (Cream) and `#2D2A26` (Charcoal) provides a clean, readable, and soft contrast that is easier on the eyes than stark black and white.
- **Terracotta Accents**: `#C4704B` brings warmth and appetite appeal, guiding users to key actions like "Cook" or "Save".
- **Sage Green**: `#7D8B6E` indicates success, freshness, and healthy choices.
- **Typography**: We use **Fraunces** for headings—a soft, charismatic serif that feels like a classic cookbook—paired with **Source Serif 4** for high readability.

---

## ✨ Key Features

### 📸 AI Fridge Scan
Stop typing. Just snap a photo of your open fridge or pantry. Our computer vision pipeline (powered by Google Gemini Vision) identifies ingredients, estimates quantities, and determines freshness confidence.

### 🍳 Chef's Intelligence
We don't just match keywords. The AI understands:
- **Flavor Profiles**: It knows basil pairs with tomato, not chocolate.
- **Dietary Context**: Gluten-free? Vegan? Keto? It adapts instantly.
- **Skill Level**: Request "easy" recipes for Tuesday nights or "advanced" for Sunday dinner.

### 🛒 Smart Lists & Pantry
- **One-Tap Shopping**: Missing one ingredient? Add it to your smart list instantly.
- **Pantry Tracking**: Keep a digital twin of your kitchen inventory (Coming Soon).

---

## 🛠️ Tech Stack

### Frontend (The Kitchen)
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with Custom Design Tokens
- **State**: Zustand
- **Forms**: React Hook Form + Zod

### Backend (The Line)
- **API**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.11)
- **AI Engine**: Google Gemini Pro Vision
- **Database**: PostgreSQL with SQLAlchemy & Alembic
- **Security**: OAuth2 with JWT, BCrypt, SlowAPI Rate Limiting

### Infrastructure (The Pass)
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions
- **Storage**: Local/S3 Compatible

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+
- Python 3.11+
- Google Cloud API Key (Gemini)

### 1. Clone the Kitchen
```bash
git clone https://github.com/rithwik1510/FridgeChef.git
cd FridgeChef
```

### 2. Mise en place (Setup)
Copy the environment variables and fill in your secrets.
```bash
cp .env.example .env
```

### 3. Fire up the Stoves (Docker)
The easiest way to run the full stack:
```bash
docker-compose up -d
```
Visit `http://localhost:3000` to start cooking.

---

## 💻 Local Development

If you want to run services individually:

**Backend:**
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate | Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Testing

We maintain high standards in this kitchen.

**Backend Coverage (70%+):**
```bash
cd backend
pytest --cov
```

**Frontend Unit Tests:**
```bash
cd frontend
npm run test
```

---

## 🔒 Security

- **No Open Doors**: Strict CORS policies.
- **Rate Limited**: API endpoints are protected against abuse.
- **Encrypted**: All sensitive user data is hashed.

See [SECURITY.md](SECURITY.md) for our vulnerability disclosure policy.

---

## 🤝 Contributing

We welcome sous-chefs! Please read our [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) to understand the roadmap before submitting a PR.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingRecipe`)
3. Commit your Changes (`git commit -m 'Add some AmazingRecipe'`)
4. Push to the Branch (`git push origin feature/AmazingRecipe`)
5. Open a Pull Request

---

<div align="center">

**Made with 🧡 and 🥗 by the FridgeChef Team**

</div>
