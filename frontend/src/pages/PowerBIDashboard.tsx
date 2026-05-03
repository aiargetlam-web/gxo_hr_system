import React, { useEffect, useState, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { PowerBIEmbed } from 'powerbi-client-react';
import { models } from 'powerbi-client';

export const PowerBIDashboard: React.FC = () => {
  const { user } = useContext(AuthContext);

  // 🔥 Estraggo il nome del ruolo in modo sicuro
  const roleName = user?.role?.name ?? "";

  const [tokenConfig, setTokenConfig] = useState<{
    embedToken: string;
    embedUrl: string;
    reportId: string;
  } | null>(null);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (roleName === "hr" || roleName === "admin") {
      api
        .get('/powerbi/embed-token')
        .then(res => setTokenConfig(res.data))
        .catch(() => setError('Errore nel recupero del token PowerBI.'));
    }
  }, [roleName]);

  // 🔥 Redirect se non autorizzato
  if (roleName !== "hr" && roleName !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div>
      <div className="flex-wrap-mobile">
        <h1>Dashboard KPI</h1>

        <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
          {roleName === 'admin'
            ? 'Vista Globale (Nessun Filtro)'
            : `Filtro RLS attivo su: ${user?.site?.name || 'Non assegnato'}`
          }
        </div>
      </div>

      <div className="card" style={{ minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
        {!tokenConfig && !error && (
          <div style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid #f3f3f3',
              borderTop: '3px solid var(--color-primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>

            <p style={{ marginTop: '1rem' }}>Generazione Embed Token in corso...</p>

            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}

        {error && (
          <div style={{
            padding: '1rem',
            background: '#ffebee',
            color: '#c62828',
            borderRadius: '4px'
          }}>
            <strong>Errore:</strong> {error}
          </div>
        )}

        {tokenConfig && (
          <div style={{
            flex: 1,
            border: '1px solid #ddd',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <PowerBIEmbed
              embedConfig={{
                type: 'report',
                id: tokenConfig.reportId,
                embedUrl: tokenConfig.embedUrl,
                accessToken: tokenConfig.embedToken,
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

            <style>{`
              .powerbi-container {
                width: 100%;
                height: 600px;
                border: none;
              }
            `}</style>
          </div>
        )}
      </div>
    </div>
  );
};
