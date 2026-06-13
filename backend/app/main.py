from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import quotes, rfqs

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Supplier Quote Comparison API",
    description="API for managing RFQs and comparing supplier quotes.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(rfqs.router)
app.include_router(quotes.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
