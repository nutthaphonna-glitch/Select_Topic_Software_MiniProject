import http.server
import socketserver
import os
import sys

# Force utf-8 stdout
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

PORT = 3000
WEB_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'web')

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=WEB_DIR, **kwargs)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

if __name__ == '__main__':
    os.chdir(WEB_DIR)
    # Enable address reuse
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), CustomHandler) as httpd:
        print("==================================================")
        print("E-Book Shop Web Server is Live!")
        print(f"Local URL: http://localhost:{PORT}")
        print("Stripe Payment & Creator Publishing: Ready")
        print("Admin Dashboard: Ready (CSV/JSON Engine)")
        print("==================================================")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")
