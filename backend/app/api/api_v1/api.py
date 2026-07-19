from fastapi import APIRouter

# Import endpoints principali
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

# Import dizionari e tabelle di supporto
from app.api.api_v1.endpoints.contract_natures import router as contract_natures_router
from app.api.api_v1.endpoints.work_regimes import router as work_regimes_router
from app.api.api_v1.endpoints.departments import router as departments_router
from app.api.api_v1.endpoints.cost_centers import router as cost_centers_router
from app.api.api_v1.endpoints.preposti import router as preposti_router

# Import nuovi endpoint corretti
from app.api.api_v1.endpoints.genders import router as genders_router
from app.api.api_v1.endpoints.benefit_types import router as benefit_types_router

# ⭐ DEVE ESSERE LA PRIMA ISTRUZIONE
api_router = APIRouter()

# ---------------------------------------------------------
# ROUTER PRINCIPALI
# ---------------------------------------------------------

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(employee.router, prefix="/employees", tags=["employees"])
api_router.include_router(communications.router, prefix="/communications", tags=["communications"])
api_router.include_router(tickets.router, prefix="/tickets", tags=["tickets"])
api_router.include_router(sites.router, prefix="/sites", tags=["sites"])
api_router.include_router(board.router, prefix="/board", tags=["board"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(powerbi.router, prefix="/powerbi", tags=["powerbi"])
api_router.include_router(export.router, prefix="/export", tags=["export"])
api_router.include_router(roles.router, prefix="/roles", tags=["roles"])
api_router.include_router(debug.router, prefix="/debug", tags=["debug"])

# ---------------------------------------------------------
# ROUTER DIZIONARI / TABELLE DI SUPPORTO
# ---------------------------------------------------------

api_router.include_router(contract_natures_router, prefix="/contract-natures", tags=["contract-natures"])
api_router.include_router(work_regimes_router, prefix="/work-regimes", tags=["work-regimes"])
api_router.include_router(departments_router, prefix="/departments", tags=["departments"])
api_router.include_router(cost_centers_router, prefix="/cost-centers", tags=["cost-centers"])
api_router.include_router(preposti_router, prefix="/employees", tags=["preposti"])


# Nuovi endpoint correttamente registrati
api_router.include_router(genders_router, prefix="/genders", tags=["genders"])
api_router.include_router(benefit_types_router, prefix="/benefit-types", tags=["benefit-types"])
