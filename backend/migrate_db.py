import os
import sqlite3
import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "lifequest.db")

def run_migration():
    print(f"[MIGRATION] Checking database at: {DB_PATH}")
    if not os.path.exists(DB_PATH):
        print("[MIGRATION] Database not found at path, skipping.")
        return

    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = OFF;")
    c = conn.cursor()

    # 1. Check users table
    user_cols = [col[1] for col in c.execute("PRAGMA table_info(users)").fetchall()]
    print(f"[MIGRATION] Current users columns: {user_cols}")

    if "role" not in user_cols:
        print("[MIGRATION] Adding column 'role' to users...")
        c.execute("ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user'")

    if "is_active" not in user_cols:
        print("[MIGRATION] Adding column 'is_active' to users...")
        c.execute("ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT 1")

    # Set initial admins: quest_hero and parth
    c.execute("UPDATE users SET role = 'admin' WHERE id = 1 OR username = 'quest_hero' OR username = 'parth'")
    c.execute("UPDATE users SET is_active = 1 WHERE is_active IS NULL")
    conn.commit()

    # 2. Check skills table
    skill_cols = [col[1] for col in c.execute("PRAGMA table_info(skills)").fetchall()]
    print(f"[MIGRATION] Current skills columns: {skill_cols}")

    # Recreate skills table without the global UNIQUE constraint on name
    # so different users can have skills with the same name.
    c.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='skills'")
    create_sql = c.fetchone()[0]
    
    needs_recreate = "UNIQUE" in create_sql.upper() or "user_id" not in skill_cols

    if needs_recreate:
        print("[MIGRATION] Migrating skills table schema (supporting user_id and non-global unique name)...")
        c.execute("""
            CREATE TABLE IF NOT EXISTS skills_v2 (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                name VARCHAR(50) NOT NULL,
                description VARCHAR(255),
                icon VARCHAR(50) DEFAULT 'zap',
                color VARCHAR(30) DEFAULT '#10B981',
                is_active BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Copy existing global skills into skills_v2
        c.execute("SELECT id, name, description, icon, color FROM skills")
        rows = c.fetchall()
        for r in rows:
            c.execute("""
                INSERT OR IGNORE INTO skills_v2 (id, user_id, name, description, icon, color, is_active, created_at)
                VALUES (?, NULL, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
            """, (r[0], r[1], r[2], r[3], r[4]))
            
        c.execute("DROP TABLE skills")
        c.execute("ALTER TABLE skills_v2 RENAME TO skills")
        c.execute("CREATE INDEX IF NOT EXISTS ix_skills_id ON skills (id)")
        c.execute("CREATE INDEX IF NOT EXISTS ix_skills_user_id ON skills (user_id)")
        conn.commit()
        print("[MIGRATION] Skills table updated successfully.")

    # 3. For each existing user: ensure their user_skills and tasks map to user-scoped skills
    users = c.execute("SELECT id, username FROM users").fetchall()
    global_skills = c.execute("SELECT id, name, description, icon, color FROM skills WHERE user_id IS NULL").fetchall()
    
    for user_id, username in users:
        # Check if user already has custom skills
        user_skills_count = c.execute("SELECT COUNT(*) FROM skills WHERE user_id = ?", (user_id,)).fetchone()[0]
        if user_skills_count == 0 and len(global_skills) > 0:
            print(f"[MIGRATION] Cloning starter skills for user #{user_id} ({username})...")
            skill_map = {} # old_global_id -> new_user_skill_id
            for g_id, g_name, g_desc, g_icon, g_color in global_skills:
                c.execute("""
                    INSERT INTO skills (user_id, name, description, icon, color, is_active, created_at)
                    VALUES (?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
                """, (user_id, g_name, g_desc, g_icon, g_color))
                new_skill_id = c.lastrowid
                skill_map[g_id] = new_skill_id

                # Check existing UserSkill record
                us_row = c.execute("""
                    SELECT id, xp, level FROM user_skills 
                    WHERE user_id = ? AND skill_id = ?
                """, (user_id, g_id)).fetchone()

                if us_row:
                    us_id, xp, level = us_row
                    # Update UserSkill to point to new user skill
                    c.execute("""
                        UPDATE user_skills SET skill_id = ? WHERE id = ?
                    """, (new_skill_id, us_id))
                else:
                    c.execute("""
                        INSERT INTO user_skills (user_id, skill_id, xp, level, updated_at)
                        VALUES (?, ?, 0, 1, CURRENT_TIMESTAMP)
                    """, (user_id, new_skill_id))

            # Update tasks for this user to point to their user skill IDs
            for old_id, new_id in skill_map.items():
                c.execute("""
                    UPDATE tasks SET skill_id = ? WHERE user_id = ? AND skill_id = ?
                """, (new_id, user_id, old_id))

    conn.commit()
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.close()
    print("[MIGRATION] Migration completed successfully!")

if __name__ == "__main__":
    run_migration()
