from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "LifeQuest API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Security
    SECRET_KEY: str = "lifequest-super-secret-key-change-in-production-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    # Primary: PostgreSQL. Fallback will handle SQLite automatically if PostgreSQL is unreachable.
    DATABASE_URL: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/lifequest_db"
    SQLITE_FALLBACK_URL: str = "sqlite:///./lifequest.db"
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
