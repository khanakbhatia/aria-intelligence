from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.chat import router as chat_router
from fastapi import WebSocket, WebSocketDisconnect
from app.websocket.manager import manager
from app.api.analytics import router as analytics_router


app = FastAPI(
    title="ARIA Backend",
    version="1.0.0"
)
app.include_router(analytics_router, prefix="/api")

app.add_middleware(

    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router, prefix="/api")

@app.get("/")
async def root():
    return {
        "status": "ARIA backend operational"
    }

@app.get("/health")
async def health():
    return {
        "healthy": True
    }

@app.websocket("/ws/{conversation_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    conversation_id: str
):

    await manager.connect(
        websocket,
        conversation_id
    )

    try:

        while True:

            await websocket.receive_text()

    except WebSocketDisconnect:

        manager.disconnect(
            websocket,
            conversation_id
        )