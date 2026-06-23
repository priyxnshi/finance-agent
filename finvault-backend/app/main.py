"""
Finvault API entry point.

Run locally with:
    uvicorn app.main:app --reload

Interactive docs (Swagger UI) are then available at:
    http://127.0.0.1:8000/docs
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError
from starlette.requests import Request

from app.config import settings
from app.database import init_db
from app.routes import analytics, expenses, goals, ml, upload

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description=(
        "Backend foundation for Finvault — expense management, CSV import, "
        "and spending analytics. Charts and ML run in the frontend / later "
        "phases; this API only deals in numbers and JSON."
    ),
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()


# --- Centralized error handling -------------------------------------------
# Routes/services raise plain HTTPException or let SQLAlchemy errors bubble
# up; these handlers make sure clients always get a consistent JSON shape
# instead of a raw traceback, regardless of where the error originated.


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"detail": "Validation error", "errors": exc.errors()},
    )


@app.exception_handler(SQLAlchemyError)
async def db_exception_handler(request: Request, exc: SQLAlchemyError):
    return JSONResponse(
        status_code=500,
        content={"detail": "Database error", "errors": str(exc)},
    )


# --- Routers -----------------------------------------------------------
app.include_router(expenses.router)
app.include_router(upload.router)
app.include_router(analytics.router)
app.include_router(goals.router)
app.include_router(ml.router)


@app.get("/", tags=["Health"])
def root():
    """Basic health check / sanity endpoint."""
    return {"status": "ok", "service": settings.app_name, "version": settings.app_version}
