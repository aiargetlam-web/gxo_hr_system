import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { employeeService } from "../services/employeeService";
import { EmployeeFull } from "../types";
import { Box, CircularProgress, Typography, Card, Divider } from "@mui/material";

export default function EmployeeDetail() {
  const { id } = useParams();
  const [employee, setEmployee] = useState<EmployeeFull | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        if (!id) return;
        const data = await employeeService.getById(Number(id));
        setEmployee(data);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" sx={{ mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!employee) {
    return <Typography sx={{ mt: 5 }}>Dipendente non trovato.</Typography>;
  }

  return (
    <Box p={3}>
      {/* TITOLO */}
      <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
        Profilo Dipendente
      </Typography>

      {/* CARD PRINCIPALE */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>
          {employee.first_name} {employee.last_name}
        </Typography>

        <Typography sx={{ mt: 2 }}>
          <strong>Email:</strong> {employee.email}
        </Typography>

        <Typography sx={{ mt: 1 }}>
          <strong>Telefono:</strong> {employee.phone ?? "-"}
        </Typography>

        <Typography sx={{ mt: 1 }}>
          <strong>Codice Fiscale:</strong> {employee.fiscal_code ?? "-"}
        </Typography>

        <Typography sx={{ mt: 1 }}>
          <strong>Ruolo:</strong> {employee.role?.name ?? "-"}
        </Typography>

        <Typography sx={{ mt: 1 }}>
          <strong>Sito Attuale:</strong> {employee.current_site?.site_id ?? "-"}
        </Typography>

        <Typography sx={{ mt: 1 }}>
          <strong>Data Assunzione:</strong> {employee.hire_date ?? "-"}
        </Typography>

        <Typography sx={{ mt: 1 }}>
          <strong>Data Cessazione:</strong> {employee.termination_date ?? "-"}
        </Typography>

        <Typography sx={{ mt: 1 }}>
          <strong>Categoria Protetta:</strong> {employee.is_protected_category ? "Sì" : "No"}
        </Typography>

        <Typography sx={{ mt: 1 }}>
          <strong>Disagiato:</strong> {employee.is_disadvantaged ? "Sì" : "No"}
        </Typography>
      </Card>

      {/* SEZIONE CONTRATTO */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight={600}>
          Contratto Attuale
        </Typography>
        <Divider sx={{ my: 2 }} />

        <Typography>
          <strong>Regime Lavorativo:</strong>{" "}
          {employee.current_contract?.work_regime_id ?? "-"}
        </Typography>

        <Typography>
          <strong>Natura Contratto:</strong>{" "}
          {employee.current_contract?.contract_nature_id ?? "-"}
        </Typography>

        <Typography>
          <strong>Ore Settimanali:</strong>{" "}
          {employee.current_contract?.weekly_hours ?? "-"}
        </Typography>

        <Typography>
          <strong>FTE:</strong>{" "}
          {employee.current_contract?.fte ?? "-"}
        </Typography>

        <Typography>
          <strong>Data Inizio:</strong>{" "}
          {employee.current_contract?.from_date ?? "-"}
        </Typography>

        <Typography>
          <strong>Data Fine:</strong>{" "}
          {employee.current_contract?.to_date ?? "-"}
        </Typography>
      </Card>

      {/* SEZIONE SALARIO */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight={600}>
          RAL Attuale
        </Typography>
        <Divider sx={{ my: 2 }} />

        <Typography>
          <strong>RAL:</strong>{" "}
          {employee.current_salary?.ral_amount ?? "-"}
        </Typography>

        <Typography>
          <strong>Dal:</strong>{" "}
          {employee.current_salary?.from_date ?? "-"}
        </Typography>

        <Typography>
          <strong>Al:</strong>{" "}
          {employee.current_salary?.to_date ?? "-"}
        </Typography>
      </Card>

      {/* SEZIONE REPARTO */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight={600}>
          Reparto Attuale
        </Typography>
        <Divider sx={{ my: 2 }} />

        <Typography>
          <strong>ID Reparto:</strong>{" "}
          {employee.current_department?.department_id ?? "-"}
        </Typography>

        <Typography>
          <strong>Manager:</strong>{" "}
          {employee.current_department?.manager_employee_id ?? "-"}
        </Typography>

        <Typography>
          <strong>Dal:</strong>{" "}
          {employee.current_department?.from_date ?? "-"}
        </Typography>

        <Typography>
          <strong>Al:</strong>{" "}
          {employee.current_department?.to_date ?? "-"}
        </Typography>
      </Card>

      {/* SEZIONE STATUS */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight={600}>
          Status Attuale
        </Typography>
        <Divider sx={{ my: 2 }} />

        <Typography>
          <strong>Status:</strong>{" "}
          {employee.current_status?.status_type_id ?? "-"}
        </Typography>

        <Typography>
          <strong>Dal:</strong>{" "}
          {employee.current_status?.from_date ?? "-"}
        </Typography>

        <Typography>
          <strong>Al:</strong>{" "}
          {employee.current_status?.to_date ?? "-"}
        </Typography>
      </Card>

      {/* SEZIONE AUTO AZIENDALE */}
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={600}>
          Auto Aziendale
        </Typography>
        <Divider sx={{ my: 2 }} />

        <Typography>
          <strong>Modello:</strong>{" "}
          {employee.current_company_car?.car_model ?? "-"}
        </Typography>

        <Typography>
          <strong>Targa:</strong>{" "}
          {employee.current_company_car?.plate ?? "-"}
        </Typography>

        <Typography>
          <strong>Benefit:</strong>{" "}
          {employee.current_company_car?.benefit_type ?? "-"}
        </Typography>

        <Typography>
          <strong>Dal:</strong>{" "}
          {employee.current_company_car?.from_date ?? "-"}
        </Typography>

        <Typography>
          <strong>Al:</strong>{" "}
          {employee.current_company_car?.to_date ?? "-"}
        </Typography>
      </Card>
    </Box>
  );
}
