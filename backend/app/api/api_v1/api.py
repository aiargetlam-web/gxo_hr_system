from fastapi import APIRouter

from app.api.api_v1.endpoints import (
    auth,
    employee,
    communications,
    tickets,
    sites,
    board,
    admin,
    powerbi,
    export,
    roles,
    debug
)

# ⭐ IMPORT CORRETTI
from app.api.api_v1.endpoints.contract_natures import router as contract_natures_router
from app.api.api_v1.endpoints.work_regimes import router as work_regimes_router
from app.api.api_v1.endpoints.departments import router as departments_router
from app.api.api_v1.endpoints.cost_centers import router as cost_centers_router
from app.api.api_v1.endpoints.preposti import router as preposti_router

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(employee.router)
api_router.include_router(communications.router, prefix="/communications", tags=["communications"])
api_router.include_router(tickets.router, prefix="/tickets", tags=["tickets"])
api_router.include_router(sites.router, prefix="/sites", tags=["sites"])
api_router.include_router(board.router, prefix="/board", tags=["board"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(powerbi.router, prefix="/powerbi", tags=["powerbi"])
api_router.include_router(export.router, prefix="/export", tags=["export"])
api_router.include_router(roles.router, prefix="/roles", tags=["roles"])
api_router.include_router(debug.router, prefix="/debug", tags=["debug"])

# ⭐ DIZIONARI
api_router.include_router(contract_natures_router)
api_router.include_router(work_regimes_router)
api_router.include_router(departments_router)
api_router.include_router(cost_centers_router)
api_router.include_router(preposti_router)
