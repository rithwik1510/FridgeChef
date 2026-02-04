# <img src="frontend/public/favicon.ico" width="32" height="32" /> FridgeChef

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?style=for-the-badge&logo=fastapi)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash-4285F4?style=for-the-badge&logo=google-gemini)
![License](https://img.shields.io/badge/license-MIT-C4704B?style=for-the-badge)

### **The Intelligent Kitchen Operating System.**
**Turn your fridge into a five-star pantry with the power of generative AI.**

[Explore the Platform](https://fridgechef.vercel.app) • [Read the Plan](IMPLEMENTATION_PLAN.md) • [View API Docs](http://localhost:8000/docs)

</div>

---

## 🌟 The Vision

Every year, millions of tons of food go to waste simply because we don't know what to cook with what we have. **FridgeChef** bridges the gap between available ingredients and culinary inspiration. Using cutting-edge computer vision and generative AI, it acts as a digital sous-chef that understands your kitchen, your preferences, and your schedule.

---

## 📱 Experience the Interface

### **Intelligent Dashboard**
Your culinary command center. Track recent scans, browse personalized recipe suggestions, and manage your kitchen inventory at a glance.

<div align="center">
  <img src="home page 1.png" width="900" alt="FridgeChef Dashboard" />
</div>

<br />

### **AI-Powered Fridge Scanning**
Forget manual entry. Snap a photo of your fridge or pantry, and our Gemini-powered vision pipeline identifies every ingredient, estimates quantities, and suggests immediate possibilities.

<div align="center">
  <img src="scan .png" width="900" alt="AI Scan Interface" />
</div>

<br />

### **Curated Culinary Discovery**
Browse recipes specifically matched to your current inventory. Our AI doesn't just match keywords; it understands flavor profiles, dietary restrictions, and cooking techniques to provide the perfect meal for your ingredients.

<div align="center">
  <img src="recipes.png" width="900" alt="Recipe Discovery" />
</div>

---

## 🛠️ Key Capabilities

- **📸 Computer Vision Analysis**: Automatically identifies produce, proteins, and pantry staples from simple smartphone photos.
- **🍳 Generative Recipe Engineering**: Custom recipes generated on-the-fly using Google Gemini 2.5 Flash, optimized for minimal waste.
- **📊 Real-time Inventory Matching**: Instant calculation of ingredient availability percentages for every recipe.
- **🛒 Seamless Shopping Workflow**: Automatically generate shopping lists for the specific ingredients you're missing from a chosen recipe.
- **🎨 "Kitchen Table" Design System**: A warm, organic UI built on Material Design principles with a sophisticated Terracotta and Sage color palette.

---

## 🏗️ Technical Architecture

### **Frontend Excellence**
*   **Framework**: Next.js 14 (App Router) for high-performance server-side rendering.
*   **State Management**: React Query (TanStack) for robust server-state synchronization and caching.
*   **Design System**: Tailwind CSS with a custom "Kitchen Table" theme.
*   **Iconography**: Phosphor Icons (Duotone) for a modern, cohesive visual language.

### **Backend Performance**
*   **Engine**: FastAPI (Python 3.12) providing high-concurrency, asynchronous API performance.
*   **AI Integration**: Google Gemini API for advanced multi-modal ingredient detection and recipe generation.
*   **ORM**: SQLAlchemy 2.0 with PostgreSQL for scalable data persistence.
*   **Security**: JWT-based authentication with high-entropy hashing and Rate Limiting protection.

---

## 🚀 Deployment & Installation

### **The 60-Second Start (Windows)**
1.  **Clone**: `git clone https://github.com/rithwik1510/FridgeChef.git`
2.  **Setup**: Run `FIRST_TIME_SETUP.bat` and provide your Gemini API Key.
3.  **Launch**: Run `START_APP.bat`.

### **Standard Installation**

**1. Backend Environment**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**2. Frontend Environment**
```bash
cd frontend
npm install
npm run dev
```

---

## 🛡️ Performance & Security

- **Rate Limiting**: Protected against API abuse via `slowapi`.
- **Memoized Renders**: High-performance UI using `useMemo` for complex ingredient calculations.
- **Input Validation**: End-to-end type safety using Zod (Frontend) and Pydantic (Backend).
- **Graceful Error Handling**: Error boundaries and toast notifications ensure a seamless user experience even under network instability.

---

## 🤝 Contributing & License

We welcome contributions to the FridgeChef ecosystem. Please see our [CLAUDE.md](CLAUDE.md) for development rules and [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) for our feature roadmap.

Distributed under the **MIT License**. See `LICENSE` for more information.

<div align="center">

**Crafted with precision for the modern kitchen.**

</div>