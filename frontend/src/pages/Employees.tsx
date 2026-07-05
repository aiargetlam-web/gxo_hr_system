import { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddIcon from "@mui/icons-material/Add";

import { DataGrid, GridToolbar } from "@mui/x-data-grid";

import { employeeService } from "../services/employeeService";
import { Employee } from "../types";

// Modali HR
import EmployeeCreateModal from "../components/employees/EmployeeCreateModal";
import EmployeeEditModal from "../components/employees/EmployeeEditModal";

import EmployeeNewContractModal from "../components/employees/EmployeeNewContractModal";
import EmployeeNewSalaryModal from "../components/employees/EmployeeNewSalaryModal";
import EmployeeNewDepartmentModal from "../components/employees/EmployeeNewDepartmentModal";
import EmployeeNewCostCenterModal from "../components/employees/EmployeeNewCostCenterModal";
import EmployeeNewCompanyCarModal from "../components/employees/EmployeeNewCompanyCarModal";
import EmployeeChangeSiteModal from "../components/employees/EmployeeChangeSiteModal";
import EmployeeChangeStatusModal from "../components/employees/EmployeeChangeStatusModal";

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  // Modali HR
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  const [openNewContract, setOpenNewContract] = useState<Employee | null>(null);
  const [openNewSalary, setOpenNewSalary] = useState<Employee | null>(null);
  const [openNewDepartment, setOpenNewDepartment] = useState<Employee | null>(null);
  const [openNewCostCenter, setOpenNewCostCenter] = useState<Employee | null>(null);
  const [openNewCompanyCar, setOpenNewCompanyCar] = useState<Employee | null>(null);
  const [openChangeSite, setOpenChangeSite] = useState<Employee | null>(null);
  const [openChangeStatus, setOpenChangeStatus] = useState<Employee | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await employeeService.getAll();

      // 🔥 Ordinamento alfabetico
      data.sort((a, b) =>
        `${a.last_name} ${a.first_name}`.localeCompare(`${b.last_name} ${b.first_name}`)
      );

      setEmployees(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, emp: Employee) => {
    setAnchorEl(event.currentTarget);
    setSelectedEmployee(emp);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // 🔥 Ruoli moderni con badge colorati
  const getRoleName = (role_id: number) => {
    if (role_id === 6) return "Amministratore";
    if (role_id === 5) return "Risorse Umane";
    if (role_id === 4) return "Operaio di Magazzino";
    return "Dipendente";
  };

  const getRoleColor = (role_id: number) => {
    if (role_id === 6) return "error";
    if (role_id === 5) return "primary";
    if (role_id === 4) return "success";
    return "default";
  };

  const getStatusColor = (status: any) => {
    if (!status?.status_type_id) return "default";
    if (status.status_type_id === 1) return "success";
    if (status.status_type_id === 2) return "warning";
    return "default";
  };

  // 🔥 Colonne DataGrid moderne
  const columns = [
    {
      field: "avatar",
      headerName: "",
      width: 70,
      sortable: false,
      filterable: false,
      renderCell: (params: any) => (
        <Avatar sx={{ bgcolor: "#1976d2" }}>
          {params.row.first_name[0]}
          {params.row.last_name[0]}
        </Avatar>
      ),
    },
    {
      field: "name",
      headerName: "Nome",
      flex: 1,
      valueGetter: (params: any) => `${params.row.first_name} ${params.row.last_name}`,
    },
    {
      field: "role",
      headerName: "Ruolo",
      flex: 1,
      renderCell: (params: any) => (
        <Chip
          label={getRoleName(params.row.role_id)}
          color={getRoleColor(params.row.role_id)}
          variant="outlined"
        />
      ),
    },
    {
      field: "department",
      headerName: "Reparto",
      flex: 1,
      valueGetter: (params: any) =>
        params.row.current_department?.department_id
          ? `Dept #${params.row.current_department.department_id}`
          : "-",
    },
    {
      field: "site",
      headerName: "Sito",
      flex: 1,
      valueGetter: (params: any) =>
        params.row.current_site?.site_id ? `Sito #${params.row.current_site.site_id}` : "-",
    },
    {
      field: "contract",
      headerName: "Contratto",
      flex: 1,
      valueGetter: (params: any) =>
        params.row.current_contract?.work_regime_id
          ? `Regime #${params.row.current_contract.work_regime_id}`
          : "-",
    },
    {
      field: "status",
      headerName: "Stato",
      flex: 1,
      renderCell: (params: any) => (
        <Chip
          label={
            params.row.current_status?.status_type_id
              ? `Status #${params.row.current_status.status_type_id}`
              : "N/D"
          }
          color={getStatusColor(params.row.current_status)}
        />
      ),
    },
    {
      field: "actions",
      headerName: "",
      width: 60,
      sortable: false,
      filterable: false,
      renderCell: (params: any) => (
        <IconButton onClick={(ev) => handleMenuOpen(ev, params.row)}>
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  // 🔥 Export CSV
  const handleExportCSV = () => {
    const rows = employees.map(e => ({
      Nome: `${e.first_name} ${e.last_name}`,
      Ruolo: getRoleName(e.role_id),
      Reparto: e.current_department?.department_id || "-",
      Sito: e.current_site?.site_id || "-",
      Contratto: e.current_contract?.work_regime_id || "-",
      Stato: e.current_status?.status_type_id || "N/D",
    }));

    const csv = [
      Object.keys(rows[0]).join(";"),
      ...rows.map(r => Object.values(r).join(";"))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "dipendenti.csv";
    link.click();
  };

  // 🔥 Import CSV (placeholder)
  const handleImportCSV = () => {
    alert("Funzione Import CSV da implementare (richiede backend)");
  };

  return (
    <Box p={3}>
      {/* HEADER */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Gestione Dipendenti
        </Typography>

        <Stack direction="row" spacing={2}>
          <Button variant="outlined" onClick={handleImportCSV}>
            Importa CSV
          </Button>

          <Button variant="outlined" onClick={handleExportCSV}>
            Esporta CSV
          </Button>

          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenCreate(true)}>
            Nuovo Dipendente
          </Button>
        </Stack>
      </Stack>

      {/* TABELLA MODERNA */}
      <Card sx={{ height: 650 }}>
        <DataGrid
          rows={employees}
          columns={columns}
          loading={loading}
          disableSelectionOnClick
          pageSize={10}
          components={{ Toolbar: GridToolbar }}
          initialState={{
            pagination: { pageSize: 10 },
            sorting: { sortModel: [{ field: "name", sort: "asc" }] },
          }}
        />
      </Card>

      {/* MENU ⋮ */}
      <Menu anchorEl={anchorEl} open={openMenu} onClose={handleMenuClose}>
        <MenuItem onClick={() => { setOpenEdit(true); handleMenuClose(); }}>
          Modifica dati attuali
        </MenuItem>

        <MenuItem onClick={() => { setOpenNewContract(selectedEmployee); handleMenuClose(); }}>
          Nuovo Contratto
        </MenuItem>

        <MenuItem onClick={() => { setOpenNewSalary(selectedEmployee); handleMenuClose(); }}>
          Nuova RAL
        </MenuItem>

        <MenuItem onClick={() => { setOpenNewDepartment(selectedEmployee); handleMenuClose(); }}>
          Nuovo Reparto
        </MenuItem>

        <MenuItem onClick={() => { setOpenNewCostCenter(selectedEmployee); handleMenuClose(); }}>
          Nuovo Cost Center
        </MenuItem>

        <MenuItem onClick={() => { setOpenNewCompanyCar(selectedEmployee); handleMenuClose(); }}>
          Nuova Auto Aziendale
        </MenuItem>

        <MenuItem onClick={() => { setOpenChangeSite(selectedEmployee); handleMenuClose(); }}>
          Cambio Sito
        </MenuItem>

        <MenuItem onClick={() => { setOpenChangeStatus(selectedEmployee); handleMenuClose(); }}>
          Cambio Stato Lavorativo
        </MenuItem>
      </Menu>

      {/* MODALI HR */}
      <EmployeeCreateModal open={openCreate} onClose={() => setOpenCreate(false)} onCreated={loadData} />

      <EmployeeEditModal open={openEdit} onClose={() => setOpenEdit(false)} onSaved={loadData} employee={selectedEmployee} />

      <EmployeeNewContractModal open={!!openNewContract} employee={openNewContract} onClose={() => setOpenNewContract(null)} onSaved={loadData} />

      <EmployeeNewSalaryModal open={!!openNewSalary} employee={openNewSalary} onClose={() => setOpenNewSalary(null)} onSaved={loadData} />

      <EmployeeNewDepartmentModal open={!!openNewDepartment} employee={openNewDepartment} onClose={() => setOpenNewDepartment(null)} onSaved={loadData} />

      <EmployeeNewCostCenterModal open={!!openNewCostCenter} employee={openNewCostCenter} onClose={() => setOpenNewCostCenter(null)} onSaved={loadData} />

      <EmployeeNewCompanyCarModal open={!!openNewCompanyCar} employee={openNewCompanyCar} onClose={() => setOpenNewCompanyCar(null)} onSaved={loadData} />

      <EmployeeChangeSiteModal open={!!openChangeSite} employee={openChangeSite} onClose={() => setOpenChangeSite(null)} onSaved={loadData} />

      <EmployeeChangeStatusModal open={!!openChangeStatus} employee={openChangeStatus} onClose={() => setOpenChangeStatus(null)} onSaved={loadData} />
    </Box>
  );
}
