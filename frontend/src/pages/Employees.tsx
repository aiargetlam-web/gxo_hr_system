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
import { EmployeeFull } from "../types";

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
  const [employees, setEmployees] = useState<EmployeeFull[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeFull | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  // Modali HR
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  const [openNewContract, setOpenNewContract] = useState<EmployeeFull | null>(null);
  const [openNewSalary, setOpenNewSalary] = useState<EmployeeFull | null>(null);
  const [openNewDepartment, setOpenNewDepartment] = useState<EmployeeFull | null>(null);
  const [openNewCostCenter, setOpenNewCostCenter] = useState<EmployeeFull | null>(null);
  const [openNewCompanyCar, setOpenNewCompanyCar] = useState<EmployeeFull | null>(null);
  const [openChangeSite, setOpenChangeSite] = useState<EmployeeFull | null>(null);
  const [openChangeStatus, setOpenChangeStatus] = useState<EmployeeFull | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await employeeService.getEmployeesFull();

      // Ordina alfabeticamente
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

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLButtonElement>,
    emp: EmployeeFull
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedEmployee(emp);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getRoleColor = (roleId: number) => {
    if (roleId === 6) return "error";
    if (roleId === 5) return "primary";
    if (roleId === 4) return "success";
    return "default";
  };

  const columns = [
    {
      field: "avatar",
      headerName: "",
      width: 70,
      sortable: false,
      filterable: false,
      renderCell: (params: any) => (
        <Avatar sx={{ bgcolor: "#1976d2" }}>
          {params.row.first_name?.[0]}
          {params.row.last_name?.[0]}
        </Avatar>
      ),
    },

    {
      field: "name",
      headerName: "Nome",
      flex: 1,
      valueGetter: (params: any) =>
        `${params.row.first_name} ${params.row.last_name}`,
    },

    { field: "email", headerName: "Email", flex: 1 },
    { field: "phone", headerName: "Telefono", flex: 1 },
    { field: "fiscal_code", headerName: "Codice Fiscale", flex: 1 },

    {
      field: "is_protected_category",
      headerName: "Protetta",
      flex: 1,
      renderCell: (params: any) =>
        params.row.is_protected_category ? (
          <Chip label="Protetta" color="error" />
        ) : (
          "-"
        ),
    },

    {
      field: "is_disadvantaged",
      headerName: "Svantaggiato",
      flex: 1,
      renderCell: (params: any) =>
        params.row.is_disadvantaged ? (
          <Chip label="Svantaggiato" color="warning" />
        ) : (
          "-"
        ),
    },

    {
      field: "role",
      headerName: "Ruolo",
      flex: 1,
      renderCell: (params: any) => (
        <Chip
          label={params.row.role?.name ?? "-"}
          color={getRoleColor(params.row.role?.id ?? 0)}
          variant="outlined"
        />
      ),
    },

    {
      field: "department",
      headerName: "Reparto",
      flex: 1,
      renderCell: (params: any) => (
        <Chip
          label={params.row.department?.name ?? "-"}
          color="secondary"
        />
      ),
    },

    {
      field: "site",
      headerName: "Sito",
      flex: 1,
      renderCell: (params: any) => (
        <Chip
          label={params.row.site?.name ?? "-"}
          color="info"
        />
      ),
    },

    {
      field: "contract",
      headerName: "Contratto",
      flex: 1,
      renderCell: (params: any) => (
        <Chip
          label={params.row.contract?.work_regime ?? "-"}
          color="primary"
        />
      ),
    },

    {
      field: "status",
      headerName: "Stato",
      flex: 1,
      renderCell: (params: any) => (
        <Chip
          label={params.row.status?.name ?? "N/D"}
          color="success"
        />
      ),
    },

    {
      field: "salary",
      headerName: "RAL",
      flex: 1,
      renderCell: (params: any) => (
        <Chip
          label={
            params.row.salary?.ral_amount
              ? `${params.row.salary.ral_amount} €`
              : "-"
          }
          color="warning"
        />
      ),
    },

    {
      field: "company_car",
      headerName: "Auto",
      flex: 1,
      renderCell: (params: any) => (
        <Chip
          label={params.row.company_car?.car_model ?? "-"}
          color="secondary"
        />
      ),
    },

    { field: "hire_date", headerName: "Assunzione", flex: 1 },
    { field: "termination_date", headerName: "Cessazione", flex: 1 },

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

  return (
    <Box p={3}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Typography variant="h4" fontWeight={700}>
          Gestione Dipendenti
        </Typography>

        <Stack direction="row" spacing={2}>
          <Button variant="outlined" onClick={() => alert("Import CSV non implementato")}>
            Importa CSV
          </Button>

          <Button variant="outlined" onClick={() => alert("Export CSV non implementato")}>
            Esporta CSV
          </Button>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenCreate(true)}
          >
            Nuovo Dipendente
          </Button>
        </Stack>
      </Stack>

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
        <MenuItem
          onClick={() => {
            setOpenEdit(true);
            handleMenuClose();
          }}
        >
          Modifica dati attuali
        </MenuItem>

        <MenuItem
          onClick={() => {
            setOpenNewContract(selectedEmployee);
            handleMenuClose();
          }}
        >
          Nuovo Contratto
        </MenuItem>

        <MenuItem
          onClick={() => {
            setOpenNewSalary(selectedEmployee);
            handleMenuClose();
          }}
        >
          Nuova RAL
        </MenuItem>

        <MenuItem
          onClick={() => {
            setOpenNewDepartment(selectedEmployee);
            handleMenuClose();
          }}
        >
          Nuovo Reparto
        </MenuItem>

        <MenuItem
          onClick={() => {
            setOpenNewCostCenter(selectedEmployee);
            handleMenuClose();
          }}
        >
          Nuovo Cost Center
        </MenuItem>

        <MenuItem
          onClick={() => {
            setOpenNewCompanyCar(selectedEmployee);
            handleMenuClose();
          }}
        >
          Nuova Auto Aziendale
        </MenuItem>

        <MenuItem
          onClick={() => {
            setOpenChangeSite(selectedEmployee);
            handleMenuClose();
          }}
        >
          Cambio Sito
        </MenuItem>

        <MenuItem
          onClick={() => {
            setOpenChangeStatus(selectedEmployee);
            handleMenuClose();
          }}
        >
          Cambio Stato Lavorativo
        </MenuItem>
      </Menu>

      {/* MODALI */}
      <EmployeeCreateModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onCreated={loadData}
      />

      <EmployeeEditModal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        onSaved={loadData}
        employee={selectedEmployee}
      />

      <EmployeeNewContractModal
        open={!!openNewContract}
        employee={openNewContract}
        onClose={() => setOpenNewContract(null)}
        onSaved={loadData}
      />

      <EmployeeNewSalaryModal
        open={!!openNewSalary}
        employee={openNewSalary}
        onClose={() => setOpenNewSalary(null)}
        onSaved={loadData}
      />

      <EmployeeNewDepartmentModal
        open={!!openNewDepartment}
        employee={openNewDepartment}
        onClose={() => setOpenNewDepartment(null)}
        onSaved={loadData}
      />

      <EmployeeNewCostCenterModal
        open={!!openNewCostCenter}
        employee={openNewCostCenter}
        onClose={() => setOpenNewCostCenter(null)}
        onSaved={loadData}
      />

      <EmployeeNewCompanyCarModal
        open={!!openNewCompanyCar}
        employee={openNewCompanyCar}
        onClose={() => setOpenNewCompanyCar(null)}
        onSaved={loadData}
      />

      <EmployeeChangeSiteModal
        open={!!openChangeSite}
        employee={openChangeSite}
        onClose={() => setOpenChangeSite(null)}
        onSaved={loadData}
      />

      <EmployeeChangeStatusModal
        open={!!openChangeStatus}
        employee={openChangeStatus}
        onClose={() => setOpenChangeStatus(null)}
        onSaved={loadData}
      />
    </Box>
  );
}
