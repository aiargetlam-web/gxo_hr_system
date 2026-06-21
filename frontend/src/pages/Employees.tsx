// 🔥 IMPORT IDENTICI AI TUOI
import { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddIcon from "@mui/icons-material/Add";

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

  const [search, setSearch] = useState("");

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, emp: Employee) => {
    setAnchorEl(event.currentTarget);
    setSelectedEmployee(emp);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

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
      setEmployees(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" sx={{ mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  const filtered = employees.filter((e) => {
    const s = search.toLowerCase();
    return (
      e.first_name.toLowerCase().includes(s) ||
      e.last_name.toLowerCase().includes(s)
    );
  });

  // 🔥 PATCH: funzioni per mostrare valori leggibili
  const getRoleName = (role_id: number) => {
    if (role_id === 1) return "Admin";
    if (role_id === 2) return "HR";
    return "Dipendente";
  };

  const getDepartmentName = (d: any) =>
    d?.department_id ? `Dept #${d.department_id}` : "-";

  const getSiteName = (s: any) =>
    s?.site_id ? `Sito #${s.site_id}` : "-";

  const getContractName = (c: any) =>
    c?.work_regime_id ? `Regime #${c.work_regime_id}` : "-";

  const getStatusName = (s: any) =>
    s?.status_type_id ? `Status #${s.status_type_id}` : "N/D";

  return (
    <Box p={3}>
      {/* HEADER */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Gestione Dipendenti
        </Typography>

        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenCreate(true)}>
          Nuovo Dipendente
        </Button>
      </Stack>

      {/* FILTRO */}
      <Card sx={{ p: 2, mb: 3 }}>
        <TextField
          label="Cerca dipendente"
          fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Card>

      {/* TABELLA */}
      <Card>
        <Box p={2}>
          <Stack direction="row" sx={{ fontWeight: 600, mb: 1 }}>
            <Box width={60}></Box>
            <Box flex={1}>Nome</Box>
            <Box flex={1}>Ruolo</Box>
            <Box flex={1}>Reparto</Box>
            <Box flex={1}>Sito</Box>
            <Box flex={1}>Contratto</Box>
            <Box width={140}>Stato</Box>
            <Box width={50}></Box>
          </Stack>

          <Divider sx={{ mb: 2 }} />

          {filtered.map((e) => (
            <Stack
              key={e.id}
              direction="row"
              alignItems="center"
              sx={{ py: 1.5, borderBottom: "1px solid #eee" }}
            >
              <Box width={60}>
                <Avatar sx={{ bgcolor: "#1976d2" }}>
                  {e.first_name[0]}
                  {e.last_name[0]}
                </Avatar>
              </Box>

              <Box flex={1}>
                {e.first_name} {e.last_name}
              </Box>

              {/* 🔥 PATCH: ruolo */}
              <Box flex={1}>
                {getRoleName(e.role_id)}
              </Box>

              {/* 🔥 PATCH: reparto */}
              <Box flex={1}>
                {getDepartmentName(e.current_department)}
              </Box>

              {/* 🔥 PATCH: sito */}
              <Box flex={1}>
                {getSiteName(e.current_site)}
              </Box>

              {/* 🔥 PATCH: contratto */}
              <Box flex={1}>
                {getContractName(e.current_contract)}
              </Box>

              {/* 🔥 PATCH: stato */}
              <Box width={140}>
                <Chip
                  label={getStatusName(e.current_status)}
                  color={getStatusName(e.current_status) === "Status #1" ? "primary" : "default"}
                />
              </Box>

              <Box width={50} textAlign="right">
                <IconButton onClick={(ev) => handleMenuOpen(ev, e)}>
                  <MoreVertIcon />
                </IconButton>
              </Box>
            </Stack>
          ))}
        </Box>
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
