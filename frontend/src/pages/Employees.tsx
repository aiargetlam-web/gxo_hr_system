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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
  FormControlLabel,
} from "@mui/material";


import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddIcon from "@mui/icons-material/Add";

import { DataGrid, GridToolbar } from "@mui/x-data-grid";

import { employeeService } from "../services/employeeService";
import { EmployeeFull } from "../types";
import { CostCenter } from "../types";


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
import EmployeeViewModal from "../components/employees/EmployeeViewModal";
import { employeeViewsService } from "../services/employeeViewsService";



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
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "ceased">("all");
  const [views, setViews] = useState<any[]>([]);
  const [selectedView, setSelectedView] = useState<number | null>(null);
  const [openCreateView, setOpenCreateView] = useState(false);
  const [newViewName, setNewViewName] = useState("");
  const [newViewColumns, setNewViewColumns] = useState<string[]>([]);
  const [openEditView, setOpenEditView] = useState(false);
  const [viewToEdit, setViewToEdit] = useState<any | null>(null);
  const [openDeleteView, setOpenDeleteView] = useState(false);
  const [viewToDelete, setViewToDelete] = useState<any | null>(null);



  
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);

  const openDetailModal = (emp: EmployeeFull) => {
    setSelectedEmployee(emp);
    setDetailOpen(true);
  };


  const createNewView = () => {
    setNewViewName("");
    setNewViewColumns(columns.map((c) => c.field)); // tutte selezionate di default
    setOpenCreateView(true);
  };



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
    employeeViewsService.getViews(1).then(setViews); // user_id = 1
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
      <Avatar
        sx={{ bgcolor: "#1976d2", cursor: "pointer" }}
        onClick={() => openDetailModal(params.row)}
      >
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
      params.row.is_protected_category ? "Protetta" : "-",
  },

  {
    field: "is_disadvantaged",
    headerName: "Svantaggiato",
    flex: 1,
    renderCell: (params: any) =>
      params.row.is_disadvantaged ? "Svantaggiato" : "-",
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
    renderCell: (params: any) =>
      params.row.department?.name ?? "-",
  },

  {
    field: "site",
    headerName: "Sito",
    flex: 1,
    renderCell: (params: any) =>
      params.row.site?.name ?? "-",
  },

  {
    field: "contract",
    headerName: "Contratto",
    flex: 1,
    renderCell: (params: any) =>
      params.row.contract?.work_regime ?? "-",
  },

  {
    field: "status",
    headerName: "Stato",
    flex: 1,
    renderCell: (params: any) => {
      const raw = params.row.status?.name ?? null;
      const isActive = params.row.is_active;
      const label = raw ? raw : "-";
      const color =
        isActive === true ? "green" :
        isActive === false ? "red" :
        "inherit";

      return (
        <span style={{ color }}>
          {label}
        </span>
      );
    },
  },

  {
    field: "salary",
    headerName: "RAL",
    flex: 1,
    renderCell: (params: any) =>
      params.row.salary?.ral_amount
        ? `${params.row.salary.ral_amount} €`
        : "-",
  },

  {
    field: "company_car",
    headerName: "Auto",
    flex: 1,
    renderCell: (params: any) =>
      params.row.company_car?.car_model ?? "-",
  },

  { field: "hire_date", headerName: "Assunzione", flex: 1 },
  { field: "termination_date", headerName: "Cessazione", flex: 1 },

  // 🔥 COLONNE EXTRA NASCOSTE (per viste future)
  { field: "gender", headerName: "Genere", flex: 1, hide: true },
  { field: "birth_date", headerName: "Data di nascita", flex: 1, hide: true },
  { field: "birth_place", headerName: "Luogo di nascita", flex: 1, hide: true },
  { field: "address_street", headerName: "Indirizzo", flex: 1, hide: true },
  { field: "address_city", headerName: "Città", flex: 1, hide: true },
  { field: "address_cap", headerName: "CAP", flex: 1, hide: true },
  { field: "id_lul", headerName: "ID LUL", flex: 1, hide: true },

  { field: "contract_nature", headerName: "Natura contratto", flex: 1, hide: true },
  { field: "weekly_hours", headerName: "Ore settimanali", flex: 1, hide: true },
  { field: "time_band", headerName: "Fascia oraria", flex: 1, hide: true },
  { field: "shift_type_name", headerName: "Turno", flex: 1, hide: true },
  { field: "fte", headerName: "FTE", flex: 1, hide: true },
  { field: "contract_from_date", headerName: "Inizio contratto", flex: 1, hide: true },
  { field: "contract_to_date", headerName: "Fine contratto", flex: 1, hide: true },
  { field: "contract_note", headerName: "Note contratto", flex: 1, hide: true },

  { field: "salary_from_date", headerName: "Inizio RAL", flex: 1, hide: true },
  { field: "salary_note", headerName: "Note RAL", flex: 1, hide: true },

  { field: "car_plate", headerName: "Targa", flex: 1, hide: true },
  { field: "car_from_date", headerName: "Assegnazione auto", flex: 1, hide: true },
  { field: "car_note", headerName: "Note auto", flex: 1, hide: true },

  { field: "manager", headerName: "Manager", flex: 1, hide: true },

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

      <Box mb={2}>
        <input
          type="text"
          placeholder="Cerca nome, cognome, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            fontSize: "16px",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        />
      </Box>

      {/* FILTRI RAPIDI */}
      <Stack direction="row" spacing={2} mb={2}>
        <Button
          variant={statusFilter === "all" ? "contained" : "outlined"}
          onClick={() => setStatusFilter("all")}
        >
          Tutti
        </Button>

        <Button
          variant={statusFilter === "active" ? "contained" : "outlined"}
          onClick={() => setStatusFilter("active")}
        >
          Attivi
        </Button>

        <Button
          variant={statusFilter === "ceased" ? "contained" : "outlined"}
          onClick={() => setStatusFilter("ceased")}
        >
          Cessati
        </Button>
      </Stack>

      {/* VISTE SALVATE */}
      <Stack direction="row" spacing={2} mb={2} alignItems="center">
        <select
          value={selectedView ?? "default"}
          onChange={(e) => setSelectedView(e.target.value === "default" ? null : Number(e.target.value))}
          style={{
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "16px",
            minWidth: "200px",
          }}
        >
          <option value="default">Default</option>

          {views.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>

        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => createNewView()}
        >
          Nuova Vista
        </Button>

        <Button
          variant="outlined"
          onClick={() => {
            if (!selectedView) {
              alert("La vista Default non può essere modificata");
              return;
            }
            const v = views.find((x) => x.id === selectedView);
            setViewToEdit(v);
            setOpenEditView(true);
          }}
        >
          Modifica Vista
        </Button>

        <Button
          variant="outlined"
          color="error"
          onClick={() => {
            if (!selectedView) {
              alert("La vista Default non può essere eliminata");
              return;
            }
            const v = views.find((x) => x.id === selectedView);
            setViewToDelete(v);
            setOpenDeleteView(true);
          }}
        >
          Elimina Vista
        </Button>

      </Stack>



      <Card sx={{ height: 650 }}>
        <DataGrid
          rows={employees
            .filter((emp) =>
              `${emp.first_name} ${emp.last_name} ${emp.email}`
                .toLowerCase()
                .includes(search.toLowerCase())
            )
            .filter((emp) => {
              if (statusFilter === "all") return true;
              if (statusFilter === "active") return emp.is_active === true;
              if (statusFilter === "ceased") return emp.is_active === false;
              return true;
            })}

          columns={
            selectedView
              ? columns.filter((c) =>
                  views.find((v) => v.id === selectedView)?.columns.includes(c.field)
                )
              : columns
          }

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
        onUpdated={reload}
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
      <EmployeeViewModal
                    open={detailOpen}
                    onClose={() => setDetailOpen(false)}
                    employee={selectedEmployee}
               />

      <Dialog open={openCreateView} onClose={() => setOpenCreateView(false)} fullWidth maxWidth="sm">
                    <DialogTitle>Crea nuova vista</DialogTitle>

                   <DialogContent>
                        <TextField
                              label="Nome vista"
                              fullWidth
                              margin="normal"
                              value={newViewName}
                              onChange={(e) => setNewViewName(e.target.value)}
                        />

                        <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                              Colonne da includere:
                        </Typography>

                        <Stack>
                              {columns
                                   .filter((c) => c.field !== "actions") // opzionale
                                   .map((c) => (
                                      <FormControlLabel
                                            key={c.field}
                                            control={
                                                 <Checkbox
                                                       checked={newViewColumns.includes(c.field)}
                                                       onChange={(e) => {
                                                            if (e.target.checked) {
                                                               setNewViewColumns((prev) => [...prev, c.field]);
                                                            } else {
                                                               setNewViewColumns((prev) => prev.filter((f) => f !== c.field));
                                                            }
                                                       }}
                                                 />
                                            }
                                            label={c.headerName || c.field}
                                      />
                                  ))}
                        </Stack>
                   </DialogContent>

                   <DialogActions>
                        <Button onClick={() => setOpenCreateView(false)}>Annulla</Button>

                        <Button
                              variant="contained"
                              onClick={async () => {
                                   if (!newViewName.trim()) {
                                       alert("Inserisci un nome per la vista");
                                       return;
                                   }

                                  if (!newViewColumns.length) {
                                      alert("Seleziona almeno una colonna");
                                      return;
                                   }

                                   await employeeViewsService.createView({
                                       user_id: 1,
                                       name: newViewName,
                                       columns: newViewColumns,
                                   });

                                   const updated = await employeeViewsService.getViews(1);
                                   setViews(updated);
                                   setOpenCreateView(false);
                              }}
                        >
                             Salva vista
                        </Button>
                  </DialogActions>
             </Dialog>
             
             <Dialog open={openEditView} onClose={() => setOpenEditView(false)} fullWidth maxWidth="sm">
                                    <DialogTitle>Modifica vista</DialogTitle>

                                    <DialogContent>
                                         <TextField
                                               label="Nome vista"
                                               fullWidth
                                               margin="normal"
                                               value={viewToEdit?.name ?? ""}
                                               onChange={(e) =>
                                                    setViewToEdit((prev: any) => ({ ...prev, name: e.target.value }))
                                               }
                                         />

                                        <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                                             Colonne da includere:
                                        </Typography>

                                        <Stack>
                                              {columns
                                                   .filter((c) => c.field !== "actions")
                                                   .map((c) => (
                                                      <FormControlLabel
                                                            key={c.field}
                                                            control={
                                                                <Checkbox
                                                                      checked={viewToEdit?.columns.includes(c.field)}
                                                                      onChange={(e) => {
                                                                           if (e.target.checked) {
                                                                               setViewToEdit((prev: any) => ({
                                                                                    ...prev,
                                                                                   columns: [...prev.columns, c.field],
                                                                               }));
                                                                           } else {
                                                                              setViewToEdit((prev: any) => ({
                                                                                    ...prev,
                                                                                   columns: prev.columns.filter((f: string) => f !== c.field),
                                                                               }));
                                                                           }
                                                                      }}
                                                                />
                                                            }
                                                           label={c.headerName || c.field}
                                                      />
                                                  ))}
                                        </Stack>
                                    </DialogContent>

                                    <DialogActions>
                                         <Button onClick={() => setOpenEditView(false)}>Annulla</Button>

                                         <Button
                                               variant="contained"
                                               onClick={async () => {
                                                    await employeeViewsService.updateView(viewToEdit.id, {
                                                         name: viewToEdit.name,
                                                         columns: viewToEdit.columns,
                                                    });

                                                   const updated = await employeeViewsService.getViews(1);
                                                   setViews(updated);
                                                   setOpenEditView(false);
                                               }}
                                         >
                                               Salva modifiche
                                         </Button>
                                   </DialogActions>
                              </Dialog>

            <Dialog open={openDeleteView} onClose={() => setOpenDeleteView(false)} fullWidth maxWidth="xs">
                                  <DialogTitle>Elimina vista</DialogTitle>

                                  <DialogContent>
                                        <Typography>
                                             Sei sicuro di voler eliminare la vista <b>{viewToDelete?.name}</b>?
                                        </Typography>
                                  </DialogContent>

                                 <DialogActions>
                                      <Button onClick={() => setOpenDeleteView(false)}>Annulla</Button>

                                      <Button
                                            variant="contained"
                                            color="error"
                                            onClick={async () => {
                                                 await employeeViewsService.deleteView(viewToDelete.id);

                                                 const updated = await employeeViewsService.getViews(1);
                                                 setViews(updated);

                                                 setSelectedView(null); // torna alla Default
                                                 setOpenDeleteView(false);
                                            }}
                                      >
                                            Elimina
                                      </Button>
                                  </DialogActions>
                             </Dialog>

      
    </Box>
  );
}
