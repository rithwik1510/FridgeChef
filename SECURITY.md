# Security Policy

## Reporting Vulnerabilities

Please report security vulnerabilities to: security@fridgechef.com

## Security Features

### Authentication
- JWT-based authentication
- Secure password hashing (bcrypt)
- Token expiration (7 days default)
- HTTP-only cookies (recommended for production)

### Rate Limiting
- Login: 5 attempts/minute
- Registration: 3 attempts/minute
- Image upload: 10 uploads/minute
- Recipe generation: 15 requests/minute
- General API: 100 requests/minute

### Input Validation
- File type validation (images only)
- File size limits (10MB max)
- SQL injection protection (SQLAlchemy ORM)
- XSS protection (input sanitization)

### CORS
- Restricted to specified origins
- Credentials allowed only for trusted origins

### API Keys
- Never commit API keys to version control
- Use environment variables
- Rotate keys regularly
- Restrict API key usage (HTTP referrers, IP allowlists)

## Best Practices

1. **Keep Dependencies Updated**
   ```bash
   pip list --outdated
   npm outdated
   ```

2. **Regular Security Audits**
   ```bash
   pip install safety
   safety check
   npm audit
   ```

3. **Use HTTPS in Production**
   - Enforce HTTPS redirects
   - Set secure cookie flags
   - HSTS headers

4. **Database Security**
   - Strong passwords
   - Encrypted connections
   - Regular backups
   - Access restrictions

5. **Monitoring**
   - Log authentication failures
   - Alert on rate limit violations
   - Monitor for unusual patterns
