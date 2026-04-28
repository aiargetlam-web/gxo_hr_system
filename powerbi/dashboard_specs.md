# Specifiche Dashboard Power BI - GXO HR System

Questo documento descrive come integrare il database del sistema HR con Microsoft Power BI per generare reportistica avanzata sui KPI aziendali.

## Modello Dati Suggerito (Star Schema)

Per un'integrazione ottimale con Power BI, si consiglia di estrarre i dati dal database MySQL relazionale e organizzarli (tramite viste SQL o un ETL dedicato) in un modello a stella:

### Tabelle dei Fatti (Fact Tables)
1. **Fact_Tickets**:
   - TicketID, UserID, TypeID, Stato, Priorità, DataCreazione, DataUltimoAggiornamento, TempoRisoluzioneOre.
2. **Fact_Communications**:
   - CommID, UserID, TypeID, Stato, Priorità, DataCreazione, DataUltimoAggiornamento.

### Tabelle Dimensionali (Dimension Tables)
1. **Dim_Users**:
   - UserID, NomeCompleto, Email, Ruolo, Sede (se aggiunta).
2. **Dim_Date**:
   - Data, Anno, Mese, Trimestre, Settimana (tabella calendario standard).
3. **Dim_TicketTypes**:
   - TypeID, NomeTipo, PrioritàDefault.
4. **Dim_CommunicationTypes**:
   - TypeID, NomeTipo, RichiedeAllegato.

## KPI Principali (Misure DAX)

Ecco alcune misure DAX fondamentali da creare nel modello Power BI:

- **Totale Ticket Aperti**: `CALCULATE(COUNTROWS(Fact_Tickets), Fact_Tickets[Stato] IN {"open", "in_progress", "waiting"})`
- **Totale Comunicazioni Non Lette**: `CALCULATE(COUNTROWS(Fact_Communications), Fact_Communications[Stato] = "unread")`
- **Tempo Medio di Chiusura Ticket (SLA)**: `AVERAGE(Fact_Tickets[TempoRisoluzioneOre])`
- **% Ticket Chiusi in SLA**: (Numero di ticket chiusi entro 48h) / (Totale ticket chiusi)
- **Volume Ticket per Tipo**: Analisi della colonna `TypeID` associata a `Dim_TicketTypes`.

## Struttura della Dashboard in Power BI

1. **Overview (Pagina Principale)**
   - Grafico a ciambella: Ticket aperti divisi per tipologia.
   - Grafico a linee: Andamento dei ticket aperti vs. chiusi negli ultimi 30 giorni (usando Dim_Date).
   - Card KPI: Totale ticket aperti, Totale comunicazioni in attesa.
2. **HR Performance (SLA)**
   - Matrice/Tabella: Tempo medio di risoluzione per addetto HR (se assegnato).
   - Istogramma: Distribuzione del tempo di risoluzione in ore/giorni.
3. **Analisi Comunicazioni**
   - Grafico a barre orizzontali: Tipi di comunicazioni più frequenti (es. Malattia, Cambio Turno).
   - Tabella: Elenco dettagliato per HR per identificare trend stagionali (es. picchi di assenze a Dicembre).

## Esportazione Dati e Connettori

**Opzione 1: Connessione Diretta (DirectQuery o Import)**
Power BI può connettersi direttamente al database MySQL. 
*Pro:* Dati in tempo reale (DirectQuery) o refresh pianificati semplici.
*Contro:* Può impattare sulle performance del DB in produzione.

**Opzione 2: Viste SQL Dedicate**
Creare viste all'interno di MySQL (es. `vw_powerbi_tickets`) per pre-calcolare dati ed esporre solo i campi necessari senza mostrare dati sensibili (come hash password o log chat). Power BI importa i dati tramite queste viste.

**Opzione 3: API REST**
Se si vuole disaccoppiare il DB da Power BI, FastAPI può esporre un endpoint `/api/v1/powerbi/export` che restituisce JSON formattato. Power BI può usare il connettore "Web" per importare i dati. (Sconsigliato per moli di dati enormi, ma utile per aggregati).
