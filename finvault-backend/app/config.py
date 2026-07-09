"""
Central application configuration.

Reads from environment variables (and an optional .env file). Everything else
in the app imports `settings` from here instead of calling os.environ directly,
so there's a single source of truth for configuration.
"""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # SQLAlchemy connection string. SQLite by default for local-only development.
    database_url: str = "sqlite:///./finvault.db"

    # Origins allowed to call this API. The Vite dev server runs on 5173 by default.
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    app_name: str = "Finvault API"
    app_version: str = "0.2.0"

    telegram_bot_token: str = "8113774306:AAG7h42s4qj-NlOXHbVUVGhZubqF13Bg3FA"
    telegram_chat_id: str = "2137738715"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    """Cached settings instance — env is only parsed once per process."""
    return Settings()


settings = get_settings()
