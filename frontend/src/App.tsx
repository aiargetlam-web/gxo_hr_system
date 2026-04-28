import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { PowerBIEmbed } from 'powerbi-client-react';
import { models } from 'powerbi-client';

// --- Tipi Mock ---
type Role = 'user' | 'hr' | 'admin';
interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  site_id?: number;
  site_name?: string;
  id_lul?: string;
  is_active: boolean;
}

// Utente mockato corrente (Simulazione)
const MOCK_USER: User = { id: 1, name: "Admin IT", email: "admin@example.com", role: "admin", site_name: "Globale", id_lul: "LUL000", is_active: true };
// const MOCK_USER: User = { id: 2, name: "Laura HR", email: "hr@example.com", role: "hr", site_name: "Milano, Roma", id_lul: "LUL002", is_active: true };

function Placeholder({ title, user }: { title: string, user: User }) {
  return (
    <div className="card">
      <div className="flex-wrap-mobile">
        <h2>{title}</h2>
        {(user.role === 'hr' || user.role === 'admin') && (
          <button 
            onClick={() => window.open(`/api/v1/export/${title.toLowerCase()}`)} 
            className="btn btn-outline" 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ⬇️ Esporta CSV
          </button>
        )}
      </div>
      <p>Questa pagina è in fase di costruzione.</p>
    </div>
  );
}

// --- Bacheca Component ---
function Bacheca({ user }: { user: User }) {
  const [showUpload, setShowUpload] = useState(false);

  return (
    <div>
      <div className="flex-wrap-mobile">
        <h1>Bacheca Aziendale</h1>
        {(user.role === 'hr' || user.role === 'admin') && (
          <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
            <button onClick={() => window.open('/api/v1/export/board')} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, justifyContent: 'center' }}>
              ⬇️ Esporta CSV
            </button>
            <button className="btn btn-primary" onClick={() => setShowUpload(!showUpload)} style={{ flex: 1, justifyContent: 'center' }}>
              {showUpload ? 'Annulla' : 'Carica Nuovo File'}
            </button>
          </div>
        )}
      </div>

      {showUpload && (
        <div className="card" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--color-primary)' }}>
          <h3>Carica Documento in Bacheca</h3>
          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label className="form-label">Seleziona File (PDF, DOCX)</label>
            <input type="file" className="form-control" />
          </div>
          <div className="form-group">
            <label className="form-label">Siti di destinazione (Tieni premuto Ctrl/Cmd per selezione multipla)</label>
            <select multiple className="form-control" style={{ height: '100px' }}>
              <option value="1">Magazzino Milano</option>
              <option value="2">Magazzino Roma</option>
              <option value="3">Sede Centrale Bologna</option>
            </select>
          </div>
          <button className="btn btn-primary">Carica File</button>
        </div>
      )}

      <div className="card">
        <h3>Documenti Recenti</h3>
        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem' }}>Nome File</th>
                <th style={{ padding: '0.75rem' }}>Data Caricamento</th>
                <th style={{ padding: '0.75rem' }}>Siti Visibili</th>
                <th style={{ padding: '0.75rem' }}>Azione</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '0.75rem' }}>Regolamento_Aziendale_2026.pdf</td>
                <td style={{ padding: '0.75rem' }}>27/04/2026</td>
                <td style={{ padding: '0.75rem' }}>Milano, Roma</td>
                <td style={{ padding: '0.75rem' }}><button className="btn btn-secondary">Scarica</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --- Gestione Utenti (HR / Admin) ---
function GestioneUtenti({ user }: { user: User }) {
  const [showImport, setShowImport] = useState(false);
  const [showAddSingle, setShowAddSingle] = useState(false);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1>Gestione Utenti</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => window.open('/api/v1/export/users')} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ⬇️ Esporta CSV
          </button>
          <button className="btn btn-secondary" onClick={() => setShowAddSingle(!showAddSingle)}>
            {showAddSingle ? 'Annulla' : '+ Aggiungi Utente'}
          </button>
          <button className="btn btn-primary" onClick={() => setShowImport(!showImport)}>
            {showImport ? 'Annulla' : 'Importa CSV'}
          </button>
        </div>
      </div>

      {showImport && (
        <div className="card" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--color-secondary)' }}>
          <h3>Importazione Massiva (CSV)</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
            Il file CSV deve contenere le colonne: <code>first_name, last_name, email, role, site_id, id_lul, password</code>.
          </p>
          <div className="form-group" style={{ marginTop: '1rem' }}>
            <input type="file" accept=".csv" className="form-control" />
          </div>
          <button className="btn btn-primary">Carica e Importa</button>
        </div>
      )}

      {showAddSingle && (
        <div className="card" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--color-secondary)' }}>
          <h3>Nuovo Utente</h3>
          <div className="grid-2-col">
            <div className="form-group"><label className="form-label">Nome</label><input type="text" className="form-control" /></div>
            <div className="form-group"><label className="form-label">Cognome</label><input type="text" className="form-control" /></div>
            <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-control" /></div>
            <div className="form-group"><label className="form-label">ID LUL</label><input type="text" className="form-control" /></div>
            <div className="form-group">
              <label className="form-label">Ruolo</label>
              <select className="form-control"><option>user</option><option>hr</option></select>
            </div>
            <div className="form-group">
              <label className="form-label">Sito</label>
              <select className="form-control"><option value="1">Milano</option><option value="2">Roma</option></select>
            </div>
          </div>
          <button className="btn btn-secondary" style={{ marginTop: '1rem', width: '100%' }}>Salva Utente</button>
        </div>
      )}

      <div className="card">
        <div className="flex-wrap-mobile">
          <h3>Elenco Dipendenti</h3>
          <input type="text" placeholder="Cerca per Nome, Email o LUL..." className="form-control" style={{ maxWidth: '300px' }} />
        </div>
        
        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem' }}>ID LUL</th>
                <th style={{ padding: '0.75rem' }}>Nome Completo</th>
                <th style={{ padding: '0.75rem' }}>Email</th>
                <th style={{ padding: '0.75rem' }}>Sito</th>
                <th style={{ padding: '0.75rem' }}>Stato</th>
                <th style={{ padding: '0.75rem' }}>Azioni</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '0.75rem' }}>LUL001</td>
                <td style={{ padding: '0.75rem' }}>Mario Rossi</td>
                <td style={{ padding: '0.75rem' }}>mario.rossi@example.com</td>
                <td style={{ padding: '0.75rem' }}>Milano</td>
                <td style={{ padding: '0.75rem' }}><span className="badge badge-closed">Attivo</span></td>
                <td style={{ padding: '0.75rem' }}><button className="btn btn-secondary" style={{ backgroundColor: '#dc3545', padding: '0.25rem 0.5rem' }}>Disattiva</button></td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: '#f8f9fa', color: '#999' }}>
                <td style={{ padding: '0.75rem' }}>LUL003</td>
                <td style={{ padding: '0.75rem' }}>Gianni Neri</td>
                <td style={{ padding: '0.75rem' }}>gianni@example.com</td>
                <td style={{ padding: '0.75rem' }}>Roma</td>
                <td style={{ padding: '0.75rem' }}><span className="badge badge-unread" style={{ background: '#e9ecef', color: '#6c757d' }}>Disattivo</span></td>
                <td style={{ padding: '0.75rem' }}><button className="btn btn-secondary" style={{ backgroundColor: '#28a745', padding: '0.25rem 0.5rem' }}>Riattiva</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --- Power BI Dashboard Component ---
function PowerBIDashboard({ user }: { user: User }) {
  const [tokenConfig, setTokenConfig] = useState<{ token: string, url: string, id: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // In un caso reale, questa API verrebbe chiamata con il JWT reale e si connetterebbe al backend FastAPI
    // fetch('/api/v1/powerbi/embed-token') -> per ora la mockiamo per mostrare l'interfaccia o la chiamiamo se il backend gira.
    
    // Per mostrare l'interfaccia senza avere il backend di Azure configurato:
    setTimeout(() => {
      // Mock Data (poiché non abbiamo vere chiavi Power BI al momento)
      setTokenConfig({
        token: "mock-token-12345",
        url: "https://app.powerbi.com/reportEmbed?reportId=mock",
        id: "mock-report-id"
      });
      // In caso di errore scommentare la riga sotto
      // setError("Credenziali Power BI non configurate sul server.");
    }, 1500);
  }, []);

  if (user.role !== 'hr' && user.role !== 'admin') {
    return <div className="card" style={{ borderLeft: '4px solid #dc3545' }}><h2>Accesso Negato</h2><p>Non hai i permessi per visualizzare questa dashboard.</p></div>;
  }

  return (
    <div>
      <div className="flex-wrap-mobile">
        <h1>Dashboard KPI</h1>
        <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
          {user.role === 'admin' ? 'Vista Globale (Nessun Filtro)' : `Filtro RLS attivo su: ${user.site_name}`}
        </div>
      </div>

      <div className="card" style={{ minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
        {!tokenConfig && !error && (
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid #f3f3f3', borderTop: '3px solid var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <p style={{ marginTop: '1rem' }}>Generazione Embed Token in corso...</p>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {error && (
          <div style={{ padding: '1rem', background: '#ffebee', color: '#c62828', borderRadius: '4px' }}>
            <strong>Errore:</strong> {error}
          </div>
        )}

        {tokenConfig && (
           <div style={{ flex: 1, border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
             {/* Componente PowerBI: Rimuovi le config mockate in produzione */}
             <PowerBIEmbed
                embedConfig={{
                  type: 'report',
                  id: tokenConfig.id,
                  embedUrl: tokenConfig.url,
                  accessToken: tokenConfig.token,
                  tokenType: models.TokenType.Embed,
                  settings: {
                    panes: {
                      filters: { expanded: false, visible: true },
                      pageNavigation: { visible: false }
                    },
                  }
                }}
                cssClassName={"powerbi-container"}
                getEmbeddedComponent={(embeddedReport) => {
                  console.log("Report embedded:", embeddedReport);
                }}
             />
             <style>{`.powerbi-container { width: 100%; height: 600px; border: none; }`}</style>
           </div>
        )}
      </div>
    </div>
  );
}

// --- Activity Logs & User History Components (Admin Only) ---
function ActivityLogs({ user }: { user: User }) {
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return (
    <div className="card">
      <div className="flex-wrap-mobile">
        <h2>Log Attività (Admin)</h2>
        <button onClick={() => window.open('/api/v1/export/activity-logs')} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', justifyContent: 'center' }}>
          ⬇️ Esporta CSV
        </button>
      </div>
      <div className="table-responsive">
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead><tr style={{ borderBottom: '1px solid #ddd' }}><th>Data</th><th>User ID</th><th>Ruolo</th><th>Azione</th><th>Entità</th><th>Entity ID</th></tr></thead>
          <tbody>
            <tr><td colSpan={6} style={{ padding: '1rem', textAlign: 'center' }}>[Mock] Tabella dei log...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UserHistory({ user }: { user: User }) {
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return (
    <div className="card">
      <div className="flex-wrap-mobile">
        <h2>Storico Modifiche Utente (Admin)</h2>
        <button onClick={() => window.open('/api/v1/export/user-history')} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', justifyContent: 'center' }}>
          ⬇️ Esporta CSV
        </button>
      </div>
      <div className="table-responsive">
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead><tr style={{ borderBottom: '1px solid #ddd' }}><th>Data</th><th>Target User</th><th>Modificato Da</th><th>Campo</th><th>Vecchio Val.</th><th>Nuovo Val.</th></tr></thead>
          <tbody>
            <tr><td colSpan={6} style={{ padding: '1rem', textAlign: 'center' }}>[Mock] Tabella storico...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- Admin HR Management Component ---
function AdminHRManagement() {
  return (
    <div>
      <h1>Gestione HR e Siti</h1>
      <p style={{ marginBottom: '1.5rem' }}>Assegna i siti di competenza ai referenti HR.</p>
      
      <div className="card">
        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem' }}>Nome HR</th>
                <th style={{ padding: '0.75rem' }}>Email</th>
                <th style={{ padding: '0.75rem' }}>Siti Assegnati</th>
                <th style={{ padding: '0.75rem' }}>Azioni</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '0.75rem' }}>Laura Bianchi</td>
                <td style={{ padding: '0.75rem' }}>hr@example.com</td>
                <td style={{ padding: '0.75rem' }}>
                  <span className="badge badge-inprogress" style={{ marginRight: '5px' }}>Milano</span>
                  <span className="badge badge-inprogress">Roma</span>
                </td>
                <td style={{ padding: '0.75rem' }}>
                  <button className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>Modifica</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --- Layout Principale ---
function Layout({ children, user }: { children: React.ReactNode, user: User }) {
  const location = useLocation();
  const path = location.pathname;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <div className={`sidebar-backdrop ${isSidebarOpen ? 'show' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          GXO HR Portal
        </div>
        <div style={{ padding: '0 1.5rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: '1rem' }}>
          RUOLO: {user.role.toUpperCase()}<br/>
          SITO: {user.site_name || 'Tutti'}
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className={`sidebar-link ${path === '/dashboard' ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}>Dashboard</Link>
          <Link to="/board" className={`sidebar-link ${path === '/board' ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}>Bacheca</Link>
          <Link to="/communications" className={`sidebar-link ${path === '/communications' ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}>Comunicazioni</Link>
          <Link to="/tickets" className={`sidebar-link ${path === '/tickets' ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}>Ticket</Link>
          <Link to="/profile" className={`sidebar-link ${path === '/profile' ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}>Profilo</Link>
          
          {(user.role === 'hr' || user.role === 'admin') && (
            <>
              <Link to="/powerbi-dashboard" className={`sidebar-link ${path === '/powerbi-dashboard' ? 'active' : ''}`} style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }} onClick={() => setIsSidebarOpen(false)}>
                📊 Dashboard KPI
              </Link>
              <Link to="/users" className={`sidebar-link ${path === '/users' ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}>
                👥 Gestione Utenti
              </Link>
            </>
          )}
          
          {user.role === 'admin' && (
            <>
              <Link to="/admin/hr" className={`sidebar-link ${path === '/admin/hr' ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}>
                ⚙️ Gestione HR Siti
              </Link>
              <Link to="/activity-logs" className={`sidebar-link ${path === '/activity-logs' ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}>
                📜 Log Attività
              </Link>
              <Link to="/user-history" className={`sidebar-link ${path === '/user-history' ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}>
                🕒 Storico Utenti
              </Link>
            </>
          )}
        </nav>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <button className="hamburger-btn" onClick={() => setIsSidebarOpen(true)}>
            ☰
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span>Benvenuto, {user.name}</span>
            <button className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem' }}>Logout</button>
          </div>
        </header>
        <div className="content-area">
          {children}
        </div>
      </main>
    </div>
  );
}

function App() {
  const user = MOCK_USER;

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Placeholder title="Login Page" user={user} />} />
        
        <Route path="/" element={<Layout user={user}><Navigate to="/dashboard" replace /></Layout>} />
        
        <Route path="/dashboard" element={
          <Layout user={user}>
            <h1>Dashboard</h1>
            <div className="dashboard-grid">
              <div className="stat-card">
                <h3>3</h3>
                <p>Comunicazioni</p>
              </div>
              <div className="stat-card">
                <h3>1</h3>
                <p>Ticket Aperti</p>
              </div>
            </div>
          </Layout>
        } />
        
        <Route path="/board" element={<Layout user={user}><Bacheca user={user} /></Layout>} />
        <Route path="/communications" element={<Layout user={user}><Placeholder title="Communications" user={user} /></Layout>} />
        <Route path="/tickets" element={<Layout user={user}><Placeholder title="Tickets" user={user} /></Layout>} />
        
        <Route path="/powerbi-dashboard" element={
          <Layout user={user}>
             {(user.role === 'hr' || user.role === 'admin') ? <PowerBIDashboard user={user} /> : <Navigate to="/dashboard" replace />}
          </Layout>
        } />

        <Route path="/users" element={
          <Layout user={user}>
             {(user.role === 'hr' || user.role === 'admin') ? <GestioneUtenti user={user} /> : <Navigate to="/dashboard" replace />}
          </Layout>
        } />
        
        <Route path="/admin/hr" element={
          <Layout user={user}>
            {user.role === 'admin' ? <AdminHRManagement /> : <Navigate to="/dashboard" replace />}
          </Layout>
        } />

        <Route path="/activity-logs" element={
          <Layout user={user}>
            <ActivityLogs user={user} />
          </Layout>
        } />

        <Route path="/user-history" element={
          <Layout user={user}>
            <UserHistory user={user} />
          </Layout>
        } />

        <Route path="/profile" element={
          <Layout user={user}>
            <div className="card">
              <h2>Profilo Utente</h2>
              <div className="grid-2-col" style={{ marginTop: '1.5rem' }}>
                <strong>Nome:</strong> <span>{user.name}</span>
                <strong>Email:</strong> <span>{user.email}</span>
                <strong>ID LUL:</strong> <span>{user.id_lul || 'N/D'}</span>
                <strong>Ruolo:</strong> <span style={{ textTransform: 'capitalize' }}>{user.role}</span>
                <strong>Sito:</strong> <span>{user.site_name || 'Non assegnato / Globale'}</span>
                
                {(user.role === 'hr' || user.role === 'admin') && (
                  <>
                    <strong>Stato Account:</strong> 
                    <span>
                      {user.is_active 
                        ? <span className="badge badge-closed">Attivo</span> 
                        : <span className="badge badge-unread" style={{ background: '#e9ecef', color: '#6c757d' }}>Disattivo</span>
                      }
                    </span>
                  </>
                )}
              </div>
            </div>
          </Layout>
        } />
      </Routes>
    </Router>
  );
}

export default App;
