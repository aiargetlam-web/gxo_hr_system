from fastapi import APIRouter

from app.api.api_v1.endpoints import auth, users, communications, tickets, sites, board, admin, powerbi, export

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(communications.router, prefix="/communications", tags=["communications"])
api_router.include_router(tickets.router, prefix="/tickets", tags=["tickets"])
api_router.include_router(sites.router, prefix="/sites", tags=["sites"])
api_router.include_router(board.router, prefix="/board", tags=["board"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(powerbi.router, prefix="/powerbi", tags=["powerbi"])
api_router.include_router(export.router, prefix="/export", tags=["export"])
