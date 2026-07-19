from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from database import get_db_connection

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

@app.get("/games/top")
def get_top_games(limit: int = 50):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT g.steam_id, g.name, g.price, g.positive_reviews,
               g.negative_reviews, g.total_reviews, g.review_score_desc,
               g.release_date, g.developer
        FROM games g
        WHERE g.total_reviews >= 10
        ORDER BY positive_reviews DESC
        LIMIT ?
    ''', (limit,))
    games = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return games

@app.get("/games/by-tags")
def get_games_by_tags(tags: str, limit: int = 25):
    # tags comes in as comma separated string e.g. "Action,RPG,Indie"
    tag_list = [t.strip() for t in tags.split(',')]
    tag_count = len(tag_list)

    conn = get_db_connection()
    cursor = conn.cursor()

    placeholders = ','.join(['?' for _ in tag_list])

    cursor.execute(f'''
        SELECT g.steam_id, g.name, g.price, g.positive_reviews, 
               g.negative_reviews, g.total_reviews, g.review_score_desc,
               g.release_date, g.developer
        FROM games g
        JOIN game_tags gt ON g.steam_id = gt.game_id
        JOIN tags t ON gt.tag_id = t.id
        WHERE t.name IN ({placeholders})
        GROUP BY g.steam_id
        HAVING COUNT(DISTINCT t.name) = ?
        ORDER BY g.positive_reviews DESC
        LIMIT ?
    ''', (*tag_list, tag_count, limit))

    games = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return games