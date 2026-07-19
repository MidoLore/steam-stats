import time
import requests
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))
from database import get_db_connection

STORE_URL = "https://store.steampowered.com/api/appdetails"


def get_all_games():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT steam_id, name FROM games WHERE price_updated = 0 AND release_date IS NOT NULL")
    games = [{'app_id': row['steam_id'], 'name': row['name']} for row in cursor.fetchall()]
    conn.close()
    return games


def update_price(app_id, price):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE games SET price = ?, price_updated = 1 WHERE steam_id = ?", (price, app_id))
    conn.commit()
    conn.close()


if __name__ == "__main__":
    games = get_all_games()
    total = len(games)
    print(f"Found {total} games to update")

    for index, game in enumerate(games, start=1):
        try:
            response = requests.get(STORE_URL, params={
                'appids': game['app_id'],
                'l': 'english',
                'cc': 'us',
                'filters': 'price_overview'
            }, timeout=10)

            app_data = response.json().get(str(game['app_id']))
            if not app_data or not app_data.get('success'):
                print(f"[{index}/{total}] ✗ {game['name']} (no data)")
                continue

            data = app_data.get('data', {})
            if isinstance(data, list) or not data:
                update_price(game['app_id'], 0.0)
                print(f"[{index}/{total}] ✓ {game['name']} — Free")
                continue

            is_free = data.get('is_free', False)
            if is_free:
                price = 0.0
            else:
                price_overview = data.get('price_overview')
                price = price_overview['initial'] / 100 if price_overview else None

            update_price(game['app_id'], price)
            print(f"[{index}/{total}] ✓ {game['name']} — ${price}")

        except Exception as e:
            print(f"[{index}/{total}] ✗ {game['name']} ({e})")

        time.sleep(1.5)