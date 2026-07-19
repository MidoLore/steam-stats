from datetime import datetime
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))
from database import get_db_connection

def parse_date(date_str):
    if not date_str:
        return None
    formats = [
        '%b %d, %Y',    # Nov 16, 2011
        '%d %b, %Y',    # 16 Nov, 2011
        '%B %d, %Y',    # November 16, 2011
        '%b %Y',        # Nov 2011
        '%Y',           # 2011
    ]
    for fmt in formats:
        try:
            return datetime.strptime(date_str.strip(), fmt).strftime('%Y-%m-%d')
        except:
            continue
    return None

if __name__ == "__main__":
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT steam_id, release_date FROM games WHERE release_date IS NOT NULL")
    games = cursor.fetchall()
    total = len(games)
    print(f"Found {total} dates to reformat")

    failed = []
    for index, row in enumerate(games, start=1):
        formatted = parse_date(row['release_date'])
        if formatted:
            cursor.execute("UPDATE games SET release_date = ? WHERE steam_id = ?", (formatted, row['steam_id']))
        else:
            failed.append((row['steam_id'], row['release_date']))

        if index % 1000 == 0:
            conn.commit()
            print(f"[{index}/{total}] processed")

    conn.commit()
    conn.close()

    print(f"Done! Failed to parse {len(failed)} dates:")
    for steam_id, date in failed[:20]:
        print(f"  {steam_id}: '{date}'")