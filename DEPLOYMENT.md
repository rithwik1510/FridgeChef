# Deployment Guide

## Production Checklist

### Pre-Deployment

- [ ] Revoke old/exposed API keys
- [ ] Generate strong SECRET_KEY (64+ chars)
- [ ] Set up PostgreSQL database
- [ ] Configure allowed origins for CORS
- [ ] Review rate limiting settings
- [ ] Set up backup strategy
- [ ] Configure monitoring/logging

### Deployment Steps

1. **Prepare Environment**
   ```bash
   cp .env.example .env
   # Edit .env with production values
   ```

2. **Database Setup**
   ```bash
   docker-compose up -d db
   docker-compose exec backend alembic upgrade head
   ```

3. **Start Services**
   ```bash
   docker-compose up -d
   ```

4. **Verify Health**
   ```bash
   curl http://localhost:8000/api/v1/health/full
   ```

### Cloud Deployment

#### AWS ECS/Fargate

1. Build and push images to ECR
2. Create ECS task definitions
3. Set up Application Load Balancer
4. Configure RDS PostgreSQL instance
5. Set environment variables in ECS

#### Google Cloud Run

1. Build images: `gcloud builds submit`
2. Deploy: `gcloud run deploy fridgechef-backend`
3. Set up Cloud SQL PostgreSQL
4. Configure environment variables

#### Heroku

1. Install Heroku CLI
2. Create apps: `heroku create fridgechef-backend`
3. Add PostgreSQL: `heroku addons:create heroku-postgresql`
4. Deploy: `git push heroku main`

### Post-Deployment

- [ ] Run smoke tests
- [ ] Monitor error rates
- [ ] Check database connections
- [ ] Verify rate limiting works
- [ ] Test authentication flow
- [ ] Set up automated backups

## Monitoring

**Health Checks**:
- `/health` - Basic health
- `/health/db` - Database connectivity
- `/health/full` - Comprehensive check

**Logs**:
- Backend: `docker-compose logs -f backend`
- Database: `docker-compose logs -f db`
- Frontend: `docker-compose logs -f frontend`

**Metrics to Monitor**:
- API response times
- Error rates (4xx, 5xx)
- Database connection pool usage
- Rate limit violations
- Gemini API quota usage
