from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from database import get_db_connection
from typing import Optional
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/tags/top")
def get_top_tags(limit: int = 20):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT t.name, COUNT(*) as count
        FROM game_tags gt
        JOIN tags t ON gt.tag_id = t.id
        GROUP BY t.name
        ORDER BY count DESC
        LIMIT ?
    ''', (limit,))
    tags = [{'name': row['name'], 'count': row['count']} for row in cursor.fetchall()]
    conn.close()
    return tags


def build_filters(date_from, date_to, min_rating, min_price, max_price, min_reviews, max_reviews):
    clauses, params = [], []
    if date_from or date_to:
        clauses.append("g.release_date != ''")
    if date_from:
        clauses.append("g.release_date >= ?"); params.append(date_from)
    if date_to:
        clauses.append("g.release_date <= ?"); params.append(date_to)
    if min_rating is not None:
        clauses.append("g.total_reviews > 0 AND g.positive_reviews * 100.0 / g.total_reviews >= ?")
        params.append(min_rating)
    if min_price is not None:
        clauses.append("g.price >= ?"); params.append(min_price)
    if max_price is not None:
        clauses.append("g.price <= ?"); params.append(max_price)
    if min_reviews is not None:
        clauses.append("g.total_reviews >= ?"); params.append(min_reviews)
    if max_reviews is not None:
        clauses.append("g.total_reviews <= ?"); params.append(max_reviews)
    where = ''.join(f' AND {c}' for c in clauses)
    return where, params

@app.get("/games/top")
def get_top_games(limit: int = 50, page: int = 1,
                  date_from: Optional[str] = None, date_to: Optional[str] = None,
                  min_rating: Optional[float] = None,
                  min_price: Optional[float] = None, max_price: Optional[float] = None,
                  min_reviews: Optional[int] = None, max_reviews: Optional[int] = None):
    offset = (page - 1) * limit
    where, params = build_filters(date_from, date_to, min_rating, min_price, max_price, min_reviews, max_reviews)
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(f'SELECT COUNT(*) FROM games g WHERE g.total_reviews >= 10 {where}', params)
    total = cursor.fetchone()[0]

    cursor.execute(f'''
        SELECT g.steam_id, g.name, g.price, g.positive_reviews,
               g.negative_reviews, g.total_reviews, g.review_score_desc,
               g.release_date, g.developer
        FROM games g
        WHERE g.total_reviews >= 10 {where}
        ORDER BY g.positive_reviews DESC
        LIMIT ? OFFSET ?
    ''', (*params, limit, offset))
    games = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return {'games': games, 'total': total, 'page': page, 'limit': limit}
@app.get("/games/by-tags")
def get_games_by_tags(tags: str, limit: int = 50, page: int = 1):
    tag_list = [t.strip() for t in tags.split(',')]
    tag_count = len(tag_list)
    offset = (page - 1) * limit
    conn = get_db_connection()
    cursor = conn.cursor()

    placeholders = ','.join(['?' for _ in tag_list])

    # Count total matches
    cursor.execute(f'''
        SELECT COUNT(*) FROM (
            SELECT g.steam_id
            FROM games g
            JOIN game_tags gt ON g.steam_id = gt.game_id
            JOIN tags t ON gt.tag_id = t.id
            WHERE t.name IN ({placeholders})
            GROUP BY g.steam_id
            HAVING COUNT(DISTINCT t.name) = ?
        )
    ''', (*tag_list, tag_count))
    total = cursor.fetchone()[0]

    # Get paginated games with their tags
    cursor.execute(f'''
        SELECT g.steam_id, g.name, g.price, g.positive_reviews,
               g.negative_reviews, g.total_reviews, g.review_score_desc,
               g.release_date, g.developer,
               GROUP_CONCAT(all_tags.name) as tags
        FROM games g
        JOIN game_tags gt ON g.steam_id = gt.game_id
        JOIN tags t ON gt.tag_id = t.id
        LEFT JOIN game_tags gt2 ON g.steam_id = gt2.game_id
        LEFT JOIN tags all_tags ON gt2.tag_id = all_tags.id
        WHERE t.name IN ({placeholders})
        GROUP BY g.steam_id
        HAVING COUNT(DISTINCT t.name) = ?
        ORDER BY g.positive_reviews DESC
        LIMIT ? OFFSET ?
    ''', (*tag_list, tag_count, limit, offset))

    games = []
    for row in cursor.fetchall():
        game = dict(row)
        game['tags'] = list(set(game['tags'].split(','))) if game['tags'] else []
        games.append(game)

    conn.close()
    return {'games': games, 'total': total, 'page': page, 'limit': limit}

@app.get("/games/search")
def search_games(q: str, limit: int = 1000):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT steam_id, name, price, review_score_desc, total_reviews
        FROM games
        WHERE name LIKE ?
        ORDER BY
            CASE WHEN LOWER(name) = LOWER(?) THEN 0 ELSE 1 END,
            total_reviews DESC
        LIMIT ?
    ''', (f'%{q}%', q, limit))
    games = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return games

@app.get("/games/{steam_id}")
def get_game(steam_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM games WHERE steam_id = ?", (steam_id,))
    row = cursor.fetchone()
    if not row:
        return {"error": "Game not found"}
    game = dict(row)
    cursor.execute('''
        SELECT t.name FROM tags t
        JOIN game_tags gt ON t.id = gt.tag_id
        WHERE gt.game_id = ?
    ''', (steam_id,))
    game['tags'] = [row['name'] for row in cursor.fetchall()]
    conn.close()
    return game

@app.get("/tags/search")
def search_tags(q: str, limit: int = 10):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT t.name, COUNT(*) as count
        FROM game_tags gt
        JOIN tags t ON gt.tag_id = t.id
        WHERE t.name LIKE ?
        GROUP BY t.name
        ORDER BY
            CASE WHEN LOWER(t.name) = LOWER(?) THEN 0 ELSE 1 END,
            count DESC
        LIMIT ?
    ''', (f'%{q}%', q, limit))
    tags = [{'name': row['name'], 'count': row['count']} for row in cursor.fetchall()]
    conn.close()
    return tags

@app.get("/tags/all")
def get_all_tags():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT t.name, COUNT(*) as count
        FROM game_tags gt
        JOIN tags t ON gt.tag_id = t.id
        GROUP BY t.name
        ORDER BY t.name
    ''')
    tags = [{'name': row['name'], 'count': row['count']} for row in cursor.fetchall()]
    conn.close()
    return tags

@app.get("/tags/stats")
def get_tag_stats(tags: str):
    tag_list = [t.strip() for t in tags.split(',')]
    tag_count = len(tag_list)
    conn = get_db_connection()
    cursor = conn.cursor()
    placeholders = ','.join(['?' for _ in tag_list])

    # Get all matching game ids
    cursor.execute(f'''
        SELECT g.steam_id
        FROM games g
        JOIN game_tags gt ON g.steam_id = gt.game_id
        JOIN tags t ON gt.tag_id = t.id
        WHERE t.name IN ({placeholders})
        GROUP BY g.steam_id
        HAVING COUNT(DISTINCT t.name) = ?
    ''', (*tag_list, tag_count))
    game_ids = [row['steam_id'] for row in cursor.fetchall()]

    if not game_ids:
        conn.close()
        return {'total_games': 0, 'first_game': None, 'first_year': None, 'peak_year': None, 'peak_count': 0, 'avg_positive_pct': 0}

    id_placeholders = ','.join(['?' for _ in game_ids])

    # Stats
    cursor.execute(f'''
        SELECT 
            COUNT(*) as total_games,
            COALESCE(ROUND(AVG(CASE WHEN total_reviews > 0 
                THEN positive_reviews * 100.0 / total_reviews 
                END)), 0) as avg_positive_pct
        FROM games WHERE steam_id IN ({id_placeholders})
    ''', game_ids)
    stats = dict(cursor.fetchone())

    # First game
    cursor.execute(f'''
        SELECT name, release_date 
        FROM games 
        WHERE steam_id IN ({id_placeholders}) AND release_date IS NOT NULL AND release_date != ''
        ORDER BY release_date ASC 
        LIMIT 1
    ''', game_ids)
    first = cursor.fetchone()
    stats['first_game'] = first['name'] if first else None
    stats['first_year'] = first['release_date'][:4] if first else None

    # Peak year
    cursor.execute(f'''
        SELECT strftime('%Y', release_date) as year, COUNT(*) as count
        FROM games 
        WHERE steam_id IN ({id_placeholders}) AND release_date IS NOT NULL AND release_date != ''
        GROUP BY year
        ORDER BY count DESC
        LIMIT 1
    ''', game_ids)
    peak = cursor.fetchone()
    stats['peak_year'] = peak['year'] if peak else None
    stats['peak_count'] = peak['count'] if peak else 0

    conn.close()
    return stats


@app.get("/tags/timeline")
def get_tag_timeline(tags: str):
    tag_list = [t.strip() for t in tags.split(',')]
    tag_count = len(tag_list)
    conn = get_db_connection()
    cursor = conn.cursor()
    placeholders = ','.join(['?' for _ in tag_list])

    cursor.execute(f'''
        SELECT strftime('%Y', g.release_date) as year, COUNT(DISTINCT g.steam_id) as count
        FROM games g
        JOIN game_tags gt ON g.steam_id = gt.game_id
        JOIN tags t ON gt.tag_id = t.id
        WHERE t.name IN ({placeholders})
          AND g.release_date IS NOT NULL AND g.release_date != ''
        GROUP BY g.steam_id
        HAVING COUNT(DISTINCT t.name) = ?
    ''', (*tag_list, tag_count))

    # The above groups by game first for the HAVING,
    # but we need to regroup by year
    # Let me use a subquery instead

    cursor.execute(f'''
        SELECT year, COUNT(*) as count FROM (
            SELECT strftime('%Y', g.release_date) as year
            FROM games g
            JOIN game_tags gt ON g.steam_id = gt.game_id
            JOIN tags t ON gt.tag_id = t.id
            WHERE t.name IN ({placeholders})
              AND g.release_date IS NOT NULL AND g.release_date != ''
            GROUP BY g.steam_id
            HAVING COUNT(DISTINCT t.name) = ?
        )
        GROUP BY year
        ORDER BY year ASC
    ''', (*tag_list, tag_count))

    timeline = [{'year': row['year'], 'count': row['count']} for row in cursor.fetchall()]
    conn.close()
    return timeline

@app.get("/tags/paired")
def paired_tags(tags: str, limit: int = 12):
    tag_list = [t.strip() for t in tags.split(',') if t.strip()]
    if not tag_list:
        return []
    tag_count = len(tag_list)
    placeholders = ','.join(['?' for _ in tag_list])
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(f'''
        SELECT t.name, COUNT(*) as count
        FROM game_tags gt
        JOIN tags t ON gt.tag_id = t.id
        WHERE gt.game_id IN (
            SELECT gt2.game_id
            FROM game_tags gt2
            JOIN tags t2 ON gt2.tag_id = t2.id
            WHERE t2.name IN ({placeholders})
            GROUP BY gt2.game_id
            HAVING COUNT(DISTINCT t2.name) = ?
        )
        AND t.name NOT IN ({placeholders})
        GROUP BY t.name
        ORDER BY count DESC
        LIMIT ?
    ''', (*tag_list, tag_count, *tag_list, limit))

    result = [{'name': row['name'], 'count': row['count']} for row in cursor.fetchall()]
    conn.close()
    return result