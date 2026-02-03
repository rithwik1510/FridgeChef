#!/bin/bash

# Create uploads directory
mkdir -p uploads

# Run database migrations
alembic upgrade head

# Start the application
uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
