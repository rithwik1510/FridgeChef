# FridgeChef - Your Personal Recipe Assistant

AI-powered recipe generation based on ingredients you have at home.

## Features

- 📸 Scan fridge contents with your camera
- 🤖 AI-powered ingredient recognition using Google Gemini
- 🍳 Generate personalized recipes based on available ingredients
- ⭐ Save favorite recipes
- 📝 Create shopping lists
- 👤 User preferences for dietary restrictions and cuisines

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 20+ (for local development)
- Python 3.11+ (for local development)

### Production Deployment

1. Clone the repository
2. Copy environment file: `cp .env.example .env`
3. Update `.env` with your credentials
4. Start services: `docker-compose up -d`
5. Access the app at http://localhost:3000

### Local Development

**Backend**:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend**:
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

See `.env.example` for all required environment variables.

**Critical**:
- `SECRET_KEY` - JWT signing key (64+ characters)
- `GOOGLE_API_KEY` - Google Gemini API key
- `DB_PASSWORD` - PostgreSQL password

## Testing

**Backend**:
```bash
cd backend
pytest --cov
```

**Frontend**:
```bash
cd frontend
npm run test:coverage
```

## Security

- All API endpoints require authentication
- Rate limiting enabled
- CORS restricted to specified origins
- Passwords hashed with bcrypt
- JWT tokens for session management

See `SECURITY.md` for more details.

## License

MIT