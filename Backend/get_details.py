import random
import sys
import time
import requests
import re
import html
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from pathlib import Path
import sqlite3

sys.path.append(str(Path(__file__).parent.parent))
from database import get_db_connection

load_dotenv(Path(__file__).parent.parent.parent / '.env')

STORE_URL = "https://store.steampowered.com/api/appdetails"
REVIEWS_URL = "https://store.steampowered.com/appreviews"
SAVE_INTERVAL = 50


def get_unprocessed_games():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT steam_id, name FROM games WHERE release_date IS NULL")
    games = [{'app_id': row['steam_id'], 'name': row['name']} for row in cursor.fetchall()]
    conn.close()
    return games


def save_game(game_data):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
        UPDATE games SET
            short_description = ?,
            price = ?,
            is_free = ?,
            release_date = ?,
            developer = ?,
            publisher = ?,
            positive_reviews = ?,
            negative_reviews = ?,
            total_reviews = ?,
            review_score_desc = ?
        WHERE steam_id = ?
    ''', (
        game_data['short_description'],
        game_data['price'],
        game_data['is_free'],
        game_data['release_date'],
        game_data['developer'],
        game_data['publisher'],
        game_data['positive_reviews'],
        game_data['negative_reviews'],
        game_data['total_reviews'],
        game_data['review_score_desc'],
        game_data['app_id'],
    ))

    for tag_name in game_data['tags']:
        cursor.execute("INSERT OR IGNORE INTO tags (name) VALUES (?)", (tag_name,))
        cursor.execute("SELECT id FROM tags WHERE name = ?", (tag_name,))
        tag_id = cursor.fetchone()['id']
        cursor.execute("INSERT OR IGNORE INTO game_tags (game_id, tag_id) VALUES (?, ?)", (game_data['app_id'], tag_id))

    conn.commit()
    conn.close()


def fetch_game_details(game, current_index, total_games):
    params = {
        'appids': game['app_id'],
        'l': 'english',
        'cc': 'us'
    }

    try:
        response = requests.get(STORE_URL, params=params, timeout=10)
        response.raise_for_status()

        app_data = response.json().get(str(game['app_id']))
        if not app_data or not app_data.get('success'):
            print(f"[{current_index}/{total_games}] ✗ {game['name']} (no data)")
            return None

        data = app_data['data']

        if data.get('release_date', {}).get('coming_soon'):
            print(f"[{current_index}/{total_games}] ✗ {game['name']} (coming soon)")
            return None

        is_free = data.get('is_free', False)
        if is_free:
            price = 0.0
        else:
            price_overview = data.get('price_overview')
            price = price_overview['final'] / 100 if price_overview else None

        game_data = {
            'app_id': game['app_id'],
            'name': game['name'],
            'short_description': data.get('short_description', ''),
            'price': price,
            'is_free': is_free,
            'release_date': data.get('release_date', {}).get('date', ''),
            'developer': ', '.join(data.get('developers', [])),
            'publisher': ', '.join(data.get('publishers', [])),
        }

        return game_data

    except requests.exceptions.RequestException as e:
        print(f"[{current_index}/{total_games}] ✗ {game['name']} (network error: {e})")
        return None
    except (KeyError, TypeError, ValueError) as e:
        print(f"[{current_index}/{total_games}] ✗ {game['name']} ({e})")
        return None


def fetch_reviews(app_id, game_name, current_index, total_games):
    try:
        response = requests.get(f"{REVIEWS_URL}/{app_id}", params={
            'json': 1,
            'num_per_page': 0,
            'language': 'all',
            'purchase_type': 'all'
        }, timeout=10)

        if response.status_code == 429:
            print(f"[{current_index}/{total_games}] TOO MANY REQUESTS - stopping")
            sys.exit(1)
        elif response.status_code == 403:
            print(f"[{current_index}/{total_games}] FORBIDDEN - stopping")
            sys.exit(1)
        elif response.status_code != 200:
            return None

        data = response.json()
        summary = data.get('query_summary', {})

        return {
            'positive_reviews': summary.get('total_positive', 0),
            'negative_reviews': summary.get('total_negative', 0),
            'total_reviews': summary.get('total_reviews', 0),
            'review_score_desc': summary.get('review_score_desc', ''),
        }

    except requests.exceptions.RequestException as e:
        print(f"[{current_index}/{total_games}] ✗ {game_name} (review error: {e})")
        return None


def scrape_tags(app_id, game_name, current_index, total_games):
    clean_name = re.sub(r'[^a-zA-Z0-9_]', '_', game_name)
    url = f"https://store.steampowered.com/app/{app_id}/{clean_name}/"
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
    cookies = {
        'birthtime': '0',
        'lastagecheckage': '1-0-1990',
        'mature_content': '1'
    }

    try:
        response = requests.get(url, headers=headers, cookies=cookies, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        tags = [tag.text.strip() for tag in soup.find_all('a', attrs={'class': 'app_tag'})]
        return tags

    except requests.exceptions.RequestException as e:
        print(f"[{current_index}/{total_games}] ✗ {game_name} (tag error: {e})")
        return []

if __name__ == "__main__":
    games = get_unprocessed_games()
    total = len(games)
    print(f"Found {total} unprocessed games")

    for index, game in enumerate(games, start=1):
        time.sleep(1.5)
        game_data = fetch_game_details(game, index, total)
        if not game_data:
            continue

        reviews = fetch_reviews(game['app_id'], game['name'], index, total)
        if reviews:
            game_data.update(reviews)
        else:
            game_data['positive_reviews'] = 0
            game_data['negative_reviews'] = 0
            game_data['total_reviews'] = 0
            game_data['review_score_desc'] = ""

        tags = scrape_tags(game['app_id'], game['name'], index, total)
        game_data['tags'] = tags

        save_game(game_data)
        print(f"[{index}/{total}] ✓ {game['name']} | Tags: {len(tags)} | Reviews: {game_data['positive_reviews']}+")

        if index % SAVE_INTERVAL == 0:
            print(f"--- Checkpoint: {index}/{total} games processed ---")