import sqlite3

def create_and_seed_db():
    conn = sqlite3.connect('company.db')
    cursor = conn.cursor()

    # Create tables
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            signup_date DATE
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS sales (
            id INTEGER PRIMARY KEY,
            user_id INTEGER,
            amount REAL,
            sale_date DATE,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')

    # Clear existing data
    cursor.execute('DELETE FROM sales')
    cursor.execute('DELETE FROM users')

    # Seed users
    users = [
        (1, 'Alice Smith', 'alice@example.com', '2023-01-15'),
        (2, 'Bob Johnson', 'bob@example.com', '2023-02-20'),
        (3, 'Charlie Williams', 'charlie@example.com', '2023-03-10'),
    ]
    cursor.executemany('INSERT INTO users VALUES (?, ?, ?, ?)', users)

    # Seed sales
    sales = [
        (1, 1, 150.50, '2023-01-16'),
        (2, 1, 200.00, '2023-02-01'),
        (3, 2, 99.99, '2023-02-25'),
        (4, 3, 350.00, '2023-03-15'),
        (5, 3, 75.25, '2023-04-01'),
    ]
    cursor.executemany('INSERT INTO sales VALUES (?, ?, ?, ?)', sales)

    conn.commit()
    conn.close()
    print("Database 'company.db' created and seeded successfully!")

if __name__ == '__main__':
    create_and_seed_db()
