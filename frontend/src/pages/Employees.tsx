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
  Select,
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

  // ⭐ Filtri HR avanzati
  const [filterSite, setFilterSite] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterProtetta, setFilterProtetta] = useState("");
  const [filterSvantaggiato, setFilterSvantaggiato] = useState("");
  const [filterCCNL, setFilterCCNL] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await employeeService.getEmployees();

      data.sort((a: EmployeeFull, b: EmployeeFull) =>
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
  // ⭐ Funzioni HR per pulsanti rapidi
  const applyQuickFilter = (type: string) => {
    if (type === "attivi") setFilterStatus("1");
    if (type === "protetti") setFilterProtetta("yes");
    if (type === "svantaggiati") setFilterSvantaggiato("yes");
    if (type === "preposti") setFilterRole("preposto");
    if (type === "operai") setFilterRole("4");
    if (type === "hr") setFilterRole("5");
    if (type === "admin") setFilterRole("6");
  };

  const resetFilters = () => {
    setFilterSite("");
    setFilterRole("");
    setFilterDept("");
    setFilterStatus("");
    setFilterProtetta("");
    setFilterSvantaggiato("");
    setFilterCCNL("");
  };

  // ⭐ Toolbar HR personalizzata (due righe)
  const HRToolbar = () => (
    <Stack spacing={1} sx={{ p: 1 }}>
      
      {/* RIGA 1 — Pulsanti HR */}
      <Stack direction="row" spacing={1}>
        <Button variant="outlined" onClick={() => applyQuickFilter("attivi")}>Attivi</Button>
        <Button variant="outlined" onClick={() => applyQuickFilter("protetti")}>Protetti</Button>
        <Button variant="outlined" onClick={() => applyQuickFilter("svantaggiati")}>Svantaggiati</Button>
        <Button variant="outlined" onClick={() => applyQuickFilter("preposti")}>Preposti</Button>
        <Button variant="outlined" onClick={() => applyQuickFilter("operai")}>Operai</Button>
        <Button variant="outlined" onClick={() => applyQuickFilter("hr")}>HR</Button>
        <Button variant="outlined" onClick={() => applyQuickFilter("admin")}>Admin</Button>
        <Button variant="contained" color="error" onClick={resetFilters}>Reset</Button>
      </Stack>

      {/* RIGA 2 — Filtri HR avanzati */}
      <Stack direction="row" spacing={1}>
        <Select value={filterSite} onChange={(e) => setFilterSite(e.target.value)} displayEmpty>
          <MenuItem value="">Sito</MenuItem>
          <MenuItem value="1">Sito 1</MenuItem>
          <MenuItem value="2">Sito 2</MenuItem>
        </Select>

        <Select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} displayEmpty>
          <MenuItem value="">Ruolo</MenuItem>
          <MenuItem value="4">Operaio</MenuItem>
          <MenuItem value="5">HR</MenuItem>
          <MenuItem value="6">Admin</MenuItem>
        </Select>

        <Select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} displayEmpty>
          <MenuItem value="">Reparto</MenuItem>
          <MenuItem value="1">Reparto 1</MenuItem>
          <MenuItem value="2">Reparto 2</MenuItem>
        </Select>

        <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} displayEmpty>
          <MenuItem value="">Stato</MenuItem>
          <MenuItem value="1">Attivo</MenuItem>
          <MenuItem value="2">Sospeso</MenuItem>
        </Select>

        <Select value={filterProtetta} onChange={(e) => setFilterProtetta(e.target.value)} displayEmpty>
          <MenuItem value="">Protetta</MenuItem>
          <MenuItem value="yes">Sì</MenuItem>
          <MenuItem value="no">No</MenuItem>
        </Select>

        <Select value={filterSvantaggiato} onChange={(e) => setFilterSvantaggiato(e.target.value)} displayEmpty>
          <MenuItem value="">Svantaggiato</MenuItem>
          <MenuItem value="yes">Sì</MenuItem>
          <MenuItem value="no">No</MenuItem>
        </Select>

        <Select value={filterCCNL} onChange={(e) => setFilterCCNL(e.target.value)} displayEmpty>
          <MenuItem value="">CCNL</MenuItem>
          <MenuItem value="1">1° livello</MenuItem>
          <MenuItem value="2">2° livello</MenuItem>
          <MenuItem value="3">3° livello</MenuItem>
        </Select>
      </Stack>

      {/* RIGA 3 — Toolbar standard */}
      <GridToolbar />
    </Stack>
  );
  const getRoleName = (roleId: number) => {
    if (roleId === 6) return "Amministratore";
    if (roleId === 5) return "Risorse Umane";
    if (roleId === 4) return "Operaio di Magazzino";
    return "Dipendente";
  };

  const getRoleColor = (roleId: number) => {
    if (roleId === 6) return "error";
    if (roleId === 5) return "primary";
    if (roleId === 4) return "success";
    return "default";
  };

  const getStatusColor = (status: any) => {
    if (!status?.status_type_id) return "default";
    if (status.status_type_id === 1) return "success";
    if (status.status_type_id === 2) return "warning";
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
      field: "ccnl_level",
      headerName: "CCNL",
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={`Livello ${params.row.ccnl_level}`}
          color="primary"
          variant="outlined"
        />
      ),
    },

    {
      field: "is_protected_category",
      headerName: "Protetta",
      flex: 1,
      renderCell: (params) =>
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
      renderCell: (params) =>
        params.row.is_disadvantaged ? (
          <Chip label="Svantaggiato" color="warning" />
        ) : (
          "-"
        ),
    },

    {
      field: "preposto",
      headerName: "Preposto",
      flex: 1,
      renderCell: (params) =>
        params.row.preposto ? (
          <Chip label="Preposto" color="success" />
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
          label={getRoleName(params.row.role?.id ?? 0)}
          color={getRoleColor(params.row.role?.id ?? 0)}
          variant="outlined"
        />
      ),
    },

    {
      field: "department",
      headerName: "Reparto",
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={`Dept #${params.row.department?.department_id ?? "-"}`}
          color="secondary"
        />
      ),
    },

    {
      field: "site",
      headerName: "Sito",
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={`Sito #${params.row.site?.id ?? "-"}`}
          color="info"
        />
      ),
    },

    {
      field: "contract",
      headerName: "Contratto",
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={`Regime #${params.row.contract?.work_regime_id ?? "-"}`}
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
          label={
            params.row.status?.status_type_id
              ? `Status #${params.row.status.status_type_id}`
              : "N/D"
          }
          color={getStatusColor(params.row.status)}
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
  const handleExportCSV = () => {
    const rows = employees.map((e) => ({
      Nome: `${e.first_name} ${e.last_name}`,
      Ruolo: getRoleName(e.role?.id ?? 0),
      Reparto: e.department?.department_id || "-",
      Sito: e.site?.id || "-",
      Contratto: e.contract?.work_regime_id || "-",
      Stato: e.status?.status_type_id || "N/D",
    }));

    if (rows.length === 0) return;

    const csv = [
      Object.keys(rows[0]).join(";"),
      ...rows.map((r) => Object.values(r).join(";")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "dipendenti.csv";
    link.click();
  };

  const handleImportCSV = () => {
    alert("Funzione Import CSV da implementare (richiede backend)");
  };
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
          <Button variant="outlined" onClick={handleImportCSV}>
            Importa CSV
          </Button>

          <Button variant="outlined" onClick={handleExportCSV}>
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
          components={{ Toolbar: HRToolbar }}
          initialState={{
            pagination: { pageSize: 10 },
            sorting: { sortModel: [{ field: "name", sort: "asc" }] },
          }}
        />
      </Card>
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
          <Button variant="outlined" onClick={handleImportCSV}>
            Importa CSV
          </Button>

          <Button variant="outlined" onClick={handleExportCSV}>
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
          components={{ Toolbar: HRToolbar }}
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

      {/* MODALI HR */}
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
