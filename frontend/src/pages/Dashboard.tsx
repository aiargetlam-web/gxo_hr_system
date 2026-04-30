import React from 'react';

export const Dashboard: React.FC = () => {
  return (
    <div>
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
    </div>
  );
};
