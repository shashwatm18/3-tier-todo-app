import os
import logging
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import OperationalError, SQLAlchemyError

# Load environment configuration
load_dotenv()

from app.database import Base, engine
from app.routes import todos

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("todo_app")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler: creates database tables on startup if they don't exist."""
    logger.info("Initializing database tables...")
    try:
        # Create tables defined in models
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables initialized successfully.")
    except OperationalError as exc:
        logger.warning(
            "Could not connect to PostgreSQL on startup (%s). "
            "Tables will be created once database connection is available.",
            exc,
        )
    except Exception as exc:
        logger.error("Unexpected error initializing tables: %s", exc)
    yield
    logger.info("Shutting down Todo application.")


app = FastAPI(
    title="3-Tier Todo API",
    description="RESTful backend API for the 3-Tier Todo Application, powered by FastAPI and PostgreSQL.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS for local development
# Reads comma-separated origins from CORS_ORIGINS or falls back to standard local ports
raw_cors = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173,http://localhost:8080",
)
cors_origins = [origin.strip() for origin in raw_cors.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    """Graceful error handler for unexpected database failures."""
    logger.error("Database error on %s: %s", request.url.path, exc)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "A database error occurred. Please verify PostgreSQL is running and credentials are valid.",
            "error_type": exc.__class__.__name__,
        },
    )


# Mount routers
# Mounting both /todos (as required by specification) and /api/todos for proxy convenience
app.include_router(todos.router)
app.include_router(todos.router, prefix="/api")


@app.get("/", summary="Root Health Check", tags=["General"])
def root():
    """Health check endpoint returning API status and documentation links."""
    return {
        "status": "healthy",
        "app": "3-Tier Todo API",
        "version": "1.0.0",
        "documentation": "/docs",
        "endpoints": {
            "get_todos": "GET /todos",
            "create_todo": "POST /todos",
            "update_todo": "PUT /todos/{id}",
            "delete_todo": "DELETE /todos/{id}",
        },
    }
