import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";


// ===============================
// PAGINA VARIAZIONI DIPENDENTE
// ===============================

export default function EmployeeVariationsPage({ employeeId }: { employeeId: number }) {
  // Sidebar sezioni
  const sections = [
    { id: "status", label: "Stato amministrativo" },
    { id: "salary", label: "RAL" },
    { id: "costCenters", label: "Centri di costo" },
    { id: "department", label: "Reparto" },
    { id: "site", label: "Sito" },
    { id: "benefits", label: "Benefit" },
    { id: "companyCar", label: "Auto aziendale" },
    { id: "enacCourses", label: "ENAC – Corsi" },
    { id: "enacApprovals", label: "ENAC – Approvazioni" },
    { id: "employer", label: "Employer" },
    { id: "union", label: "Sindacato" },
  ];

  const [selectedSection, setSelectedSection] = useState("status");
  const navigate = useNavigate();

  // ===============================
  // DATI ATTUALI (per chiusure)
  // ===============================

  const [currentStatus, setCurrentStatus] = useState<any | null>(null);
  const [currentSalary, setCurrentSalary] = useState<any | null>(null);
  const [currentCostCenters, setCurrentCostCenters] = useState<any[]>([]);
  const [currentDepartment, setCurrentDepartment] = useState<any | null>(null);
  const [currentSite, setCurrentSite] = useState<any | null>(null);
  const [currentBenefits, setCurrentBenefits] = useState<any[]>([]);
  const [currentCompanyCar, setCurrentCompanyCar] = useState<any | null>(null);
  const [currentEmployer, setCurrentEmployer] = useState<any | null>(null);
  const [currentUnion, setCurrentUnion] = useState<any | null>(null);
  const [currentEnacCourses, setCurrentEnacCourses] = useState<any[]>([]);
  const [currentEnacApprovals, setCurrentEnacApprovals] = useState<any[]>([]);

  // ===============================
  // FORM NUOVE VARIAZIONI
  // ===============================

  const [newStatus, setNewStatus] = useState({ status_type_id: "", from_date: "", note: "" });
  const [newSalary, setNewSalary] = useState({ amount: "", from_date: "", note: "" });

  const [closingCostCenters, setClosingCostCenters] = useState<any>({});
  const [newCostCenter, setNewCostCenter] = useState({
    cost_center_id: "",
    percentage: "",
    from_date: "",
    note: "",
  });

  const [newDepartment, setNewDepartment] = useState({
    department_id: "",
    manager_id: "",
    from_date: "",
    note: "",
  });

  const [newSite, setNewSite] = useState({ site_id: "", from_date: "", note: "" });

  const [newBenefit, setNewBenefit] = useState({
    benefit_type_id: "",
    from_date: "",
    note: "",
  });

  const [newCompanyCar, setNewCompanyCar] = useState({
    model: "",
    plate: "",
    from_date: "",
    note: "",
  });

  const [newEnacCourse, setNewEnacCourse] = useState({
    course_id: "",
    from_date: "",
    note: "",
  });

  const [newEnacApproval, setNewEnacApproval] = useState({
    approval_type_id: "",
    from_date: "",
    note: "",
  });

  const [newEmployer, setNewEmployer] = useState({
    employer_id: "",
    from_date: "",
    note: "",
  });

  const [newUnion, setNewUnion] = useState({
    union_id: "",
    from_date: "",
    note: "",
  });

  // ===============================
  // CARICAMENTO DATI ATTUALI
  // ===============================

  useEffect(() => {
    loadCurrentData();
  }, [employeeId]);

  const loadCurrentData = async () => {
    const res = await api.get(`/api/v1/employees/${employeeId}/table-view`);
    const data = res.data;

    setCurrentStatus(data.status_current);
    setCurrentSalary(data.salary_current);
    setCurrentCostCenters(data.cost_centers_current || []);
    setCurrentDepartment(data.department_current);
    setCurrentSite(data.site_current);
    setCurrentBenefits(data.benefits_current || []);
    setCurrentCompanyCar(data.company_car_current);
    setCurrentEmployer(data.employer_current);
    setCurrentUnion(data.union_current);
    setCurrentEnacCourses(data.enac_courses_current || []);
    setCurrentEnacApprovals(data.enac_approvals_current || []);
  };

  // ===============================
  // OPTIONS PER I MENU A TENDINA
  // ===============================

  const [statusTypes, setStatusTypes] = useState<any[]>([]);
  const [costCenterList, setCostCenterList] = useState<any[]>([]);
  const [departmentList, setDepartmentList] = useState<any[]>([]);
  const [managerList, setManagerList] = useState<any[]>([]);
  const [siteList, setSiteList] = useState<any[]>([]);
  const [benefitTypes, setBenefitTypes] = useState<any[]>([]);
  const [enacCoursesList, setEnacCoursesList] = useState<any[]>([]);
  const [enacApprovalsList, setEnacApprovalsList] = useState<any[]>([]);
  const [employerList, setEmployerList] = useState<any[]>([]);
  const [unionList, setUnionList] = useState<any[]>([]);

  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    try {
      const [
        statusRes,
        costCenterRes,
        departmentRes,
        managerRes,
        siteRes,
        benefitRes,
        enacCourseRes,
        enacApprovalRes,
        employerRes,
        unionRes,
      ] = await Promise.all([
        api.get("/api/v1/status-types"),
        api.get("/api/v1/cost-centers"),
        api.get("/api/v1/departments"),
        api.get("/api/v1/managers"),
        api.get("/api/v1/sites"),
        api.get("/api/v1/benefit-types"),
        api.get("/api/v1/enac-courses"),
        api.get("/api/v1/enac-approvals"),
        api.get("/api/v1/employers"),
        api.get("/api/v1/unions"),
      ]);

      setStatusTypes(statusRes.data);
      setCostCenterList(costCenterRes.data);
      setDepartmentList(departmentRes.data);
      setManagerList(managerRes.data);
      setSiteList(siteRes.data);
      setBenefitTypes(benefitRes.data);
      setEnacCoursesList(enacCourseRes.data);
      setEnacApprovalsList(enacApprovalRes.data);
      setEmployerList(employerRes.data);
      setUnionList(unionRes.data);
    } catch (err) {
      console.error("Errore nel caricamento delle options:", err);
    }
  };


  // ===============================
// LAYOUT GENERALE
// ===============================

return (
  <>
    <Box mb={2}>
      <Button
        variant="outlined"
        color="primary"
        onClick={() => navigate("/employees")}
      >
        Torna alla lista dipendenti
      </Button>
    </Box>

    <Box display="flex" height="100%">
      {/* SIDEBAR */}
      <Box width="260px" bgcolor="#f5f5f5" borderRight="1px solid #ddd" p={2}>
        <Typography variant="h6" mb={2}>Variazioni</Typography>

        {sections.map((s) => (
          <Button
            key={s.id}
            fullWidth
            variant={selectedSection === s.id ? "contained" : "text"}
            onClick={() => setSelectedSection(s.id)}
            sx={{ justifyContent: "flex-start", mb: 1 }}
          >
            {s.label}
          </Button>
        ))}
      </Box>

      {/* CONTENUTO */}
      <Box flex={1} p={3} overflow="auto">
        {/* Qui inseriremo tutte le sezioni nei blocchi successivi */}
      </Box>
    </Box>
  </>
);

{/* ===============================
    SEZIONE: STATO AMMINISTRATIVO
   =============================== */}
{selectedSection === "status" && (
  <Box>
    <Typography variant="h5" mb={2}>Variazione Stato Amministrativo</Typography>

    {/* RIGA ATTUALE (solo chiusura) */}
    {currentStatus && (
      <Box mb={4} p={2} border="1px solid #ddd" borderRadius="8px">
        <Typography variant="subtitle1" mb={1}>Stato attuale</Typography>

        <Typography>Tipo stato: {currentStatus.status_type_description}</Typography>
        <Typography>Data inizio: {currentStatus.from_date}</Typography>
        <Typography>Note: {currentStatus.note}</Typography>

        <TextField
          fullWidth
          type="date"
          label="Data fine (chiusura)"
          sx={{ mt: 2 }}
          value={currentStatus.to_date || ""}
          onChange={(e) =>
            setCurrentStatus({
              ...currentStatus,
              to_date: e.target.value,
            })
          }
        />

        <Button
          variant="outlined"
          color="error"
          sx={{ mt: 2 }}
          onClick={async () => {
            if (!currentStatus.to_date) {
              alert("Inserisci una data di fine per chiudere lo stato attuale.");
              return;
            }

            try {
              await api.patch(
                `/api/v1/employees/${employeeId}/status/${currentStatus.id}`,
                { to_date: currentStatus.to_date }
              );
              alert("Stato attuale chiuso correttamente.");
              loadCurrentData();
            } catch (err) {
              console.error(err);
              alert("Errore durante la chiusura dello stato.");
            }
          }}
        >
          Chiudi stato attuale
        </Button>
      </Box>
    )}

    {/* NUOVA VARIAZIONE */}
    <Box p={2} border="1px solid #ddd" borderRadius="8px">
      <Typography variant="subtitle1" mb={2}>Nuovo stato amministrativo</Typography>

      {/* MENU A TENDINA POPOLATO DAL DB */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="status-type-label">Tipo stato</InputLabel>
        <Select
          labelId="status-type-label"
          value={newStatus.status_type_id}
          label="Tipo stato"
          onChange={(e) =>
            setNewStatus({ ...newStatus, status_type_id: e.target.value })
          }
        >
          {statusTypes.map((st) => (
            <MenuItem key={st.id} value={st.id}>
              {st.description}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        fullWidth
        type="date"
        label="Data inizio"
        sx={{ mb: 2 }}
        value={newStatus.from_date}
        onChange={(e) =>
          setNewStatus({ ...newStatus, from_date: e.target.value })
        }
      />

      <TextField
        fullWidth
        label="Note"
        multiline
        rows={3}
        sx={{ mb: 2 }}
        value={newStatus.note}
        onChange={(e) =>
          setNewStatus({ ...newStatus, note: e.target.value })
        }
      />

      <Button
        variant="contained"
        color="primary"
        onClick={async () => {
          if (!newStatus.status_type_id || !newStatus.from_date) {
            alert("Compila tutti i campi obbligatori.");
            return;
          }

          try {
            await api.post(`/api/v1/employees/${employeeId}/status`, newStatus);
            alert("Nuovo stato amministrativo aggiunto.");
            setNewStatus({ status_type_id: "", from_date: "", note: "" });
            loadCurrentData();
          } catch (err) {
            console.error(err);
            alert("Errore durante l'aggiunta dello stato.");
          }
        }}
      >
        Aggiungi nuovo stato
      </Button>
    </Box>
  </Box>
)}
{/* ===============================
    SEZIONE: RAL
   =============================== */}
{selectedSection === "salary" && (
  <Box>
    <Typography variant="h5" mb={2}>Variazione RAL</Typography>

    {currentSalary && (
      <Box mb={4} p={2} border="1px solid #ddd" borderRadius="8px">
        <Typography variant="subtitle1">RAL attuale</Typography>
        <Typography>Importo: {currentSalary.amount} €</Typography>
        <Typography>Data inizio: {currentSalary.from_date}</Typography>

        <TextField
          fullWidth
          type="date"
          label="Data fine (chiusura)"
          sx={{ mt: 2 }}
          value={currentSalary.to_date || ""}
          onChange={(e) =>
            setCurrentSalary({ ...currentSalary, to_date: e.target.value })
          }
        />

        <Button
          variant="outlined"
          color="error"
          sx={{ mt: 2 }}
          onClick={async () => {
            if (!currentSalary.to_date) {
              alert("Inserisci una data di fine.");
              return;
            }
            await api.patch(
              `/api/v1/employees/${employeeId}/salaries/${currentSalary.id}`,
              { to_date: currentSalary.to_date }
            );
            alert("RAL chiusa.");
            loadCurrentData();
          }}
        >
          Chiudi RAL attuale
        </Button>
      </Box>
    )}

    <Box p={2} border="1px solid #ddd" borderRadius="8px">
      <Typography variant="subtitle1" mb={2}>Nuova RAL</Typography>

      <TextField
        fullWidth
        label="Importo"
        type="number"
        sx={{ mb: 2 }}
        value={newSalary.amount}
        onChange={(e) =>
          setNewSalary({ ...newSalary, amount: e.target.value })
        }
      />

      <TextField
        fullWidth
        type="date"
        label="Data inizio"
        sx={{ mb: 2 }}
        value={newSalary.from_date}
        onChange={(e) =>
          setNewSalary({ ...newSalary, from_date: e.target.value })
        }
      />

      <TextField
        fullWidth
        label="Note"
        multiline
        rows={3}
        sx={{ mb: 2 }}
        value={newSalary.note}
        onChange={(e) =>
          setNewSalary({ ...newSalary, note: e.target.value })
        }
      />

      <Button
        variant="contained"
        onClick={async () => {
          if (!newSalary.amount || !newSalary.from_date) {
            alert("Compila tutti i campi.");
            return;
          }
          await api.post(`/api/v1/employees/${employeeId}/salaries`, newSalary);
          alert("Nuova RAL aggiunta.");
          setNewSalary({ amount: "", from_date: "", note: "" });
          loadCurrentData();
        }}
      >
        Aggiungi nuova RAL
      </Button>
    </Box>
  </Box>
)}

{/* ===============================
    SEZIONE: REPARTO
   =============================== */}
{selectedSection === "department" && (
  <Box>
    <Typography variant="h5" mb={2}>Variazione Reparto</Typography>

    {currentDepartment && (
      <Box mb={4} p={2} border="1px solid #ddd" borderRadius="8px">
        <Typography variant="subtitle1">Reparto attuale</Typography>
        <Typography>Reparto: {currentDepartment.department_name}</Typography>
        <Typography>Manager: {currentDepartment.manager_name}</Typography>

        <TextField
          fullWidth
          type="date"
          label="Data fine (chiusura)"
          sx={{ mt: 2 }}
          value={currentDepartment.to_date || ""}
          onChange={(e) =>
            setCurrentDepartment({
              ...currentDepartment,
              to_date: e.target.value,
            })
          }
        />

        <Button
          variant="outlined"
          color="error"
          sx={{ mt: 2 }}
          onClick={async () => {
            if (!currentDepartment.to_date) {
              alert("Inserisci una data di fine.");
              return;
            }
            await api.patch(
              `/api/v1/employees/${employeeId}/departments/${currentDepartment.id}`,
              { to_date: currentDepartment.to_date }
            );
            alert("Reparto chiuso.");
            loadCurrentData();
          }}
        >
          Chiudi reparto attuale
        </Button>
      </Box>
    )}

    <Box p={2} border="1px solid #ddd" borderRadius="8px">
      <Typography variant="subtitle1" mb={2}>Nuovo reparto</Typography>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="department-label">Reparto</InputLabel>
        <Select
          labelId="department-label"
          value={newDepartment.department_id}
          label="Reparto"
          onChange={(e) =>
            setNewDepartment({ ...newDepartment, department_id: e.target.value })
          }
        >
          {departmentList.map((d) => (
            <MenuItem key={d.id} value={d.id}>
              {d.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="manager-label">Manager</InputLabel>
        <Select
          labelId="manager-label"
          value={newDepartment.manager_id}
          label="Manager"
          onChange={(e) =>
            setNewDepartment({ ...newDepartment, manager_id: e.target.value })
          }
        >
          {managerList.map((m) => (
            <MenuItem key={m.id} value={m.id}>
              {m.full_name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        fullWidth
        type="date"
        label="Data inizio"
        sx={{ mb: 2 }}
        value={newDepartment.from_date}
        onChange={(e) =>
          setNewDepartment({ ...newDepartment, from_date: e.target.value })
        }
      />

      <TextField
        fullWidth
        label="Note"
        multiline
        rows={3}
        sx={{ mb: 2 }}
        value={newDepartment.note}
        onChange={(e) =>
          setNewDepartment({ ...newDepartment, note: e.target.value })
        }
      />

      <Button
        variant="contained"
        onClick={async () => {
          if (!newDepartment.department_id || !newDepartment.from_date) {
            alert("Compila tutti i campi.");
            return;
          }
          await api.post(`/api/v1/employees/${employeeId}/departments`, newDepartment);
          alert("Nuovo reparto aggiunto.");
          setNewDepartment({ department_id: "", manager_id: "", from_date: "", note: "" });
          loadCurrentData();
        }}
      >
        Aggiungi nuovo reparto
      </Button>
    </Box>
  </Box>
)}

{/* ===============================
    SEZIONE: SITO
   =============================== */}
{selectedSection === "site" && (
  <Box>
    <Typography variant="h5" mb={2}>Variazione Sito</Typography>

    {currentSite && (
      <Box mb={4} p={2} border="1px solid #ddd" borderRadius="8px">
        <Typography variant="subtitle1">Sito attuale</Typography>
        <Typography>Sito: {currentSite.site_name}</Typography>

        <TextField
          fullWidth
          type="date"
          label="Data fine (chiusura)"
          sx={{ mt: 2 }}
          value={currentSite.to_date || ""}
          onChange={(e) =>
            setCurrentSite({ ...currentSite, to_date: e.target.value })
          }
        />

        <Button
          variant="outlined"
          color="error"
          sx={{ mt: 2 }}
          onClick={async () => {
            if (!currentSite.to_date) {
              alert("Inserisci una data di fine.");
              return;
            }
            await api.patch(
              `/api/v1/employees/${employeeId}/sites/${currentSite.id}`,
              { to_date: currentSite.to_date }
            );
            alert("Sito chiuso.");
            loadCurrentData();
          }}
        >
          Chiudi sito attuale
        </Button>
      </Box>
    )}

    <Box p={2} border="1px solid #ddd" borderRadius="8px">
      <Typography variant="subtitle1" mb={2}>Nuovo sito</Typography>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="site-label">Sito</InputLabel>
        <Select
          labelId="site-label"
          value={newSite.site_id}
          label="Sito"
          onChange={(e) =>
            setNewSite({ ...newSite, site_id: e.target.value })
          }
        >
          {siteList.map((s) => (
            <MenuItem key={s.id} value={s.id}>
              {s.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        fullWidth
        type="date"
        label="Data inizio"
        sx={{ mb: 2 }}
        value={newSite.from_date}
        onChange={(e) =>
          setNewSite({ ...newSite, from_date: e.target.value })
        }
      />

      <TextField
        fullWidth
        label="Note"
        multiline
        rows={3}
        sx={{ mb: 2 }}
        value={newSite.note}
        onChange={(e) =>
          setNewSite({ ...newSite, note: e.target.value })
        }
      />

      <Button
        variant="contained"
        onClick={async () => {
          if (!newSite.site_id || !newSite.from_date) {
            alert("Compila tutti i campi.");
            return;
          }
          await api.post(`/api/v1/employees/${employeeId}/sites`, newSite);
          alert("Nuovo sito aggiunto.");
          setNewSite({ site_id: "", from_date: "", note: "" });
          loadCurrentData();
        }}
      >
        Aggiungi nuovo sito
      </Button>
    </Box>
  </Box>
)}
{/* ===============================
    SEZIONE: BENEFIT
   =============================== */}
{selectedSection === "benefits" && (
  <Box>
    <Typography variant="h5" mb={2}>Variazione Benefit</Typography>

    {/* BENEFIT ATTUALI */}
    {currentBenefits.map((b) => (
      <Box key={b.id} mb={4} p={2} border="1px solid #ddd" borderRadius="8px">
        <Typography variant="subtitle1">Benefit attuale</Typography>
        <Typography>Tipo: {b.benefit_type_description}</Typography>
        <Typography>Data inizio: {b.from_date}</Typography>

        <TextField
          fullWidth
          type="date"
          label="Data fine (chiusura)"
          sx={{ mt: 2 }}
          value={b.to_date || ""}
          onChange={(e) =>
            setCurrentBenefits((prev) =>
              prev.map((x) =>
                x.id === b.id ? { ...x, to_date: e.target.value } : x
              )
            )
          }
        />

        <Button
          variant="outlined"
          color="error"
          sx={{ mt: 2 }}
          onClick={async () => {
            if (!b.to_date) {
              alert("Inserisci una data di fine.");
              return;
            }
            await api.patch(
              `/api/v1/employees/${employeeId}/benefits/${b.id}`,
              { to_date: b.to_date }
            );
            alert("Benefit chiuso.");
            loadCurrentData();
          }}
        >
          Chiudi benefit
        </Button>
      </Box>
    ))}

    {/* NUOVO BENEFIT */}
    <Box p={2} border="1px solid #ddd" borderRadius="8px">
      <Typography variant="subtitle1" mb={2}>Nuovo benefit</Typography>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="benefit-type-label">Tipo benefit</InputLabel>
        <Select
          labelId="benefit-type-label"
          value={newBenefit.benefit_type_id}
          label="Tipo benefit"
          onChange={(e) =>
            setNewBenefit({ ...newBenefit, benefit_type_id: e.target.value })
          }
        >
          {benefitTypes.map((bt) => (
            <MenuItem key={bt.id} value={bt.id}>
              {bt.description}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        fullWidth
        type="date"
        label="Data inizio"
        sx={{ mb: 2 }}
        value={newBenefit.from_date}
        onChange={(e) =>
          setNewBenefit({ ...newBenefit, from_date: e.target.value })
        }
      />

      <TextField
        fullWidth
        label="Note"
        multiline
        rows={3}
        sx={{ mb: 2 }}
        value={newBenefit.note}
        onChange={(e) =>
          setNewBenefit({ ...newBenefit, note: e.target.value })
        }
      />

      <Button
        variant="contained"
        onClick={async () => {
          if (!newBenefit.benefit_type_id || !newBenefit.from_date) {
            alert("Compila tutti i campi.");
            return;
          }
          await api.post(`/api/v1/employees/${employeeId}/benefits`, newBenefit);
          alert("Nuovo benefit aggiunto.");
          setNewBenefit({ benefit_type_id: "", from_date: "", note: "" });
          loadCurrentData();
        }}
      >
        Aggiungi nuovo benefit
      </Button>
    </Box>
  </Box>
)}
{/* ===============================
    SEZIONE: ENAC – CORSI
   =============================== */}
{selectedSection === "enacCourses" && (
  <Box>
    <Typography variant="h5" mb={2}>Variazione ENAC – Corsi</Typography>

    {/* CORSI ATTUALI */}
    {currentEnacCourses.map((c) => (
      <Box key={c.id} mb={4} p={2} border="1px solid #ddd" borderRadius="8px">
        <Typography variant="subtitle1">Corso attuale</Typography>
        <Typography>Corso: {c.course_name}</Typography>
        <Typography>Data inizio: {c.from_date}</Typography>

        <TextField
          fullWidth
          type="date"
          label="Data fine (chiusura)"
          sx={{ mt: 2 }}
          value={c.to_date || ""}
          onChange={(e) =>
            setCurrentEnacCourses((prev) =>
              prev.map((x) =>
                x.id === c.id ? { ...x, to_date: e.target.value } : x
              )
            )
          }
        />

        <Button
          variant="outlined"
          color="error"
          sx={{ mt: 2 }}
          onClick={async () => {
            if (!c.to_date) {
              alert("Inserisci una data di fine.");
              return;
            }
            await api.patch(
              `/api/v1/employees/${employeeId}/enac-courses/${c.id}`,
              { to_date: c.to_date }
            );
            alert("Corso ENAC chiuso.");
            loadCurrentData();
          }}
        >
          Chiudi corso
        </Button>
      </Box>
    ))}

    {/* NUOVO CORSO */}
    <Box p={2} border="1px solid #ddd" borderRadius="8px">
      <Typography variant="subtitle1" mb={2}>Nuovo corso ENAC</Typography>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="enac-course-label">Corso</InputLabel>
        <Select
          labelId="enac-course-label"
          value={newEnacCourse.course_id}
          label="Corso"
          onChange={(e) =>
            setNewEnacCourse({ ...newEnacCourse, course_id: e.target.value })
          }
        >
          {enacCoursesList.map((course) => (
            <MenuItem key={course.id} value={course.id}>
              {course.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        fullWidth
        type="date"
        label="Data inizio"
        sx={{ mb: 2 }}
        value={newEnacCourse.from_date}
        onChange={(e) =>
          setNewEnacCourse({ ...newEnacCourse, from_date: e.target.value })
        }
      />

      <TextField
        fullWidth
        label="Note"
        multiline
        rows={3}
        sx={{ mb: 2 }}
        value={newEnacCourse.note}
        onChange={(e) =>
          setNewEnacCourse({ ...newEnacCourse, note: e.target.value })
        }
      />

      <Button
        variant="contained"
        onClick={async () => {
          if (!newEnacCourse.course_id || !newEnacCourse.from_date) {
            alert("Compila tutti i campi.");
            return;
          }
          await api.post(`/api/v1/employees/${employeeId}/enac-courses`, newEnacCourse);
          alert("Nuovo corso ENAC aggiunto.");
          setNewEnacCourse({ course_id: "", from_date: "", note: "" });
          loadCurrentData();
        }}
      >
        Aggiungi nuovo corso
      </Button>
    </Box>
  </Box>
)}
{/* ===============================
    SEZIONE: ENAC – APPROVAZIONI
   =============================== */}
{selectedSection === "enacApprovals" && (
  <Box>
    <Typography variant="h5" mb={2}>Variazione ENAC – Approvazioni</Typography>

    {/* APPROVAZIONI ATTUALI */}
    {currentEnacApprovals.map((a) => (
      <Box key={a.id} mb={4} p={2} border="1px solid #ddd" borderRadius="8px">
        <Typography variant="subtitle1">Approvazione attuale</Typography>
        <Typography>Tipo: {a.approval_type_name}</Typography>
        <Typography>Data inizio: {a.from_date}</Typography>

        <TextField
          fullWidth
          type="date"
          label="Data fine (chiusura)"
          sx={{ mt: 2 }}
          value={a.to_date || ""}
          onChange={(e) =>
            setCurrentEnacApprovals((prev) =>
              prev.map((x) =>
                x.id === a.id ? { ...x, to_date: e.target.value } : x
              )
            )
          }
        />

        <Button
          variant="outlined"
          color="error"
          sx={{ mt: 2 }}
          onClick={async () => {
            if (!a.to_date) {
              alert("Inserisci una data di fine.");
              return;
            }
            await api.patch(
              `/api/v1/employees/${employeeId}/enac-approvals/${a.id}`,
              { to_date: a.to_date }
            );
            alert("Approvazione ENAC chiusa.");
            loadCurrentData();
          }}
        >
          Chiudi approvazione
        </Button>
      </Box>
    ))}

    {/* NUOVA APPROVAZIONE */}
    <Box p={2} border="1px solid #ddd" borderRadius="8px">
      <Typography variant="subtitle1" mb={2}>Nuova approvazione ENAC</Typography>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="enac-approval-label">Tipo approvazione</InputLabel>
        <Select
          labelId="enac-approval-label"
          value={newEnacApproval.approval_type_id}
          label="Tipo approvazione"
          onChange={(e) =>
            setNewEnacApproval({ ...newEnacApproval, approval_type_id: e.target.value })
          }
        >
          {enacApprovalsList.map((appr) => (
            <MenuItem key={appr.id} value={appr.id}>
              {appr.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        fullWidth
        type="date"
        label="Data inizio"
        sx={{ mb: 2 }}
        value={newEnacApproval.from_date}
        onChange={(e) =>
          setNewEnacApproval({ ...newEnacApproval, from_date: e.target.value })
        }
      />

      <TextField
        fullWidth
        label="Note"
        multiline
        rows={3}
        sx={{ mb: 2 }}
        value={newEnacApproval.note}
        onChange={(e) =>
          setNewEnacApproval({ ...newEnacApproval, note: e.target.value })
        }
      />

      <Button
        variant="contained"
        onClick={async () => {
          if (!newEnacApproval.approval_type_id || !newEnacApproval.from_date) {
            alert("Compila tutti i campi.");
            return;
          }
          await api.post(`/api/v1/employees/${employeeId}/enac-approvals`, newEnacApproval);
          alert("Nuova approvazione ENAC aggiunta.");
          setNewEnacApproval({ approval_type_id: "", from_date: "", note: "" });
          loadCurrentData();
        }}
      >
        Aggiungi nuova approvazione
      </Button>
    </Box>
  </Box>
)}
{/* ===============================
    SEZIONE: CENTRI DI COSTO
   =============================== */}
{selectedSection === "costCenters" && (
  <Box>
    <Typography variant="h5" mb={2}>Variazione Centri di Costo</Typography>

    {/* RIGHE ATTUALI */}
    <Typography variant="subtitle1" mb={1}>Centri di costo attuali</Typography>

    {currentCostCenters.map((cc) => (
      <Box key={cc.id} mb={3} p={2} border="1px solid #ddd" borderRadius="8px">
        <Typography>Centro: {cc.cost_center_name}</Typography>
        <Typography>Percentuale: {cc.percentage}%</Typography>
        <Typography>Data inizio: {cc.from_date}</Typography>

        <TextField
          fullWidth
          type="date"
          label="Data fine (chiusura)"
          sx={{ mt: 2 }}
          value={closingCostCenters[cc.id] || ""}
          onChange={(e) =>
            setClosingCostCenters({
              ...closingCostCenters,
              [cc.id]: e.target.value,
            })
          }
        />

        <Button
          variant="outlined"
          color="error"
          sx={{ mt: 2 }}
          onClick={async () => {
            const toDate = closingCostCenters[cc.id];
            if (!toDate) {
              alert("Inserisci una data di fine.");
              return;
            }

            await api.patch(
              `/api/v1/employees/${employeeId}/cost-centers/${cc.id}`,
              { to_date: toDate }
            );

            alert("Centro di costo chiuso.");
            loadCurrentData();
          }}
        >
          Chiudi centro di costo
        </Button>
      </Box>
    ))}

    {/* NUOVA ASSEGNAZIONE */}
    <Box p={2} border="1px solid #ddd" borderRadius="8px" mt={4}>
      <Typography variant="subtitle1" mb={2}>Nuova assegnazione centro di costo</Typography>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="cost-center-label">Centro di costo</InputLabel>
        <Select
          labelId="cost-center-label"
          value={newCostCenter.cost_center_id}
          label="Centro di costo"
          onChange={(e) =>
            setNewCostCenter({ ...newCostCenter, cost_center_id: e.target.value })
          }
        >
          {costCenterList.map((cc) => (
            <MenuItem key={cc.id} value={cc.id}>
              {cc.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        fullWidth
        type="number"
        label="Percentuale"
        sx={{ mb: 2 }}
        value={newCostCenter.percentage}
        onChange={(e) =>
          setNewCostCenter({ ...newCostCenter, percentage: e.target.value })
        }
      />

      <TextField
        fullWidth
        type="date"
        label="Data inizio"
        sx={{ mb: 2 }}
        value={newCostCenter.from_date}
        onChange={(e) =>
          setNewCostCenter({ ...newCostCenter, from_date: e.target.value })
        }
      />

      <TextField
        fullWidth
        label="Note"
        multiline
        rows={3}
        sx={{ mb: 2 }}
        value={newCostCenter.note}
        onChange={(e) =>
          setNewCostCenter({ ...newCostCenter, note: e.target.value })
        }
      />

      <Button
        variant="contained"
        onClick={async () => {
          if (
            !newCostCenter.cost_center_id ||
            !newCostCenter.percentage ||
            !newCostCenter.from_date
          ) {
            alert("Compila tutti i campi.");
            return;
          }

          await api.post(
            `/api/v1/employees/${employeeId}/cost-centers`,
            newCostCenter
          );

          alert("Nuovo centro di costo aggiunto.");
          setNewCostCenter({
            cost_center_id: "",
            percentage: "",
            from_date: "",
            note: "",
          });

          loadCurrentData();
        }}
      >
        Aggiungi nuovo centro di costo
      </Button>
    </Box>
  </Box>
)}
{/* ===============================
    SEZIONE: EMPLOYER
   =============================== */}
{selectedSection === "employer" && (
  <Box>
    <Typography variant="h5" mb={2}>Variazione Employer</Typography>

    {currentEmployer && (
      <Box mb={4} p={2} border="1px solid #ddd" borderRadius="8px">
        <Typography variant="subtitle1">Employer attuale</Typography>
        <Typography>Employer: {currentEmployer.employer_name}</Typography>
        <Typography>Data inizio: {currentEmployer.from_date}</Typography>

        <TextField
          fullWidth
          type="date"
          label="Data fine"
          sx={{ mt: 2 }}
          value={currentEmployer.to_date || ""}
          onChange={(e) =>
            setCurrentEmployer({
              ...currentEmployer,
              to_date: e.target.value,
            })
          }
        />

        <Button
          variant="outlined"
          color="error"
          sx={{ mt: 2 }}
          onClick={async () => {
            if (!currentEmployer.to_date) {
              alert("Inserisci una data di fine.");
              return;
            }

            await api.patch(
              `/api/v1/employees/${employeeId}/employers/${currentEmployer.id}`,
              { to_date: currentEmployer.to_date }
            );

            alert("Employer chiuso.");
            loadCurrentData();
          }}
        >
          Chiudi employer attuale
        </Button>
      </Box>
    )}

    {/* NUOVO EMPLOYER */}
    <Box p={2} border="1px solid #ddd" borderRadius="8px">
      <Typography variant="subtitle1" mb={2}>Nuovo employer</Typography>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="employer-label">Employer</InputLabel>
        <Select
          labelId="employer-label"
          value={newEmployer.employer_id}
          label="Employer"
          onChange={(e) =>
            setNewEmployer({ ...newEmployer, employer_id: e.target.value })
          }
        >
          {employerList.map((emp) => (
            <MenuItem key={emp.id} value={emp.id}>
              {emp.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        fullWidth
        type="date"
        label="Data inizio"
        sx={{ mb: 2 }}
        value={newEmployer.from_date}
        onChange={(e) =>
          setNewEmployer({ ...newEmployer, from_date: e.target.value })
        }
      />

      <TextField
        fullWidth
        label="Note"
        multiline
        rows={3}
        sx={{ mb: 2 }}
        value={newEmployer.note}
        onChange={(e) =>
          setNewEmployer({ ...newEmployer, note: e.target.value })
        }
      />

      <Button
        variant="contained"
        onClick={async () => {
          if (!newEmployer.employer_id || !newEmployer.from_date) {
            alert("Compila tutti i campi.");
            return;
          }

          await api.post(
            `/api/v1/employees/${employeeId}/employers`,
            newEmployer
          );

          alert("Nuovo employer aggiunto.");
          setNewEmployer({ employer_id: "", from_date: "", note: "" });
          loadCurrentData();
        }}
      >
        Aggiungi nuovo employer
      </Button>
    </Box>
  </Box>
)}
{/* ===============================
    SEZIONE: SINDACATO
   =============================== */}
{selectedSection === "union" && (
  <Box>
    <Typography variant="h5" mb={2}>Variazione Sindacato</Typography>

    {currentUnion && (
      <Box mb={4} p={2} border="1px solid #ddd" borderRadius="8px">
        <Typography variant="subtitle1">Sindacato attuale</Typography>
        <Typography>Sindacato: {currentUnion.union_name}</Typography>
        <Typography>Data inizio: {currentUnion.from_date}</Typography>

        <TextField
          fullWidth
          type="date"
          label="Data fine"
          sx={{ mt: 2 }}
          value={currentUnion.to_date || ""}
          onChange={(e) =>
            setCurrentUnion({
              ...currentUnion,
              to_date: e.target.value,
            })
          }
        />

        <Button
          variant="outlined"
          color="error"
          sx={{ mt: 2 }}
          onClick={async () => {
            if (!currentUnion.to_date) {
              alert("Inserisci una data di fine.");
              return;
            }

            await api.patch(
              `/api/v1/employees/${employeeId}/unions/${currentUnion.id}`,
              { to_date: currentUnion.to_date }
            );

            alert("Sindacato chiuso.");
            loadCurrentData();
          }}
        >
          Chiudi sindacato attuale
        </Button>
      </Box>
    )}

    {/* NUOVO SINDACATO */}
    <Box p={2} border="1px solid #ddd" borderRadius="8px">
      <Typography variant="subtitle1" mb={2}>Nuovo sindacato</Typography>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="union-label">Sindacato</InputLabel>
        <Select
          labelId="union-label"
          value={newUnion.union_id}
          label="Sindacato"
          onChange={(e) =>
            setNewUnion({ ...newUnion, union_id: e.target.value })
          }
        >
          {unionList.map((u) => (
            <MenuItem key={u.id} value={u.id}>
              {u.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        fullWidth
        type="date"
        label="Data inizio"
        sx={{ mb: 2 }}
        value={newUnion.from_date}
        onChange={(e) =>
          setNewUnion({ ...newUnion, from_date: e.target.value })
        }
      />

      <TextField
        fullWidth
        label="Note"
        multiline
        rows={3}
        sx={{ mb: 2 }}
        value={newUnion.note}
        onChange={(e) =>
          setNewUnion({ ...newUnion, note: e.target.value })
        }
      />

      <Button
        variant="contained"
        onClick={async () => {
          if (!newUnion.union_id || !newUnion.from_date) {
            alert("Compila tutti i campi.");
            return;
          }

          await api.post(
            `/api/v1/employees/${employeeId}/unions`,
            newUnion
          );

          alert("Nuovo sindacato aggiunto.");
          setNewUnion({ union_id: "", from_date: "", note: "" });
          loadCurrentData();
        }}
      >
        Aggiungi nuovo sindacato
      </Button>
    </Box>
  </Box>
)}
