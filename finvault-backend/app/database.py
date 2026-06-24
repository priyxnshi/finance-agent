"""
Database connection setup.

Everything SQLAlchemy-related that's shared across the app lives here:
the engine, the session factory, the declarative Base that models inherit
from, and the `get_db` dependency that routes use to obtain a session.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.config import settings

# `check_same_thread` is only needed for SQLite — it lets the connection be
# used across the threads FastAPI's threadpool may run a request on.
connect_args = (
    {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
)

engine = create_engine(settings.database_url, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """
    FastAPI dependency that yields a database session and guarantees it's
    closed after the request, even if an exception is raised.

    Usage in a route:
        def my_route(db: Session = Depends(get_db)):
            ...
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Create all tables that don't exist yet. Called once on app startup."""
    # Import models here (not at module top-level) so they're registered on
    # Base.metadata before create_all runs, without causing circular imports.
    from app.models import expense, goal, recommendation, user_behavior, agent  # noqa: F401

    Base.metadata.create_all(bind=engine)
