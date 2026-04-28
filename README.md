# GXO HR Ticketing & Communication System

Questo è un sistema completo per la gestione delle comunicazioni e dei ticket HR per i dipendenti GXO.
L'architettura è composta da un **Backend FastAPI (Python)** e un **Frontend React + Vite (TypeScript)**, con un database **MySQL**.

## Architettura e Tecnologie
- **Frontend**: React 18, Vite, TypeScript, React Router. CSS custom ispirato a gxo.com.
- **Backend**: FastAPI, SQLAlchemy (ORM), Pydantic, PassLib (Bcrypt per le password), JWT per l'autenticazione.
- **Database**: MySQL.

## Setup dell'Ambiente

### Prerequisiti
1. **Python 3.10+**
2. **Node.js 18+**
3. **MySQL Server 8.0+** (Installato localmente o su container Docker)

### 1. Database (MySQL)
1. Accedi a MySQL con il tuo client preferito (es. MySQL Workbench o CLI).
2. Esegui il contenuto del file `db/schema.sql`. Questo script creerà il database `gxo_hr_system`, tutte le tabelle e inserirà gli utenti e le configurazioni di test.

### 2. Backend (FastAPI)
1. Apri un terminale nella cartella `backend/`.
2. Crea un virtual environment:
   ```bash
   python -m venv venv
   # Attiva su Windows:
   venv\Scripts\activate
   # Attiva su Mac/Linux:
   source venv/bin/activate
   ```
3. Installa le dipendenze:
   ```bash
   pip install -r requirements.txt
   ```
4. Assicurati che nel file `backend/.env` la variabile `SQLALCHEMY_DATABASE_URI` corrisponda alle credenziali del tuo DB locale MySQL.
5. Avvia il server di sviluppo:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   L'API sarà disponibile su `http://localhost:8000`. 
   La documentazione Swagger interattiva sarà visibile a `http://localhost:8000/docs`.

### 3. Frontend (React)
1. Apri un terminale separato nella cartella `frontend/`.
2. Installa i pacchetti npm:
   ```bash
   npm install
   ```
3. Avvia il server di sviluppo:
   ```bash
   npm run dev
   ```
   L'app React sarà disponibile su `http://localhost:3000`.

## Utenti di Test
Il database è pre-popolato con tre utenti. La password per tutti è **`password123`**.
- Utente standard: `mario.rossi@example.com`
- Utente HR: `hr@example.com`
- Utente Admin: `admin@example.com`

## Funzionalità Principali
- **Login sicuri** con JWT. Le password sono "salate e hashate" (Bcrypt).
- **Separazione ruoli**: Un utente standard vede solo i propri ticket, mentre un utente HR può vederli tutti, cambiarne lo stato e la priorità.
- **Upload allegati**: Gli allegati vengono salvati nel backend nella cartella `uploads/` (il path è salvato a database).
- **Endpoint simulati per mail**: La funzione forgot-password simula l'invio via email registrando le operazioni in console.

## Futuri Miglioramenti
Come richiesto, il sistema funge da MVP e "scaffolding" robusto. Per l'uso in produzione reale si raccomanda:
- **SSO (Single Sign-On)**: Integrazione con Azure AD per GXO al posto della password locale.
- **Storage in Cloud**: Sostituire la cartella locale `uploads/` con Amazon S3.
- **Notifiche Real-time**: WebSocket tramite FastAPI per notificare all'utente o all'HR l'arrivo di nuovi messaggi.
- **CI/CD Pipeline**: Aggiunta di file GitHub Actions per la validazione `npm run lint` e l'esecuzione di test `pytest` sul backend.
- **Integrazione Power BI**: Implementare `vw_powerbi` in MySQL per esportare KPI complessi (vedere `powerbi/dashboard_specs.md`).
