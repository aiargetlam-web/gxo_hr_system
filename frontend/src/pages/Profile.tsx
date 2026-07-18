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

      // ✅ CORRETTO: getEmployee esiste
      const data = await employeeService.getEmployee(user.id);

      setEmployee(data);
    };

    loadEmployee();
  }, [user]);

  if (!user || !employee) return null;

  // ⭐ Ruolo corretto (role.id)
  const roleName =
    employee.role?.id === 1 ? "Admin" :
    employee.role?.id === 2 ? "HR" :
    employee.role?.id === 3 ? "Dipendente" :
    "N/D";

  // ⭐ Sito corretto (site.id)
  const siteName = employee.site?.id
    ? `Sito #${employee.site.id}`
    : "Non assegnato / Globale";

  // ⭐ Reparto corretto (department.department_id)
  const departmentName = employee.department?.department_id
    ? `Dept #${employee.department.department_id}`
    : "N/D";

  // ⭐ Contratto corretto (contract.work_regime)
  const contractName = employee.contract?.work_regime
    ? employee.contract.work_regime
    : "N/D";

  // ⭐ Status corretto (status.status_type_id)
  const statusName = employee.status?.status_type_id
    ? `Status #${employee.status.status_type_id}`
    : "N/D";

  return (
    <div className="card">
      <h2>Profilo Utente</h2>

      <div className="grid-2-col" style={{ marginTop: '1.5rem' }}>
        
        <strong>Nome:</strong> 
        <span>{employee.first_name} {employee.last_name}</span>

        <strong>Email:</strong> 
        <span>{employee.email}</span>

        <strong>ID LUL:</strong> 
        <span>{employee.lul_id || 'N/D'}</span>

        <strong>Ruolo:</strong> 
        <span style={{ textTransform: 'capitalize' }}>
          {roleName}
        </span>

        <strong>Sito:</strong> 
        <span>{siteName}</span>

        <strong>Dipartimento:</strong>
        <span>{departmentName}</span>

        <strong>Contratto:</strong>
        <span>{contractName}</span>

        <strong>Status:</strong>
        <span>{statusName}</span>

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
