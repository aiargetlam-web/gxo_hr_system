import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { employeeService } from "../services/employeeService";
import { EmployeeFull } from "../types";
import { Box, CircularProgress, Typography, Card } from "@mui/material";

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
      <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
        Profilo Dipendente
      </Typography>

      <Card sx={{ p: 3 }}>
        <Typography variant="h5">
          {employee.first_name} {employee.last_name}
        </Typography>

        <Typography sx={{ mt: 2 }}>
          <strong>Email:</strong> {employee.email}
        </Typography>

        <Typography sx={{ mt: 1 }}>
          <strong>Ruolo:</strong> {employee.role?.name}</strong>
        </Typography>

        <Typography sx={{ mt: 1 }}>
          <strong>Reparto:</strong> {employee.current_department?.department_id ?? "-"}
        </Typography>

        <Typography sx={{ mt: 1 }}>
          <strong>Sito:</strong> {employee.current_site?.site_id ?? "-"}
        </Typography>

        <Typography sx={{ mt: 1 }}>
          <strong>Contratto:</strong> {employee.current_contract?.work_regime_id ?? "-"}
        </Typography>

        <Typography sx={{ mt: 1 }}>
          <strong>Status:</strong> {employee.current_status?.status_type_id ?? "-"}
        </Typography>
      </Card>
    </Box>
  );
}
