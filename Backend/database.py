import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent.parent / 'steam.db'

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def setup_database():
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
            positive_reviews  INTEGER,
            negative_reviews  INTEGER
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

def migrate_database():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("ALTER TABLE games ADD COLUMN short_description TEXT")
    cursor.execute("ALTER TABLE games ADD COLUMN price REAL")
    cursor.execute("ALTER TABLE games ADD COLUMN is_free BOOLEAN")
    cursor.execute("ALTER TABLE games ADD COLUMN release_date TEXT")
    cursor.execute("ALTER TABLE games ADD COLUMN developer TEXT")
    cursor.execute("ALTER TABLE games ADD COLUMN publisher TEXT")
    cursor.execute("ALTER TABLE games ADD COLUMN positive_reviews INTEGER")
    cursor.execute("ALTER TABLE games ADD COLUMN negative_reviews INTEGER")

    conn.commit()
    conn.close()
    print("Migration complete")

if __name__ == "__main__":
    setup_database()