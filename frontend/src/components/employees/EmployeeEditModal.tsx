// ===============================================
// BLOCCO 1 — STRUTTURA BASE + SIDEBAR COLLASSABILE
// ===============================================

import React, { useState, useEffect } from "react";
import {
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Button,
  Toolbar,
  AppBar,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import PersonIcon from "@mui/icons-material/Person";
import DescriptionIcon from "@mui/icons-material/Description";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import ApartmentIcon from "@mui/icons-material/Apartment";
import PaidIcon from "@mui/icons-material/Paid";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import SchoolIcon from "@mui/icons-material/School";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LocationOnIcon from "@mui/icons-material/LocationOn";

import api from "../../api/api"; // axios instance

// Tipi delle sezioni
type SectionKey =
  | "anagrafica"
  | "contratto"
  | "costCenter"
  | "reparto"
  | "ralBenefitAuto"
  | "enac"
  | "status"
  | "sito";

interface EmployeeEditModalProps {
  open: boolean;
  employeeId: number;
  onClose: () => void;
}

const drawerWidth = 260;

// Sidebar items
const sections: { key: SectionKey; label: string; icon: React.ReactNode }[] = [
  { key: "anagrafica", label: "Anagrafica", icon: <PersonIcon /> },
  { key: "contratto", label: "Contratto", icon: <DescriptionIcon /> },
  { key: "costCenter", label: "Cost Center", icon: <AccountTreeIcon /> },
  { key: "reparto", label: "Reparto", icon: <ApartmentIcon /> },
  { key: "ralBenefitAuto", label: "RAL / Benefit / Auto", icon: <PaidIcon /> },
  { key: "enac", label: "ENAC Corsi / Approvazioni", icon: <SchoolIcon /> },
  { key: "status", label: "Stato Lavorativo", icon: <CheckCircleIcon /> },
  { key: "sito", label: "Sito", icon: <LocationOnIcon /> },
];

export const EmployeeEditModal: React.FC<EmployeeEditModalProps> = ({
  open,
  employeeId,
  onClose,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState<SectionKey>("anagrafica");

  // Stato dati dipendente
  const [employeeData, setEmployeeData] = useState<any>(null);

  // Carica dati dipendente
  useEffect(() => {
    if (open && employeeId) {
      api
        .get(`/employees/${employeeId}`)
        .then((res) => {
          setEmployeeData(res.data);
        })
        .catch((err) => {
          console.error("Errore caricamento dipendente:", err);
        });
    }
  }, [open, employeeId]);

  const handleToggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  if (!open) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        bgcolor: "rgba(0,0,0,0.4)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1300,
      }}
    >
      <Box
        sx={{
          width: "90%",
          maxWidth: 1200,
          height: "90%",
          bgcolor: "background.paper",
          boxShadow: 24,
          borderRadius: 2,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* HEADER */}
        <AppBar position="static" color="default" elevation={0}>
          <Toolbar sx={{ px: 2 }}>
            <IconButton edge="start" onClick={handleToggleSidebar}>
              <MenuIcon />
            </IconButton>

            <Typography variant="h6" sx={{ ml: 1, flexGrow: 1 }}>
              Modifica Dipendente #{employeeId}
            </Typography>

            <Button onClick={onClose}>Chiudi</Button>
          </Toolbar>
        </AppBar>

        <Box sx={{ display: "flex", flex: 1, minHeight: 0 }}>
          {/* SIDEBAR COLLASSABILE */}
          <Drawer
            variant="persistent"
            open={sidebarOpen}
            sx={{
              width: sidebarOpen ? drawerWidth : 0,
              flexShrink: 0,
              "& .MuiDrawer-paper": {
                width: drawerWidth,
                boxSizing: "border-box",
              },
            }}
          >
            <Toolbar />
            <List>
              {sections.map((section) => (
                <ListItemButton
                  key={section.key}
                  selected={activeSection === section.key}
                  onClick={() => setActiveSection(section.key)}
                >
                  <ListItemIcon>{section.icon}</ListItemIcon>
                  <ListItemText primary={section.label} />
                </ListItemButton>
              ))}
            </List>
          </Drawer>

          {/* CONTENUTO PRINCIPALE */}
          <Box
            sx={{
              flex: 1,
              p: 3,
              overflow: "auto",
            }}
          >
            {!employeeData ? (
              <Typography>Caricamento dati...</Typography>
            ) : (
              <>
                {/* ============================
    BLOCCO 2 — FORM ANAGRAFICA
   ============================ */}

{activeSection === "anagrafica" && employeeData && (
  <Box sx={{ maxWidth: 600 }}>
    <Typography variant="h6" gutterBottom>
      Anagrafica
    </Typography>

    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <TextField
        label="Nome"
        value={employeeData.first_name || ""}
        onChange={(e) =>
          setEmployeeData({ ...employeeData, first_name: e.target.value })
        }
        fullWidth
      />

      <TextField
        label="Cognome"
        value={employeeData.last_name || ""}
        onChange={(e) =>
          setEmployeeData({ ...employeeData, last_name: e.target.value })
        }
        fullWidth
      />

      <TextField
        label="Email"
        value={employeeData.email || ""}
        onChange={(e) =>
          setEmployeeData({ ...employeeData, email: e.target.value })
        }
        fullWidth
      />

      <TextField
        label="Telefono"
        value={employeeData.phone || ""}
        onChange={(e) =>
          setEmployeeData({ ...employeeData, phone: e.target.value })
        }
        fullWidth
      />

      <TextField
        label="Codice Fiscale"
        value={employeeData.fiscal_code || ""}
        onChange={(e) =>
          setEmployeeData({ ...employeeData, fiscal_code: e.target.value })
        }
        fullWidth
      />

      <TextField
        label="Data di nascita"
        type="date"
        value={
          employeeData.birth_date
            ? employeeData.birth_date.substring(0, 10)
            : ""
        }
        onChange={(e) =>
          setEmployeeData({ ...employeeData, birth_date: e.target.value })
        }
        fullWidth
        InputLabelProps={{ shrink: true }}
      />

      <TextField
        label="Luogo di nascita"
        value={employeeData.birth_place || ""}
        onChange={(e) =>
          setEmployeeData({ ...employeeData, birth_place: e.target.value })
        }
        fullWidth
      />

      <TextField
        label="Indirizzo (via)"
        value={employeeData.address_street || ""}
        on

{/* ============================
    BLOCCO 3 — FORM CONTRATTO
   ============================ */}

{activeSection === "contratto" && employeeData && (
  <Box sx={{ maxWidth: 600 }}>
    <Typography variant="h6" gutterBottom>
      Contratto
    </Typography>

    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Natura contratto */}
      <FormControl fullWidth>
        <InputLabel>Natura contratto</InputLabel>
        <Select
          value={employeeData.contract_nature_id || ""}
          label="Natura contratto"
          onChange={(e) =>
            setEmployeeData({
              ...employeeData,
              contract_nature_id: Number(e.target.value),
            })
          }
        >
          <MenuItem value={1}>Tempo determinato</MenuItem>
          <MenuItem value={2}>Tempo indeterminato</MenuItem>
          <MenuItem value={3}>Apprendistato</MenuItem>
        </Select>
      </FormControl>

      {/* Regime di lavoro */}
      <FormControl fullWidth>
        <InputLabel>Regime di lavoro</InputLabel>
        <Select
          value={employeeData.contract_work_regime_id || ""}
          label="Regime di lavoro"
          onChange={(e) =>
            setEmployeeData({
              ...employeeData,
              contract_work_regime_id: Number(e.target.value),
            })
          }
        >
          <MenuItem value={1}>Full-time</MenuItem>
          <MenuItem value={2}>Part-time</MenuItem>
        </Select>
      </FormControl>

      {/* Ore settimanali */}
      <TextField
        label="Ore settimanali"
        type="number"
        value={employeeData.contract_weekly_hours || ""}
        onChange={(e) =>
          setEmployeeData({
            ...employeeData,
            contract_weekly_hours: Number(e.target.value),
          })
        }
        fullWidth
      />

      {/* FTE */}
      <TextField
        label="FTE"
        type="number"
        value={employeeData.contract_fte || ""}
        onChange={(e) =>
          setEmployeeData({
            ...employeeData,
            contract_fte: Number(e.target.value),
          })
        }
        fullWidth
      />

      {/* Fascia oraria */}
      <TextField
        label="Fascia oraria"
        value={employeeData.contract_time_band || ""}
        onChange={(e) =>
          setEmployeeData({
            ...employeeData,
            contract_time_band: e.target.value,
          })
        }
        fullWidth
      />

      {/* Turno */}
      <FormControl fullWidth>
        <InputLabel>Turno</InputLabel>
        <Select
          value={employeeData.contract_shift_type || ""}
          label="Turno"
          onChange={(e) =>
            setEmployeeData({
              ...employeeData,
              contract_shift_type: e.target.value,
            })
          }
        >
          <MenuItem value="Giornaliero">Giornaliero</MenuItem>
          <MenuItem value="Notturno">Notturno</MenuItem>
          <MenuItem value="Turni">Turni</MenuItem>
        </Select>
      </FormControl>

      {/* Livello CCNL */}
      <TextField
        label="Livello CCNL"
        value={employeeData.contract_level || ""}
        onChange={(e) =>
          setEmployeeData({
            ...employeeData,
            contract_level: e.target.value,
          })
        }
        fullWidth
      />

      {/* Data inizio */}
      <TextField
        label="Data inizio contratto"
        type="date"
        value={
          employeeData.contract_start_date
            ? employeeData.contract_start_date.substring(0, 10)
            : ""
        }
        onChange={(e) =>
          setEmployeeData({
            ...employeeData,
            contract_start_date: e.target.value,
          })
        }
        fullWidth
        InputLabelProps={{ shrink: true }}
      />

      {/* Data fine */}
      <TextField
        label="Data fine contratto"
        type="date"
        value={
          employeeData.contract_end_date
            ? employeeData.contract_end_date.substring(0, 10)
            : ""
        }
        onChange={(e) =>
          setEmployeeData({
            ...employeeData,
            contract_end_date: e.target.value,
          })
        }
        fullWidth
        InputLabelProps={{ shrink: true }}
      />

      {/* Note contratto */}
      <TextField
        label="Note contratto"
        value={employeeData.contract_notes || ""}
        onChange={(e) =>
          setEmployeeData({
            ...employeeData,
            contract_notes: e.target.value,
          })
        }
        fullWidth
        multiline
        minRows={3}
      />
    </Box>

    {/* Pulsanti */}
    <Box
      sx={{
        mt: 3,
        display: "flex",
        justifyContent: "flex-end",
        gap: 2,
      }}
    >
      <Button variant="outlined" onClick={onClose}>
        Annulla
      </Button>

      <Button
        variant="contained"
        onClick={() => {
          api
            .post(`/employees/${employeeId}/contracts`, {
              nature_id: employeeData.contract_nature_id,
              work_regime_id: employeeData.contract_work_regime_id,
              weekly_hours: employeeData.contract_weekly_hours,
              fte: employeeData.contract_fte,
              time_band: employeeData.contract_time_band,
              shift_type: employeeData.contract_shift_type,
              level: employeeData.contract_level,
              start_date: employeeData.contract_start_date,
              end_date: employeeData.contract_end_date,
              notes: employeeData.contract_notes,
            })
            .then(() => {
              alert("Contratto aggiornato con successo");
            })
            .catch((err) => {
              console.error(err);
              alert("Errore aggiornamento contratto");
            });
        }}
      >
        Salva Contratto
      </Button>
    </Box>
  </Box>
)}
{/* ============================
    BLOCCO 4 — FORM COST CENTER
   ============================ */}

{activeSection === "costCenter" && employeeData && (
  <Box sx={{ maxWidth: 800 }}>
    <Typography variant="h6" gutterBottom>
      Cost Center
    </Typography>

    {/* Stato locale dei cost center */}
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Button
        variant="outlined"
        onClick={() => {
          const newList = employeeData.cost_centers
            ? [...employeeData.cost_centers]
            : [];

          newList.push({
            cost_center_id: null,
            weight_percent: "",
            from_date: "",
            note: "",
          });

          setEmployeeData({ ...employeeData, cost_centers: newList });
        }}
      >
        Aggiungi cost center
      </Button>

      {(employeeData.cost_centers || []).map((cc: any, index: number) => (
        <Box
          key={index}
          sx={{
            border: "1px solid #ddd",
            borderRadius: 2,
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {/* Cost Center ID */}
          <FormControl fullWidth>
            <InputLabel>Cost Center</InputLabel>
            <Select
              value={cc.cost_center_id || ""}
              label="Cost Center"
              onChange={(e) => {
                const updated = [...employeeData.cost_centers];
                updated[index].cost_center_id = Number(e.target.value);
                setEmployeeData({ ...employeeData, cost_centers: updated });
              }}
            >
              <MenuItem value={1}>Magazzino</MenuItem>
              <MenuItem value={2}>Amministrazione</MenuItem>
              <MenuItem value={3}>Trasporti</MenuItem>
              <MenuItem value={4}>IT</MenuItem>
            </Select>
          </FormControl>

          {/* Peso percentuale */}
          <TextField
            label="% peso"
            type="number"
            value={cc.weight_percent || ""}
            onChange={(e) => {
              const updated = [...employeeData.cost_centers];
              updated[index].weight_percent = Number(e.target.value);
              setEmployeeData({ ...employeeData, cost_centers: updated });
            }}
            fullWidth
          />

          {/* Data inizio */}
          <TextField
            label="Dal"
            type="date"
            value={cc.from_date ? cc.from_date.substring(0, 10) : ""}
            onChange={(e) => {
              const updated = [...employeeData.cost_centers];
              updated[index].from_date = e.target.value;
              setEmployeeData({ ...employeeData, cost_centers: updated });
            }}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          {/* Note */}
          <TextField
            label="Note"
            value={cc.note || ""}
            onChange={(e) => {
              const updated = [...employeeData.cost_centers];
              updated[index].note = e.target.value;
              setEmployeeData({ ...employeeData, cost_centers: updated });
            }}
            fullWidth
          />

          {/* Rimuovi */}
          <Button
            variant="outlined"
            color="error"
            onClick={() => {
              const updated = [...employeeData.cost_centers];
              updated.splice(index, 1);
              setEmployeeData({ ...employeeData, cost_centers: updated });
            }}
          >
            Rimuovi
          </Button>
        </Box>
      ))}
    </Box>

    {/* Pulsanti */}
    <Box
      sx={{
        mt: 3,
        display: "flex",
        justifyContent: "flex-end",
        gap: 2,
      }}
    >
      <Button variant="outlined" onClick={onClose}>
        Annulla
      </Button>

      <Button
        variant="contained"
        onClick={() => {
          api
            .post(`/employees/${employeeId}/cost-centers`, {
              cost_centers: employeeData.cost_centers,
            })
            .then(() => {
              alert("Cost Center aggiornati con successo");
            })
            .catch((err) => {
              console.error(err);
              alert("Errore aggiornamento cost center");
            });
        }}
      >
        Salva Cost Center
      </Button>
    </Box>
  </Box>
)}
{/* ============================
    BLOCCO 5 — FORM REPARTO
   ============================ */}

{activeSection === "reparto" && employeeData && (
  <Box sx={{ maxWidth: 600 }}>
    <Typography variant="h6" gutterBottom>
      Reparto
    </Typography>

    {/* Stato locale reparto */}
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Reparto */}
      <FormControl fullWidth>
        <InputLabel>Reparto</InputLabel>
        <Select
          value={employeeData.department_id || ""}
          label="Reparto"
          onChange={(e) =>
            setEmployeeData({
              ...employeeData,
              department_id: Number(e.target.value),
            })
          }
        >
          <MenuItem value={1}>Magazzino</MenuItem>
          <MenuItem value={2}>Amministrazione</MenuItem>
          <MenuItem value={3}>Trasporti</MenuItem>
          <MenuItem value={4}>IT</MenuItem>
          <MenuItem value={5}>HR</MenuItem>
        </Select>
      </FormControl>

      {/* Manager */}
      <FormControl fullWidth>
        <InputLabel>Manager</InputLabel>
        <Select
          value={employeeData.manager_id || ""}
          label="Manager"
          onChange={(e) =>
            setEmployeeData({
              ...employeeData,
              manager_id: Number(e.target.value),
            })
          }
        >
          <MenuItem value={101}>Mario Rossi</MenuItem>
          <MenuItem value={102}>Luca Bianchi</MenuItem>
          <MenuItem value={103}>Giulia Verdi</MenuItem>
          <MenuItem value={104}>Sara Neri</MenuItem>
        </Select>
      </FormControl>

      {/* Data assegnazione */}
      <TextField
        label="Data assegnazione"
        type="date"
        value={
          employeeData.department_from_date
            ? employeeData.department_from_date.substring(0, 10)
            : ""
        }
        onChange={(e) =>
          setEmployeeData({
            ...employeeData,
            department_from_date: e.target.value,
          })
        }
        fullWidth
        InputLabelProps={{ shrink: true }}
      />

      {/* Note */}
      <TextField
        label="Note"
        value={employeeData.department_note || ""}
        onChange={(e) =>
          setEmployeeData({
            ...employeeData,
            department_note: e.target.value,
          })
        }
        fullWidth
        multiline
        minRows={3}
      />
    </Box>

    {/* Pulsanti */}
    <Box
      sx={{
        mt: 3,
        display: "flex",
        justifyContent: "flex-end",
        gap: 2,
      }}
    >
      <Button variant="outlined" onClick={onClose}>
        Annulla
      </Button>

      <Button
        variant="contained"
        onClick={() => {
          api
            .post(`/employees/${employeeId}/departments`, {
              department_id: employeeData.department_id,
              manager_id: employeeData.manager_id,
              from_date: employeeData.department_from_date,
              note: employeeData.department_note,
            })
            .then(() => {
              alert("Reparto aggiornato con successo");
            })
            .catch((err) => {
              console.error(err);
              alert("Errore aggiornamento reparto");
            });
        }}
      >
        Salva Reparto
      </Button>
    </Box>
  </Box>
)}
{/* ============================
    BLOCCO 6 — FORM RAL / BENEFIT / AUTO
   ============================ */}

{activeSection === "ralBenefitAuto" && employeeData && (
  <Box sx={{ maxWidth: 900 }}>
    <Typography variant="h6" gutterBottom>
      RAL / Benefit / Auto Aziendale
    </Typography>

    {/* ============================
        RAL
       ============================ */}
    <Box sx={{ mt: 3 }}>
      <Typography variant="subtitle1" gutterBottom>
        RAL
      </Typography>

      <TextField
        label="RAL (€)"
        type="number"
        value={employeeData.salary?.ral_amount || ""}
        onChange={(e) =>
          setEmployeeData({
            ...employeeData,
            salary: {
              ...employeeData.salary,
              ral_amount: Number(e.target.value),
            },
          })
        }
        fullWidth
      />

      <TextField
        label="Note RAL"
        value={employeeData.salary?.note || ""}
        onChange={(e) =>
          setEmployeeData({
            ...employeeData,
            salary: {
              ...employeeData.salary,
              note: e.target.value,
            },
          })
        }
        fullWidth
        multiline
        minRows={2}
        sx={{ mt: 2 }}
      />

      <TextField
        label="Data validità"
        type="date"
        value={
          employeeData.salary?.from_date
            ? employeeData.salary.from_date.substring(0, 10)
            : ""
        }
        onChange={(e) =>
          setEmployeeData({
            ...employeeData,
            salary: {
              ...employeeData.salary,
              from_date: e.target.value,
            },
          })
        }
        fullWidth
        InputLabelProps={{ shrink: true }}
        sx={{ mt: 2 }}
      />

      <Button
        variant="contained"
        sx={{ mt: 2 }}
        onClick={() => {
          api
            .post(`/employees/${employeeId}/salaries`, {
              ral_amount: employeeData.salary?.ral_amount,
              note: employeeData.salary?.note,
              from_date: employeeData.salary?.from_date,
            })
            .then(() => alert("RAL aggiornata con successo"))
            .catch(() => alert("Errore aggiornamento RAL"));
        }}
      >
        Salva RAL
      </Button>
    </Box>

    {/* ============================
        BENEFIT
       ============================ */}
    <Box sx={{ mt: 5 }}>
      <Typography variant="subtitle1" gutterBottom>
        Benefit
      </Typography>

      <Button
        variant="outlined"
        onClick={() => {
          const newList = employeeData.benefits
            ? [...employeeData.benefits]
            : [];

          newList.push({
            benefit_type: "",
            has_benefit: false,
            from_date: "",
            note: "",
          });

          setEmployeeData({ ...employeeData, benefits: newList });
        }}
      >
        Aggiungi benefit
      </Button>

      {(employeeData.benefits || []).map((b: any, index: number) => (
        <Box
          key={index}
          sx={{
            border: "1px solid #ddd",
            borderRadius: 2,
            p: 2,
            mt: 2,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <FormControl fullWidth>
            <InputLabel>Tipo benefit</InputLabel>
            <Select
              value={b.benefit_type || ""}
              label="Tipo benefit"
              onChange={(e) => {
                const updated = [...employeeData.benefits];
                updated[index].benefit_type = e.target.value;
                setEmployeeData({ ...employeeData, benefits: updated });
              }}
            >
              <MenuItem value="PHONE">Telefono</MenuItem>
              <MenuItem value="PC">PC aziendale</MenuItem>
              <MenuItem value="MEAL">Buoni pasto</MenuItem>
              <MenuItem value="OTHER">Altro</MenuItem>
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Checkbox
                checked={b.has_benefit || false}
                onChange={(e) => {
                  const updated = [...employeeData.benefits];
                  updated[index].has_benefit = e.target.checked;
                  setEmployeeData({ ...employeeData, benefits: updated });
                }}
              />
            }
            label="Attivo"
          />

          <TextField
            label="Dal"
            type="date"
            value={b.from_date ? b.from_date.substring(0, 10) : ""}
            onChange={(e) => {
              const updated = [...employeeData.benefits];
              updated[index].from_date = e.target.value;
              setEmployeeData({ ...employeeData, benefits: updated });
            }}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Note"
            value={b.note || ""}
            onChange={(e) => {
              const updated = [...employeeData.benefits];
              updated[index].note = e.target.value;
              setEmployeeData({ ...employeeData, benefits: updated });
            }}
            fullWidth
          />

          <Button
            variant="outlined"
            color="error"
            onClick={() => {
              const updated = [...employeeData.benefits];
              updated.splice(index, 1);
              setEmployeeData({ ...employeeData, benefits: updated });
            }}
          >
            Rimuovi
          </Button>
        </Box>
      ))}

      <Button
        variant="contained"
        sx={{ mt: 2 }}
        onClick={() => {
          api
            .post(`/employees/${employeeId}/benefits`, {
              benefits: employeeData.benefits,
            })
            .then(() => alert("Benefit aggiornati con successo"))
            .catch(() => alert("Errore aggiornamento benefit"));
        }}
      >
        Salva Benefit
      </Button>
    </Box>

    {/* ============================
        AUTO AZIENDALE
       ============================ */}
    <Box sx={{ mt: 5 }}>
      <Typography variant="subtitle1" gutterBottom>
        Auto Aziendale
      </Typography>

      <TextField
        label="Modello auto"
        value={employeeData.company_car?.car_model || ""}
        onChange={(e) =>
          setEmployeeData({
            ...employeeData,
            company_car: {
              ...employeeData.company_car,
              car_model: e.target.value,
            },
          })
        }
        fullWidth
      />

      <TextField
        label="Targa"
        value={employeeData.company_car?.plate || ""}
        onChange={(e) =>
          setEmployeeData({
            ...employeeData,
            company_car: {
              ...employeeData.company_car,
              plate: e.target.value,
            },
          })
        }
        fullWidth
        sx={{ mt: 2 }}
      />

      <TextField
        label="Dal"
        type="date"
        value={
          employeeData.company_car?.from_date
            ? employeeData.company_car.from_date.substring(0, 10)
            : ""
        }
        onChange={(e) =>
          setEmployeeData({
            ...employeeData,
            company_car: {
              ...employeeData.company_car,
              from_date: e.target.value,
            },
          })
        }
        fullWidth
        InputLabelProps={{ shrink: true }}
        sx={{ mt: 2 }}
      />

      <TextField
        label="Note auto"
        value={employeeData.company_car?.note || ""}
        onChange={(e) =>
          setEmployeeData({
            ...employeeData,
            company_car: {
              ...employeeData.company_car,
              note: e.target.value,
            },
          })
        }
        fullWidth
        multiline
        minRows={2}
        sx={{ mt: 2 }}
      />

      <Button
        variant="contained"
        sx={{ mt: 2 }}
        onClick={() => {
          api
            .post(`/employees/${employeeId}/company-cars`, {
              car_model: employeeData.company_car?.car_model,
              plate: employeeData.company_car?.plate,
              from_date: employeeData.company_car?.from_date,
              note: employeeData.company_car?.note,
            })
            .then(() => alert("Auto aziendale aggiornata con successo"))
            .catch(() => alert("Errore aggiornamento auto aziendale"));
        }}
      >
        Salva Auto Aziendale
      </Button>
    </Box>
  </Box>
)}
{/* ============================
    BLOCCO 7 — FORM ENAC
   ============================ */}

{activeSection === "enac" && employeeData && (
  <Box sx={{ maxWidth: 900 }}>
    <Typography variant="h6" gutterBottom>
      ENAC — Corsi & Approvazioni
    </Typography>

    {/* ============================
        CORSI ENAC
       ============================ */}
    <Box sx={{ mt: 3 }}>
      <Typography variant="subtitle1" gutterBottom>
        Corsi ENAC
      </Typography>

      <Button
        variant="outlined"
        onClick={() => {
          const newList = employeeData.enac_courses
            ? [...employeeData.enac_courses]
            : [];

          newList.push({
            course_name: "",
            from_date: "",
            note: "",
          });

          setEmployeeData({ ...employeeData, enac_courses: newList });
        }}
      >
        Aggiungi corso ENAC
      </Button>

      {(employeeData.enac_courses || []).map((course: any, index: number) => (
        <Box
          key={index}
          sx={{
            border: "1px solid #ddd",
            borderRadius: 2,
            p: 2,
            mt: 2,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <TextField
            label="Nome corso"
            value={course.course_name || ""}
            onChange={(e) => {
              const updated = [...employeeData.enac_courses];
              updated[index].course_name = e.target.value;
              setEmployeeData({ ...employeeData, enac_courses: updated });
            }}
            fullWidth
          />

          <TextField
            label="Dal"
            type="date"
            value={course.from_date ? course.from_date.substring(0, 10) : ""}
            onChange={(e) => {
              const updated = [...employeeData.enac_courses];
              updated[index].from_date = e.target.value;
              setEmployeeData({ ...employeeData, enac_courses: updated });
            }}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Note"
            value={course.note || ""}
            onChange={(e) => {
              const updated = [...employeeData.enac_courses];
              updated[index].note = e.target.value;
              setEmployeeData({ ...employeeData, enac_courses: updated });
            }}
            fullWidth
          />

          <Button
            variant="outlined"
            color="error"
            onClick={() => {
              const updated = [...employeeData.enac_courses];
              updated.splice(index, 1);
              setEmployeeData({ ...employeeData, enac_courses: updated });
            }}
          >
            Rimuovi
          </Button>
        </Box>
      ))}

      <Button
        variant="contained"
        sx={{ mt: 2 }}
        onClick={() => {
          api
            .post(`/employees/${employeeId}/enac-courses`, {
              courses: employeeData.enac_courses,
            })
            .then(() => alert("Corsi ENAC aggiornati con successo"))
            .catch(() => alert("Errore aggiornamento corsi ENAC"));
        }}
      >
        Salva Corsi ENAC
      </Button>
    </Box>

    {/* ============================
        APPROVAZIONI ENAC
       ============================ */}
    <Box sx={{ mt: 5 }}>
      <Typography variant="subtitle1" gutterBottom>
        Approvazioni ENAC
      </Typography>

      <Button
        variant="outlined"
        onClick={() => {
          const newList = employeeData.enac_approvals
            ? [...employeeData.enac_approvals]
            : [];

          newList.push({
            approval_name: "",
            from_date: "",
            note: "",
          });

          setEmployeeData({ ...employeeData, enac_approvals: newList });
        }}
      >
        Aggiungi approvazione ENAC
      </Button>

      {(employeeData.enac_approvals || []).map(
        (approval: any, index: number) => (
          <Box
            key={index}
            sx={{
              border: "1px solid #ddd",
              borderRadius: 2,
              p: 2,
              mt: 2,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <TextField
              label="Nome approvazione"
              value={approval.approval_name || ""}
              onChange={(e) => {
                const updated = [...employeeData.enac_approvals];
                updated[index].approval_name = e.target.value;
                setEmployeeData({ ...employeeData, enac_approvals: updated });
              }}
              fullWidth
            />

            <TextField
              label="Dal"
              type="date"
              value={
                approval.from_date ? approval.from_date.substring(0, 10) : ""
              }
              onChange={(e) => {
                const updated = [...employeeData.enac_approvals];
                updated[index].from_date = e.target.value;
                setEmployeeData({ ...employeeData, enac_approvals: updated });
              }}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Note"
              value={approval.note || ""}
              onChange={(e) => {
                const updated = [...employeeData.enac_approvals];
                updated[index].note = e.target.value;
                setEmployeeData({ ...employeeData, enac_approvals: updated });
              }}
              fullWidth
            />

            <Button
              variant="outlined"
              color="error"
              onClick={() => {
                const updated = [...employeeData.enac_approvals];
                updated.splice(index, 1);
                setEmployeeData({ ...employeeData, enac_approvals: updated });
              }}
            >
              Rimuovi
            </Button>
          </Box>
        )
      )}

      <Button
        variant="contained"
        sx={{ mt: 2 }}
        onClick={() => {
          api
            .post(`/employees/${employeeId}/enac-approvals`, {
              approvals: employeeData.enac_approvals,
            })
            .then(() => alert("Approvazioni ENAC aggiornate con successo"))
            .catch(() => alert("Errore aggiornamento approvazioni ENAC"));
        }}
      >
        Salva Approvazioni ENAC
      </Button>
    </Box>
  </Box>
)}
{/* ============================
    BLOCCO 8 — FORM STATO LAVORATIVO
   ============================ */}

{activeSection === "status" && employeeData && (
  <Box sx={{ maxWidth: 600 }}>
    <Typography variant="h6" gutterBottom>
      Stato Lavorativo
    </Typography>

    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Stato */}
      <FormControl fullWidth>
        <InputLabel>Stato</InputLabel>
        <Select
          value={employeeData.employee_status?.status || ""}
          label="Stato"
          onChange={(e) =>
            setEmployeeData({
              ...employeeData,
              employee_status: {
                ...employeeData.employee_status,
                status: e.target.value,
              },
            })
          }
        >
          <MenuItem value="ACTIVE">Attivo</MenuItem>
          <MenuItem value="TERMINATED">Dimesso</MenuItem>
          <MenuItem value="SUSPENDED">Sospeso</MenuItem>
          <MenuItem value="LEAVE">In aspettativa</MenuItem>
        </Select>
      </FormControl>

      {/* Data stato */}
      <TextField
        label="Data stato"
        type="date"
        value={
          employeeData.employee_status?.from_date
            ? employeeData.employee_status.from_date.substring(0, 10)
            : ""
        }
        onChange={(e) =>
          setEmployeeData({
            ...employeeData,
            employee_status: {
              ...employeeData.employee_status,
              from_date: e.target.value,
            },
          })
        }
        fullWidth
        InputLabelProps={{ shrink: true }}
      />

      {/* Motivo */}
      <TextField
        label="Motivo"
        value={employeeData.employee_status?.reason || ""}
        onChange={(e) =>
          setEmployeeData({
            ...employeeData,
            employee_status: {
              ...employeeData.employee_status,
              reason: e.target.value,
            },
          })
        }
        fullWidth
      />

      {/* Note */}
      <TextField
        label="Note"
        value={employeeData.employee_status?.note || ""}
        onChange={(e) =>
          setEmployeeData({
            ...employeeData,
            employee_status: {
              ...employeeData.employee_status,
              note: e.target.value,
            },
          })
        }
        fullWidth
        multiline
        minRows={3}
      />
    </Box>

    {/* Pulsanti */}
    <Box
      sx={{
        mt: 3,
        display: "flex",
        justifyContent: "flex-end",
        gap: 2,
      }}
    >
      <Button variant="outlined" onClick={onClose}>
        Annulla
      </Button>

      <Button
        variant="contained"
        onClick={() => {
          api
            .post(`/employees/${employeeId}/status`, {
              status: employeeData.employee_status?.status,
              from_date: employeeData.employee_status?.from_date,
              reason: employeeData.employee_status?.reason,
              note: employeeData.employee_status?.note,
            })
            .then(() => {
              alert("Stato lavorativo aggiornato con successo");
            })
            .catch((err) => {
              console.error(err);
              alert("Errore aggiornamento stato lavorativo");
            });
        }}
      >
        Salva Stato Lavorativo
      </Button>
    </Box>
  </Box>
)}
{/* ============================
    BLOCCO 9 — FORM SITO
   ============================ */}

{activeSection === "sito" && employeeData && (
  <Box sx={{ maxWidth: 600 }}>
    <Typography variant="h6" gutterBottom>
      Sito di Assegnazione
    </Typography>

    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Sito */}
      <FormControl fullWidth>
        <InputLabel>Sito</InputLabel>
        <Select
          value={employeeData.employee_site?.site_id || ""}
          label="Sito"
          onChange={(e) =>
            setEmployeeData({
              ...employeeData,
              employee_site: {
                ...employeeData.employee_site,
                site_id: Number(e.target.value),
              },
            })
          }
        >
          <MenuItem value={1}>Trecate</MenuItem>
          <MenuItem value={2}>Cerano</MenuItem>
          <MenuItem value={3}>Sozzago</MenuItem>
          <MenuItem value={4}>Milano</MenuItem>
          <MenuItem value={5}>Torino</MenuItem>
        </Select>
      </FormControl>

      {/* Data assegnazione */}
      <TextField
        label="Data assegnazione"
        type="date"
        value={
          employeeData.employee_site?.from_date
            ? employeeData.employee_site.from_date.substring(0, 10)
            : ""
        }
        onChange={(e) =>
          setEmployeeData({
            ...employeeData,
            employee_site: {
              ...employeeData.employee_site,
              from_date: e.target.value,
            },
          })
        }
        fullWidth
        InputLabelProps={{ shrink: true }}
      />

      {/* Note */}
      <TextField
        label="Note"
        value={employeeData.employee_site?.note || ""}
        onChange={(e) =>
          setEmployeeData({
            ...employeeData,
            employee_site: {
              ...employeeData.employee_site,
              note: e.target.value,
            },
          })
        }
        fullWidth
        multiline
        minRows={3}
      />
    </Box>

    {/* Pulsanti */}
    <Box
      sx={{
        mt: 3,
        display: "flex",
        justifyContent: "flex-end",
        gap: 2,
      }}
    >
      <Button variant="outlined" onClick={onClose}>
        Annulla
      </Button>

      <Button
        variant="contained"
        onClick={() => {
          api
            .post(`/employees/${employeeId}/sites`, {
              site_id: employeeData.employee_site?.site_id,
              from_date: employeeData.employee_site?.from_date,
              note: employeeData.employee_site?.note,
            })
            .then(() => {
              alert("Sito aggiornato con successo");
            })
            .catch((err) => {
              console.error(err);
              alert("Errore aggiornamento sito");
            });
        }}
      >
        Salva Sito
      </Button>
    </Box>
  </Box>
)}
{/* ============================
    BLOCCO 10 — FOOTER
   ============================ */}

<Box
  sx={{
    mt: 4,
    display: "flex",
    justifyContent: "flex-end",
    gap: 2,
  }}
>
  <Button variant="outlined" onClick={onClose}>
    Chiudi
  </Button>
</Box>


              </>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
