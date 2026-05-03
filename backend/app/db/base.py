# IMPORTA TUTTI I MODELLI QUI
# Questo file serve SOLO a far registrare i modelli a SQLAlchemy

from app.db.base_class import Base

# ⚠️ IMPORTANTE: l'ordine conta!
from app.models.role import Role
from app.models.site import Site
from app.models.user import User
