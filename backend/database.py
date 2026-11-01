import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from config.settings import settings

logger = logging.getLogger("lifequest.database")

Base = declarative_base()

def get_engine():
    target_url = settings.DATABASE_URL
    try:
        # Check if MySQL or PostgreSQL
        if target_url.startswith("mysql") or target_url.startswith("postgresql"):
            connect_args = {"connect_timeout": 3}
            engine = create_engine(target_url, pool_pre_ping=True, connect_args=connect_args)
            with engine.connect() as conn:
                db_type = "MySQL" if target_url.startswith("mysql") else "PostgreSQL"
                logger.info(f"Successfully connected to {db_type} database.")
                return engine
        else:
            engine = create_engine(target_url)
            return engine
    except Exception as e:
        db_type = "MySQL" if target_url.startswith("mysql") else "PostgreSQL"
        logger.warning(
            f"Could not connect to {db_type} at '{target_url}' ({e}). "
            f"Falling back to local SQLite database: '{settings.SQLITE_FALLBACK_URL}'"
        )
        return create_engine(
            settings.SQLITE_FALLBACK_URL, 
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
