import { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { employeeService } from "../../services/employeeService";
import { CircularProgress, Box, Typography } from "@mui/material";

export default function EmployeesTable() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await employeeService.getAll();
      setRows(
        data.map((emp: any) => ({
          id: emp.id,
          first_name: emp.first_name,
          last_name: emp.last_name,
          email: emp.email,
          role: emp.role,
          site: emp.site?.site_id || emp.site?.id || "—",
          department: emp.department?.department_id || "—",
          contract: emp.contract?.contract_nature_id || "—",
          status: emp.status?.status_type_id || "—",
        }))
      );
    } catch (err: any) {
      console.error("Errore caricamento dipendenti:", err);
      setError("Errore nel caricamento dei dipendenti");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" sx={{ mt: 4, textAlign: "center" }}>
        {error}
      </Typography>
    );
  }

  const columns = [
    { field: "id", headerName: "ID", width: 80 },
    { field: "first_name", headerName: "Nome", width: 150 },
    { field: "last_name", headerName: "Cognome", width: 150 },
    { field: "email", headerName: "Email", width: 220 },
    { field: "role", headerName: "Ruolo", width: 150 },
    { field: "site", headerName: "Sito", width: 120 },
    { field: "department", headerName: "Reparto", width: 120 },
    { field: "contract", headerName: "Contratto", width: 120 },
    { field: "status", headerName: "Stato", width: 120 },
  ];

  return (
    <Box sx={{ height: 600, width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSizeOptions={[10, 20, 50]}
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
        }}
      />
    </Box>
  );
}
