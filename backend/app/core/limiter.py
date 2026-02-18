from slowapi import Limiter
from slowapi.util import get_remote_address

# Shared rate limiter instance — import this in all endpoint files
limiter = Limiter(key_func=get_remote_address)
