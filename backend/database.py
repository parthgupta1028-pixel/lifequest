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
        # Check if postgres
        if target_url.startswith("postgresql"):
            # Test connection with a quick pool timeout
            engine = create_engine(target_url, pool_pre_ping=True, connect_args={"connect_timeout": 3})
            with engine.connect() as conn:
                logger.info("Successfully connected to PostgreSQL database.")
                return engine
        else:
            engine = create_engine(target_url)
            return engine
    except Exception as e:
        logger.warning(
            f"Could not connect to PostgreSQL at '{target_url}' ({e}). "
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
