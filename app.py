"""
ROADSTER 3D: NLEX Cyber Skyway
Flask Web Server & Leaderboard API (Local Development Entry Point)
"""

import os
from api.index import app

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug_mode = os.environ.get('FLASK_DEBUG', 'False').lower() in ('true', '1')

    print("=" * 64)
    print("  * ROADSTER 3D: NLEX Cyber Skyway Web Server *")
    print(f"  Local Game Hub: http://localhost:{port}")
    print(f"  Direct Game Play: http://localhost:{port}/play")
    print(f"  Desktop Only Notice: http://localhost:{port}/desktop-only")
    print(f"  Leaderboard API: http://localhost:{port}/api/leaderboard")
    print("=" * 64)

    app.run(host='0.0.0.0', port=port, debug=debug_mode)
