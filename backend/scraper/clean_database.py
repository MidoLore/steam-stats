from database import get_db_connection

if __name__ == "__main__":
    conn = get_db_connection()
    cursor = conn.cursor()

    # Only delete games with no data at all
    cursor.execute("DELETE FROM games WHERE release_date IS NULL AND positive_reviews IS NULL")
    cursor.execute("DELETE FROM games WHERE release_date = 'coming_soon'")
    cursor.execute("DELETE FROM games WHERE release_date = 'no_data'")
    cursor.execute("DELETE FROM games WHERE release_date = ''")

    conn.commit()
    conn.close()
    print("Database is cleaned")