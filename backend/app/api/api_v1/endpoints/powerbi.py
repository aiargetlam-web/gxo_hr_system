import requests
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.user import User
from app.models.site import Site, HRSite
from app.core.config import settings

router = APIRouter()

def get_azure_ad_token() -> str:
    """Fetch Azure AD token for Power BI service."""
    if not all([settings.POWERBI_TENANT_ID, settings.POWERBI_CLIENT_ID, settings.POWERBI_CLIENT_SECRET]):
        raise HTTPException(status_code=500, detail="Power BI credentials are not configured in the environment.")
        
    url = f"https://login.microsoftonline.com/{settings.POWERBI_TENANT_ID}/oauth2/v2.0/token"
    
    payload = {
        "grant_type": "client_credentials",
        "client_id": settings.POWERBI_CLIENT_ID,
        "client_secret": settings.POWERBI_CLIENT_SECRET,
        "scope": "https://analysis.windows.net/powerbi/api/.default"
    }
    
    response = requests.post(url, data=payload)
    response.raise_for_status()
    return response.json().get("access_token")

@router.get("/embed-token")
def get_embed_token(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """Generate an Embed Token for Power BI, applying RLS if user is HR."""
    
    # Solo Admin e HR possono accedere alla dashboard
    if current_user.role not in ["admin", "hr"]:
        raise HTTPException(status_code=403, detail="Accesso alla dashboard negato per questo ruolo.")
        
    try:
        access_token = get_azure_ad_token()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore di autenticazione ad Azure AD: {str(e)}")

    url = f"https://api.powerbi.com/v1.0/myorg/GenerateToken"
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    # Costruiamo la richiesta base
    payload: dict = {
        "datasets": [{"id": settings.POWERBI_DATASET_ID}],
        "reports": [{"id": settings.POWERBI_REPORT_ID}],
        "workspaces": [{"id": settings.POWERBI_WORKSPACE_ID}]
    }
    
    # Se è HR, applichiamo RLS
    if current_user.role == "hr":
        # 1. Trovo i site_id assegnati all'HR
        hr_sites = db.query(HRSite).filter(HRSite.hr_id == current_user.id).all()
        site_ids = [s.site_id for s in hr_sites]
        
        # 2. Recupero i NOMI dei siti dal DB (come richiesto)
        sites = db.query(Site).filter(Site.id.in_(site_ids)).all()
        site_names = [site.name for site in sites]
        
        if not site_names:
            # Se l'HR non ha siti, potremmo non volergli far vedere nulla,
            # Passiamo un array vuoto o un valore inesistente per bloccare la RLS
            site_names = ["NESSUN_SITO_ASSEGNATO"]
            
        # Costruisco l'oggetto RLS richiesto da Power BI
        # L'username passato sarà la lista dei siti, o potremmo usare customData a seconda del modello PBI.
        # Qui usiamo un approccio comune: passiamo l'identità e usiamo i nomi dei siti come "username"
        # o, più corretto, passiamo una identity con multiple roles o custom data.
        # Un metodo semplice supportato da PBI:
        payload["identities"] = [
            {
                "username": current_user.email,
                "roles": [settings.POWERBI_RLS_ROLE],
                "datasets": [settings.POWERBI_DATASET_ID],
                "customData": ",".join(site_names) # I nomi dei siti vengono passati qui e usati nel filtro DAX: CUSTOMDATA()
            }
        ]
        
    # Per Admin non passiamo identities (ha accesso completo, assumendo che in PowerBI Admin significhi senza RLS, 
    # o potremmo passargli un ruolo "AdminRole" se il modello PBI lo richiede)
    
    response = requests.post(url, headers=headers, json=payload)
    
    if response.status_code != 200:
        raise HTTPException(
            status_code=500, 
            detail=f"Errore nella generazione del token Power BI: {response.text}"
        )
        
    data = response.json()
    
    return {
        "embedToken": data.get("token"),
        "embedUrl": f"https://app.powerbi.com/reportEmbed?reportId={settings.POWERBI_REPORT_ID}&groupId={settings.POWERBI_WORKSPACE_ID}",
        "reportId": settings.POWERBI_REPORT_ID
    }
