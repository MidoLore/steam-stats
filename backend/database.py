import sqlite3
from pathlib import Path

# Database path to project root
DB_PATH = Path(__file__).parent.parent / 'steam.db'

def get_db_connection():
    """ Return the connection to the Steam database with row factory """
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def setup_database():
    """ Creates the games, tags and game_tags tables if they don't exist """
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS games (
            steam_id          INTEGER PRIMARY KEY,
            name              TEXT,
            short_description TEXT,
            price             REAL,
            is_free           BOOLEAN,
            release_date      TEXT,
            developer         TEXT,
            publisher         TEXT,
            review_score_desc TEXT,
            positive_reviews  INTEGER,
            negative_reviews  INTEGER,
            total_reviews     INTEGER
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tags (
            id   INTEGER PRIMARY KEY,
            name TEXT UNIQUE
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS game_tags (
            game_id INTEGER REFERENCES games(steam_id),
            tag_id  INTEGER REFERENCES tags(id),
            PRIMARY KEY (game_id, tag_id)
        )
    ''')

    conn.commit()
    conn.close()
    print("Database setup complete")

if __name__ == "__main__":
    setup_database()