import time
import requests
from dotenv import load_dotenv
import os
from ..database import get_db_connection

load_dotenv() # Gets the .env file
STEAM_API_KEY = os.getenv("STEAM_API_KEY") # Gets steam API key from .env file

def get_app_list():
    """ Fetches app list from SteamAPI and returns a list of games"""
    all_apps = []
    last_appid = 0
    while True:
        try:
            url = "https://api.steampowered.com/IStoreService/GetAppList/v1/"
            params = {
                'key': STEAM_API_KEY,
                'include_games': True,
                'include_dlc': False,
                'include_software': False,
                'include_videos': False,
                'max_results': 50000,
                'last_appid': last_appid
            }
            response = requests.get(url, params=params, timeout=30)
            steam_data = response.json()
            apps = steam_data.get('response', {}).get('apps', [])
            all_apps.extend(apps)
            last_appid = apps[-1]['appid']
            print(f"Fetched {len(apps)} apps. Total: {len(all_apps)}")
            print(f"Last app ID in this batch: {apps[-1]['name']}")
            if len(apps) < 50000:
                break # Breaks the loop since on the last page fewer result means no more data
            else:
                time.sleep(2)
        except requests.exceptions.RequestException as err:
            print(f"Error fetching data: {err}")
            break
    return all_apps

def save_app_ids(apps):
    """ Saves the game ids and name to database """
    conn = get_db_connection()
    cursor = conn.cursor()
    for app in apps:
        cursor.execute('''
            INSERT OR IGNORE INTO games (steam_id, name)
            VALUES (?, ?)
        ''', (app['appid'], app['name']))
    conn.commit()
    conn.close()
    print(f"Saved {len(apps)} games to database")



if __name__ == "__main__":
    all_apps = get_app_list()
    save_app_ids(apps=all_apps)