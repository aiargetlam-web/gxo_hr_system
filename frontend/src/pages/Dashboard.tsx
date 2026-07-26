import React from "react";
import "../css/dashboard.css";


export const Dashboard: React.FC = () => {
  const today = new Date();
  const formattedDate = today.toLocaleDateString("it-IT", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return (
    <div className="dashboard-wrapper">

      {/* HEADER PRIMORDIA */}
      <header className="dashboard-header">
        <h1>GXO Primordia</h1>
        <p>Dove nasce la tua organizzazione.</p>
        <span className="dashboard-sub">L’origine dei processi HR.</span>
      </header>

      {/* SEZIONE DI BENVENUTO */}
      <div className="welcome-card">
        <h2>Benvenuto nel portale HR</h2>
        <p>{formattedDate}</p>
        <p className="welcome-msg">
          Questo è il punto di accesso centrale ai futuri processi HR della tua azienda.
        </p>
      </div>

      {/* SEZIONE CALENDARIO / EVENTI */}
      <div className="dashboard-grid">

        <div className="dashboard-card">
          <h3>Calendario Aziendale</h3>
          <p>Prossimi eventi, scadenze e comunicazioni interne.</p>
        </div>

        <div className="dashboard-card">
          <h3>Oggi</h3>
          <p>Una panoramica della giornata lavorativa.</p>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
