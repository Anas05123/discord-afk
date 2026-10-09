import os
import json
import time
import threading
from http.server import HTTPServer, BaseHTTPRequestHandler

START_TIME = time.time()

class HealthHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        uptime_seconds = int(time.time() - START_TIME)
        response_data = {
            "status": "online",
            "service": "Discord 24/7 Voice AFK Worker",
            "uptime_seconds": uptime_seconds,
            "message": "Worker is active and maintaining Discord voice connection."
        }
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(response_data, indent=2).encode("utf-8"))

    def log_message(self, format, *args):
        # Silence console log spam for health check pings
        return

def start_keep_alive(port: int = 10000):
    """Starts the lightweight HTTP server in a daemon thread."""
    server_address = ("0.0.0.0", port)
    httpd = HTTPServer(server_address, HealthHandler)
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    print(f"[KeepAlive] Health check server listening on port {port}")
    return httpd
