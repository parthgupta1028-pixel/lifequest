import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from config.settings import settings

logger = logging.getLogger("lifequest.database")

Base = declarative_base()

def get_engine():
    target_url = settings.DATABASE_URL
    is_vercel = os.environ.get("VERCEL") is not None
    
    # If on Vercel and DATABASE_URL is pointing to localhost or 127.0.0.1, bypass immediately!
    # Localhost MySQL never exists in Vercel cloud serverless containers.
    if is_vercel and ("localhost" in target_url or "127.0.0.1" in target_url):
        logger.info("Running on Vercel with localhost database URL. Bypassing localhost MySQL connection attempt.")
        target_url = ""

    if target_url and (target_url.startswith("mysql") or target_url.startswith("postgresql")):
        try:
            connect_args = {"connect_timeout": 3}
            engine = create_engine(target_url, pool_pre_ping=True, connect_args=connect_args)
            with engine.connect() as conn:
                db_type = "MySQL" if target_url.startswith("mysql") else "PostgreSQL"
                logger.info(f"Successfully connected to {db_type} database.")
                return engine
        except Exception as e:
            db_type = "MySQL" if target_url.startswith("mysql") else "PostgreSQL"
            logger.warning(f"Could not connect to {db_type} at '{target_url}' ({e}). Falling back to SQLite.")

    # Fallback to SQLite
    fallback_url = settings.SQLITE_FALLBACK_URL
    if is_vercel:
        tmp_db = "/tmp/lifequest.db"
        if not os.path.exists(tmp_db):
            backend_dir = os.path.dirname(os.path.abspath(__file__))
            src_db = os.path.join(backend_dir, "lifequest.db")
            if os.path.exists(src_db):
                import shutil
                try:
                    shutil.copy(src_db, tmp_db)
                except Exception:
                    pass
        fallback_url = f"sqlite:///{tmp_db}"
    elif fallback_url.startswith("sqlite:///."):
        backend_dir = os.path.dirname(os.path.abspath(__file__))
        db_file = os.path.join(backend_dir, "lifequest.db").replace("\\", "/")
        fallback_url = f"sqlite:///{db_file}"

    logger.info(f"Using SQLite database: '{fallback_url}'")
    return create_engine(
        fallback_url, 
        connect_args={"check_same_thread": False}
    )

engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
