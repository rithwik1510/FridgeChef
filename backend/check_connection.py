import socket
import sys
import time
import urllib.request
import urllib.error

def check_port(host, port):
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(2)
    result = sock.connect_ex((host, port))
    sock.close()
    return result == 0

def check_http(url):
    try:
        with urllib.request.urlopen(url, timeout=2) as response:
            return response.getcode(), response.read().decode('utf-8')
    except urllib.error.URLError as e:
        return None, str(e)
    except Exception as e:
        return None, str(e)

print("Checking backend connectivity...")
port_open = check_port('127.0.0.1', 8000)
print(f"Port 8000 open (127.0.0.1): {port_open}")

if port_open:
    print("Attempting HTTP GET to /health...")
    code, content = check_http("http://127.0.0.1:8000/health")
    print(f"Response: {code} - {content}")
else:
    print("ERROR: Port 8000 is NOT open. The backend is likely not running.")
