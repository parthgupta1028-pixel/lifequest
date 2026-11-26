import os
from pydantic_settings import BaseSettings
from typing import Optional

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_SQLITE_PATH = os.path.join(BACKEND_DIR, "lifequest.db").replace("\\", "/")
DEFAULT_SQLITE_URL = f"sqlite:///{DEFAULT_SQLITE_PATH}"

class Settings(BaseSettings):
    PROJECT_NAME: str = "LifeQuest API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Security
    SECRET_KEY: str = "lifequest-super-secret-key-change-in-production-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    # Primary: MySQL (port 3306). Fallback will handle SQLite automatically if MySQL is unreachable.
    DATABASE_URL: str = "mysql+pymysql://root:password@localhost:3306/lifequest_db"
    SQLITE_FALLBACK_URL: str = DEFAULT_SQLITE_URL
    
    class Config:
        env_file = os.path.join(BACKEND_DIR, ".env")
        extra = "ignore"

settings = Settings()
