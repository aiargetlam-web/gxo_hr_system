import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { employeeService } from '../services/employeeService';
import { EmployeeFull } from '../types';

export const Profile: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [employee, setEmployee] = useState<EmployeeFull | null>(null);

  useEffect(() => {
    const loadEmployee = async () => {
      if (!user) return;
      const data = await employeeService.getById(user.id);
      setEmployee(data);
    };

    loadEmployee();
  }, [user]);

  if (!user || !employee) return null;

  const roleName =
    employee.role_name ||
    (employee.role_id === 1 ? "Admin" :
     employee.role_id === 2 ? "HR" :
     employee.role_id === 3 ? "Dipendente" :
     "N/D");

  return (
    <div className="card">
      <h2>Profilo Utente</h2>

      <div className="grid-2-col" style={{ marginTop: '1.5rem' }}>
        
        <strong>Nome:</strong> 
        <span>{employee.first_name} {employee.last_name}</span>

        <strong>Email:</strong> 
        <span>{employee.email}</span>

        <strong>ID LUL:</strong> 
        <span>{employee.id_lul || 'N/D'}</span>

        <strong>Ruolo:</strong> 
        <span style={{ textTransform: 'capitalize' }}>
          {roleName}
        </span>

        <strong>Sito:</strong> 
        <span>{employee.site_name || 'Non assegnato / Globale'}</span>

        <strong>Dipartimento:</strong>
        <span>{employee.department || 'N/D'}</span>

        <strong>Contratto:</strong>
        <span>{employee.contract || 'N/D'}</span>

        <strong>Status:</strong>
        <span>{employee.status || 'N/D'}</span>

        <strong>Stato Account:</strong>
        <span>
          {employee.is_active 
            ? <span className="badge badge-closed">Attivo</span>
            : <span className="badge badge-unread">Disattivo</span>
          }
        </span>

      </div>
    </div>
  );
};
