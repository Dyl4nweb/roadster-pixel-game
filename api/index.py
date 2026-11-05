"""
ROADSTER 3D: NLEX Cyber Skyway
Official Vercel Serverless Function & WSGI Application Entry Point
Supports local development, Vercel Serverless, and container deployments.
"""

import os
import json
import time
from datetime import datetime
from flask import Flask, render_template, jsonify, request, redirect, url_for

# Detect directories
API_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(API_DIR)

def find_dir(name):
    # Check api/<name> first, then root/<name>
    cand_api = os.path.join(API_DIR, name)
    if os.path.exists(cand_api):
        return cand_api
    cand_root = os.path.join(ROOT_DIR, name)
    if os.path.exists(cand_root):
        return cand_root
    return cand_root

TEMPLATE_FOLDER = find_dir('templates')
STATIC_FOLDER = find_dir('static')

app = Flask(
    __name__,
    template_folder=TEMPLATE_FOLDER,
    static_folder=STATIC_FOLDER
)
app.config['TEMPLATES_AUTO_RELOAD'] = True
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

def get_storage_path(filename):
    """
    Return writable storage path.
    On Vercel / serverless (where root filesystem is read-only), mirrors to /tmp.
    """
    if os.environ.get('VERCEL') or not os.access(ROOT_DIR, os.W_OK):
        tmp_path = os.path.join('/tmp', filename)
        if not os.path.exists(tmp_path):
            base_path = os.path.join(API_DIR, filename)
            if not os.path.exists(base_path):
                base_path = os.path.join(ROOT_DIR, filename)
            if os.path.exists(base_path):
                import shutil
                try:
                    shutil.copyfile(base_path, tmp_path)
                except Exception:
                    pass
        return tmp_path
    return os.path.join(ROOT_DIR, filename)

def get_scores_file():
    return get_storage_path('high_score.json')

def get_leaderboard_file():
    return get_storage_path('leaderboard.json')

DEFAULT_LEADERBOARD = [
    {
        "rank": 1,
        "driver": "PILOT_VIRAY",
        "score": 94850,
        "distance_km": 6.25,
        "top_speed": 240,
        "stage": "Pangasinan Coast",
        "date": "2026-10-19"
    },
    {
        "rank": 2,
        "driver": "NLEX_VIPER",
        "score": 82400,
        "distance_km": 5.12,
        "top_speed": 235,
        "stage": "Clark Subic Skyway",
        "date": "2026-10-18"
    },
    {
        "rank": 3,
        "driver": "CYBER_ROADSTER",
        "score": 68243,
        "distance_km": 3.80,
        "top_speed": 215,
        "stage": "San Fernando Tollway",
        "date": "2026-10-18"
    },
    {
        "rank": 4,
        "driver": "HYPER_STORM",
        "score": 54100,
        "distance_km": 3.20,
        "top_speed": 198,
        "stage": "San Fernando Tollway",
        "date": "2026-10-17"
    },
    {
        "rank": 5,
        "driver": "ROOKIE_PILOT",
        "score": 38500,
        "distance_km": 2.45,
        "top_speed": 180,
        "stage": "Balintawak Entry",
        "date": "2026-10-16"
    }
]

def load_leaderboard():
    """Load persistent global leaderboard records from JSON file."""
    fpath = get_leaderboard_file()
    if os.path.exists(fpath):
        try:
            with open(fpath, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if isinstance(data, list) and len(data) > 0:
                    return data
        except Exception as e:
            print(f"Error reading leaderboard: {e}")
    save_leaderboard(DEFAULT_LEADERBOARD)
    return DEFAULT_LEADERBOARD

def save_leaderboard(records):
    """Save persistent global leaderboard records to JSON file."""
    try:
        fpath = get_leaderboard_file()
        with open(fpath, 'w', encoding='utf-8') as f:
            json.dump(records, f, indent=2)
    except Exception as e:
        print(f"Error saving leaderboard: {e}")

def load_high_score():
    """Load top high score record from JSON file if exists."""
    fpath = get_scores_file()
    if os.path.exists(fpath):
        try:
            with open(fpath, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            pass
    board = load_leaderboard()
    if board:
        top = board[0]
        return {
            "high_score": top.get("score", 0),
            "driver_name": top.get("driver", "Rookie"),
            "distance_km": top.get("distance_km", 0.0)
        }
    return {"high_score": 0, "driver_name": "Rookie", "distance_km": 0.0}

def save_high_score(data):
    """Save top high score record to JSON file."""
    try:
        fpath = get_scores_file()
        with open(fpath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        print(f"Error saving high score: {e}")

@app.after_request
def add_no_cache_headers(response):
    """Ensure dynamic updates take effect immediately in dev and prod."""
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

def is_mobile_request(req):
    """Detect if incoming request is from a mobile phone browser."""
    user_agent = req.headers.get('User-Agent', '').lower()
    mobile_keywords = [
        'android', 'iphone', 'ipod', 'mobile',
        'blackberry', 'iemobile', 'kindle', 'silk', 'opera mini',
        'windows phone'
    ]
    for kw in mobile_keywords:
        if kw in user_agent:
            return True
    return False

@app.route('/')
def home():
    """Render the official Roadster 3D Cyber Skyway Home Page and Leaderboard."""
    board = load_leaderboard()
    return render_template('home.html', v=int(time.time()), leaderboard=board)

@app.route('/mobile')
@app.route('/mobile-blocked')
@app.route('/desktop-only')
def desktop_only():
    """Page shown when a mobile device attempts to access the desktop-only 3D game."""
    return render_template('mobile_blocked.html', v=int(time.time()))

@app.route('/play')
def play():
    """Render the main 3D retro arcade game screen (desktop optimized)."""
    if request.args.get('force') != 'true' and is_mobile_request(request):
        return redirect(url_for('desktop_only'))
    return render_template('index.html', v=int(time.time()))

@app.route('/game')
def game_alias():
    """Redirect /game to /play."""
    return redirect(url_for('play'))

@app.route('/thrusters')
def thrusters():
    """Render the 8-second 9:16 cold-gas thrusters cinematic animation page."""
    return render_template('thrusters.html', v=int(time.time()))

@app.route('/favicon.ico')
def favicon():
    """Silence browser favicon requests."""
    return ('', 204)

@app.route('/api/leaderboard', methods=['GET', 'POST'])
def handle_leaderboard():
    """API endpoint to retrieve the leaderboard or submit a new driver score."""
    board = load_leaderboard()

    if request.method == 'POST':
        payload = request.get_json(silent=True) or {}
        raw_driver = str(payload.get('driver', 'ANON_PILOT')).strip().upper()
        driver = ''.join(c for c in raw_driver if c.isalnum() or c in ('_', '-', ' '))[:14]
        if not driver:
            driver = "PILOT_ROOKIE"

        try:
            score = int(payload.get('score', 0))
        except (ValueError, TypeError):
            score = 0

        try:
            distance_km = float(payload.get('distance_km', 0.0))
        except (ValueError, TypeError):
            distance_km = 0.0

        try:
            top_speed = int(payload.get('top_speed', 0))
        except (ValueError, TypeError):
            top_speed = 0

        stage = str(payload.get('stage', 'Balintawak Entry'))[:30]
        today = datetime.now().strftime('%Y-%m-%d')

        new_entry = {
            "driver": driver,
            "score": score,
            "distance_km": round(distance_km, 2),
            "top_speed": top_speed,
            "stage": stage,
            "date": today
        }

        board.append(new_entry)
        board.sort(key=lambda x: x.get('score', 0), reverse=True)
        board = board[:10]

        for idx, entry in enumerate(board):
            entry['rank'] = idx + 1

        save_leaderboard(board)

        assigned_rank = 10
        for entry in board:
            if entry.get('driver') == driver and entry.get('score') == score:
                assigned_rank = entry.get('rank', 10)
                break

        return jsonify({
            "status": "success",
            "message": f"Score submitted! Driver ranked #{assigned_rank}",
            "rank": assigned_rank,
            "leaderboard": board
        }), 201

    return jsonify({
        "status": "success",
        "count": len(board),
        "leaderboard": board
    })

@app.route('/api/high_score', methods=['GET', 'POST'])
def handle_high_score():
    """Legacy high score endpoint for single top record compatibility."""
    current_record = load_high_score()
    if request.method == 'POST':
        payload = request.get_json(silent=True) or {}
        new_score = int(payload.get('score', 0))
        new_dist = float(payload.get('distance_km', 0.0))
        driver = str(payload.get('driver', 'Roadster Pilot'))[:14]

        if new_score > current_record.get('high_score', 0):
            current_record = {
                "high_score": new_score,
                "driver_name": driver,
                "distance_km": round(new_dist, 2)
            }
            save_high_score(current_record)
            return jsonify({"status": "new_record", "data": current_record})
        return jsonify({"status": "no_change", "data": current_record})

    return jsonify(current_record)
