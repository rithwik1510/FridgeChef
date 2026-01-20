import urllib.request
import urllib.error
import json

def check_endpoint(url):
    print(f"Checking {url}...")
    try:
        # We expect 401 Unauthorized since we have no token
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=5) as response:
            print(f"Success (Unexpected): {response.getcode()}")
            print(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        print(f"HTTP Error: {e.code} (This is likely GOOD if it is 401)")
        print(e.read().decode('utf-8'))
    except urllib.error.URLError as e:
        print(f"Connection Error: {e.reason}")
    except Exception as e:
        print(f"General Error: {e}")

check_endpoint("http://127.0.0.1:8000/api/v1/scans")
check_endpoint("http://127.0.0.1:8000/api/v1/recipes")
