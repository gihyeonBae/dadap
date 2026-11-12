from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    OPENAI_API_KEY: str
    STT_PROVIDER: str = "google"
    VISION_MODEL_PATH: str = "models/vision"
    OPENAI_API_BASE: str | None = None

    model_config = SettingsConfigDict(env_file=".env")


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()