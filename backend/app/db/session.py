from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# IMPORTANTE: registra tutti i modelli (Role, User, Site, ecc.)
from app.db import base

# Engine configuration for MySQL
engine = create_engine(settings.SQLALCHEMY_DATABASE_URI, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
