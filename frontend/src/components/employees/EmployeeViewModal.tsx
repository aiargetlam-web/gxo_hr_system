import {
  Dialog,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  Tabs,
  Tab,
  Box,
  Stack,
  Card,
  Divider,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useState } from "react";
import { employeeService } from "../../services/employeeService";
import { EmployeeFull } from "../../types";

interface Props {
  open: boolean;
  onClose: () => void;
  employee: EmployeeFull | null;
}

export default function EmployeeDetailModal({ open, onClose, employee }: Props) {
  const [tab, setTab] = useState(0);

  // STORICI
  const [contracts, setContracts] = useState<any[]>([]);
  const [salaries, setSalaries] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [costCenters, setCostCenters] = useState<any[]>([]);
  const [cars, setCars] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [enacCourses, setEnacCourses] = useState<any[]>([]);
  const [enacApprovals, setEnacApprovals] = useState<any[]>([]);
  const [benefits, setBenefits] = useState<any[]>([]);


  // CARICA STORICI SOLO QUANDO SERVONO
  useEffect(() => {
    if (!employee) return;

    if (tab === 1) employeeService.getContracts(employee.id).then(setContracts);
    if (tab === 2) employeeService.getSalaries(employee.id).then(setSalaries);
    if (tab === 3) employeeService.getDepartments(employee.id).then(setDepartments);
    if (tab === 4) employeeService.getCostCenters(employee.id).then(setCostCenters);
    if (tab === 5) employeeService.getCompanyCars(employee.id).then(setCars);
    if (tab === 6) employeeService.getStatusHistory(employee.id).then(setStatuses);
    if (tab === 7) employeeService.getSites(employee.id).then(setSites);
    if (tab === 8) employeeService.getEnacCourses(employee.id).then(setEnacCourses);
    if (tab === 9) employeeService.getEnacApprovals(employee.id).then(setEnacApprovals);
    if (tab === 10) employeeService.getBenefits(employee.id).then(setBenefits);


  }, [tab, employee]);

  if (!employee) return null;
  
  const buildTimeline = () => {
  const events: any[] = [];

  // CONTRATTI
  contracts.forEach((c) =>
    events.push({
      date: c.from_date,
      title: "Contratto",
      description: `${c.work_regime} — ${c.contract_nature}`,
      icon: "📄",
      color: "#FF9800",
    })
  );

  // RAL
  salaries.forEach((s) =>
    events.push({
      date: s.from_date,
      title: "RAL",
      description: `${s.ral_amount} €`,
      icon: "💰",
      color: "#4CAF50",
    })
  );

  // REPARTI
  departments.forEach((d) =>
    events.push({
      date: d.from_date,
      title: "Reparto",
      description: `ID: ${d.department_id}`,
      icon: "🧩",
      color: "#795548",
    })
  );

  // COST CENTER
  costCenters.forEach((cc) =>
    events.push({
      date: cc.from_date,
      title: "Cost Center",
      description: `${cc.code} — ${cc.description} (${cc.weight_percent}%)`,
      icon: "🏷",
      color: "#FFC107",
    })
  );

  // AUTO
  cars.forEach((car) =>
    events.push({
      date: car.from_date,
      title: "Auto Aziendale",
      description: `${car.car_model} — ${car.plate}`,
      icon: "🚗",
      color: "#9C27B0",
    })
  );

  // STATUS
  statuses.forEach((st) =>
    events.push({
      date: st.from_date,
      title: "Stato Lavorativo",
      description: st.name,
      icon: "🔄",
      color: "#2196F3",
    })
  );

  // SITI
  sites.forEach((site) =>
    events.push({
      date: site.from_date,
      title: "Cambio Sito",
      description: `Sito ID: ${site.site_id}`,
      icon: "📍",
      color: "#F44336",
    })
  );

  // ENAC CORSI
  enacCourses.forEach((course) =>
    events.push({
      date: course.from_date,
      title: "Corso ENAC",
      description: course.course_name,
      icon: "🎓",
      color: "#FF5722",
    })
  );

  // ENAC APPROVAZIONI
  enacApprovals.forEach((appr) =>
    events.push({
      date: appr.from_date,
      title: "Approvazione ENAC",
      description: `ID: ${appr.approval_id}`,
      icon: "✔️",
      color: "#3F51B5",
    })
  );

  // BENEFIT
  benefits.forEach((b) =>
    events.push({
      date: b.from_date,
      title: "Benefit",
      description: `${b.benefit_type_id} — ${b.has_benefit ? "Attivo" : "Non attivo"}`,
      icon: "🎁",
      color: "#009688",
    })
  );

  // Ordina per data
  return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

  return (
    <Dialog fullScreen open={open} onClose={onClose}>
      {/* HEADER */}
      <AppBar sx={{ position: "relative" }}>
        <Toolbar>
          <Avatar sx={{ mr: 2, bgcolor: "primary.main" }}>
            {employee.first_name[0]}
            {employee.last_name[0]}
          </Avatar>

          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6">
              {employee.first_name} {employee.last_name}
            </Typography>
            <Typography variant="body2">{employee.email}</Typography>
          </Box>

          <IconButton edge="end" color="inherit" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* TABS */}
      <Tabs
        value={tab}
        onChange={(e, v) => setTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: "1px solid #ddd" }}
      >
        <Tab label="Dati Attuali" />
        <Tab label="Storico Contratti" />
        <Tab label="Storico RAL" />
        <Tab label="Storico Reparti" />
        <Tab label="Storico Cost Center" />
        <Tab label="Storico Auto" />
        <Tab label="Storico Status" />
        <Tab label="Storico Siti" />
        <Tab label="Storico ENAC" />
        <Tab label="Storico Benefit" />
        <Tab label="Timeline" />
      </Tabs>

      {/* CONTENUTO */}
      <Box p={3}>
        {/* TAB 0 — DATI ATTUALI */}
        {tab === 0 && (
          <Stack spacing={3}>
            {/* ANAGRAFICA */}
            <Card sx={{ p: 3 }}>
              <Typography variant="h6">Anagrafica</Typography>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={1}>
                <Typography><strong>Nome:</strong> {employee.first_name}</Typography>
                <Typography><strong>Cognome:</strong> {employee.last_name}</Typography>
                <Typography><strong>Email:</strong> {employee.email}</Typography>
                <Typography><strong>Telefono:</strong> {employee.phone ?? "-"}</Typography>
                <Typography><strong>Codice Fiscale:</strong> {employee.fiscal_code ?? "-"}</Typography>
                <Typography><strong>ID LUL:</strong> {employee.id_lul ?? "-"}</Typography>
              </Stack>
            </Card>

            {/* CONTRATTO */}
            <Card sx={{ p: 3 }}>
              <Typography variant="h6">Contratto Attuale</Typography>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={1}>
                <Typography><strong>Regime:</strong> {employee.contract?.work_regime ?? "-"}</Typography>
                <Typography><strong>Natura:</strong> {employee.contract?.contract_nature ?? "-"}</Typography>
                <Typography><strong>Ore settimanali:</strong> {employee.contract?.weekly_hours ?? "-"}</Typography>
                <Typography><strong>FTE:</strong> {employee.contract?.fte ?? "-"}</Typography>
                <Typography><strong>Fascia oraria:</strong> {employee.contract?.time_band ?? "-"}</Typography>
                <Typography><strong>Turno:</strong> {employee.contract?.shift_type_name ?? "-"}</Typography>
              </Stack>
            </Card>

            {/* RAL */}
            <Card sx={{ p: 3 }}>
              <Typography variant="h6">RAL Attuale</Typography>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={1}>
                <Typography><strong>RAL:</strong> {employee.salary?.ral_amount ?? "-"}</Typography>
                <Typography><strong>Note:</strong> {employee.salary?.note ?? "-"}</Typography>
              </Stack>
            </Card>

            {/* ORGANIZZAZIONE */}
            <Card sx={{ p: 3 }}>
              <Typography variant="h6">Organizzazione</Typography>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={1}>
                <Typography><strong>Reparto:</strong> {employee.department?.name ?? "-"}</Typography>
                <Typography><strong>Sito:</strong> {employee.site?.name ?? "-"}</Typography>
                <Typography><strong>Manager:</strong> {employee.manager?.name ?? "-"}</Typography>
                <Typography><strong>Status:</strong> {employee.status?.name ?? "-"}</Typography>
              </Stack>
            </Card>

            {/* COST CENTER */}
            <Card sx={{ p: 3 }}>
              <Typography variant="h6">Cost Center Attuali</Typography>
              <Divider sx={{ my: 2 }} />
              {employee.cost_centers.length ? (
                employee.cost_centers.map((cc, i) => (
                  <Typography key={i}>
                    {cc.code} — {cc.description} ({cc.weight_percent}%)
                  </Typography>
                ))
              ) : (
                <Typography>Nessun cost center attivo.</Typography>
              )}
            </Card>

            {/* AUTO */}
            <Card sx={{ p: 3 }}>
              <Typography variant="h6">Auto Aziendale</Typography>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={1}>
                <Typography><strong>Modello:</strong> {employee.company_car?.car_model ?? "-"}</Typography>
                <Typography><strong>Targa:</strong> {employee.company_car?.plate ?? "-"}</Typography>
                <Typography><strong>Note:</strong> {employee.company_car?.note ?? "-"}</Typography>
              </Stack>
            </Card>
          </Stack>
        )}

        {/* TAB 1 — CONTRATTI */}
        {tab === 1 && (
          <Card sx={{ p: 3 }}>
            <Typography variant="h6">Storico Contratti</Typography>
            <Divider sx={{ my: 2 }} />
            {contracts.map((c, i) => (
              <Typography key={i}>
                {c.work_regime} — {c.from_date} → {c.to_date ?? "Attuale"}
              </Typography>
            ))}
          </Card>
        )}

        {/* TAB 2 — RAL */}
        {tab === 2 && (
          <Card sx={{ p: 3 }}>
            <Typography variant="h6">Storico RAL</Typography>
            <Divider sx={{ my: 2 }} />
            {salaries.map((s, i) => (
              <Typography key={i}>
                {s.ral_amount} € — {s.from_date}
              </Typography>
            ))}
          </Card>
        )}

        {/* TAB 3 — REPARTI */}
        {tab === 3 && (
          <Card sx={{ p: 3 }}>
            <Typography variant="h6">Storico Reparti</Typography>
            <Divider sx={{ my: 2 }} />
            {departments.map((d, i) => (
              <Typography key={i}>
                {d.department_id} — {d.from_date}
              </Typography>
            ))}
          </Card>
        )}

        {/* TAB 4 — COST CENTER */}
        {tab === 4 && (
          <Card sx={{ p: 3 }}>
            <Typography variant="h6">Storico Cost Center</Typography>
            <Divider sx={{ my: 2 }} />
            {costCenters.map((cc, i) => (
              <Typography key={i}>
                {cc.code} — {cc.description} ({cc.weight_percent}%)
              </Typography>
            ))}
          </Card>
        )}

        {/* TAB 5 — AUTO */}
        {tab === 5 && (
          <Card sx={{ p: 3 }}>
            <Typography variant="h6">Storico Auto Aziendale</Typography>
            <Divider sx={{ my: 2 }} />
            {cars.map((car, i) => (
              <Typography key={i}>
                {car.car_model} — {car.from_date}
              </Typography>
            ))}
          </Card>
        )}

        {/* TAB 6 — STATUS */}
        {tab === 6 && (
          <Card sx={{ p: 3 }}>
            <Typography variant="h6">Storico Status</Typography>
            <Divider sx={{ my: 2 }} />
            {statuses.map((st, i) => (
              <Typography key={i}>
                {st.name} — {st.from_date}
              </Typography>
            ))}
          </Card>
        )}

        {tab === 7 && (
          <Card sx={{ p: 3 }}>
            <Typography variant="h6">Storico Siti</Typography>
            <Divider sx={{ my: 2 }} />
            {sites.map((s, i) => (
              <Typography key={i}>
                Sito ID {s.site_id} — {s.from_date}
              </Typography>
            ))}
          </Card>
        )}

        {tab === 8 && (
          <Card sx={{ p: 3 }}>
            <Typography variant="h6">Storico ENAC</Typography>
            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1">Corsi</Typography>
            {enacCourses.map((c, i) => (
              <Typography key={i}>
                {c.course_name} — {c.from_date}
              </Typography>
            ))}

           <Divider sx={{ my: 2 }} />

           <Typography variant="subtitle1">Approvazioni</Typography>
             {enacApprovals.map((a, i) => (
               <Typography key={i}>
                 ID {a.approval_id} — {a.from_date}
               </Typography>
             ))}
          </Card>
        )}

        {tab === 9 && (
          <Card sx={{ p: 3 }}>
            <Typography variant="h6">Storico Benefit</Typography>
            <Divider sx={{ my: 2 }} />
            {benefits.map((b, i) => (
              <Typography key={i}>
                {b.benefit_type_id} — {b.has_benefit ? "Attivo" : "Non attivo"} — {b.from_date}
              </Typography>
            ))}
          </Card>
        )}

        {tab === 10 && (
          <Box>
            {buildTimeline().map((event, index) => (
              <TimelineCard key={index} event={event} index={index} />
            ))}
          </Box>
        )}

        
      </Box>
    </Dialog>
  );
}

const TimelineCard = ({ event, index }: any) => {
  const isLeft = index % 2 === 0;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: isLeft ? "flex-start" : "flex-end",
        position: "relative",
        mb: 4,
      }}
    >
      {/* Linea centrale */}
      <Box
        sx={{
          position: "absolute",
          left: "50%",
          top: 0,
          bottom: 0,
          width: "2px",
          bgcolor: "#ddd",
          transform: "translateX(-50%)",
        }}
      />

      {/* Punto sulla linea */}
      <Box
        sx={{
          position: "absolute",
          left: "50%",
          top: "20px",
          width: "14px",
          height: "14px",
          bgcolor: event.color,
          borderRadius: "50%",
          transform: "translateX(-50%)",
          border: "2px solid white",
          zIndex: 2,
        }}
      />

      {/* Card */}
      <Card
        sx={{
          width: "45%",
          p: 2,
          boxShadow: 4,
          borderLeft: isLeft ? `6px solid ${event.color}` : "none",
          borderRight: !isLeft ? `6px solid ${event.color}` : "none",
          bgcolor: "#fafafa",
        }}
      >
        <Typography variant="caption" sx={{ color: "#666" }}>
          {event.date}
        </Typography>

        <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <span style={{ fontSize: "22px" }}>{event.icon}</span>
          {event.title}
        </Typography>

        <Typography variant="body2" sx={{ mt: 1 }}>
          {event.description}
        </Typography>
      </Card>
    </Box>
  );
};

