import { useState, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import api from "../../services/api";
import { useNavigate, useParams } from "react-router-dom";

export default function EmployeeEditPage() {
  const { id } = useParams();
  const employeeId = Number(id);
  const navigate = useNavigate();

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
  const [departments, setDepartments] = useState<any[]>([]);
  const [managers, setManagers] = useState<any[]>([]);

  const [department, setDepartment] = useState({
    department_id: 0,
    manager_employee_id: 0,
    from_date: "",
    note: "",
  });



  const [newStatus, setNewStatus] = useState({
    status_type_id: "",
    from_date: "",
    note: "",
  });

  const [newSalary, setNewSalary] = useState({
    ral_amount: "",
    from_date: "",
    note: "",
  });

  const [newDepartment, setNewDepartment] = useState({
    department_id: "",
    manager_employee_id: "",
    from_date: "",
    note: "",
  });

  const [newSite, setNewSite] = useState({
    site_id: "",
    from_date: "",
    note: "",
  });

  const [newBenefit, setNewBenefit] = useState({
    benefit_type_id: "",
    from_date: "",
    note: "",
  });

  const [newCompanyCar, setNewCompanyCar] = useState({
    car_model: "",
    plate: "",
    from_date: "",
    note: "",
  });

  const [newEnacCourse, setNewEnacCourse] = useState({
    course_date: "",
    expiry_date: "",
    is_first_course: false,
    note: "",
  });

  const [newEnacApproval, setNewEnacApproval] = useState({
    request_date: "",
    approval_date: "",
    is_first_approval: false,
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

  const [variationDate, setVariationDate] = useState("");
  const [editedCostCenters, setEditedCostCenters] = useState<any[]>([]);

  const [newCenters, setNewCenters] = useState<any[]>([]);

  // totale = somma dei centri attuali (nuove percentuali) + eventuale nuovo centro
  const totalPercent =
    editedCostCenters.reduce(
      (sum, cc) => sum + Number(cc.new_weight_percent || 0),
      0
    ) + newCenters.reduce(
          (sum, nc) => sum + Number(nc.weight_percent || 0),
          0
        );


  useEffect(() => {
    if (currentCostCenters && currentCostCenters.length > 0) {
      setEditedCostCenters(
        currentCostCenters.map((cc) => ({
          ...cc,
          new_weight_percent: cc.weight_percent,
          action: "modify",
        }))
      );
    }
  }, [currentCostCenters]);

  const handleApplyCostCenters = async () => {
    if (!variationDate) {
      alert("Inserisci la data di variazione.");
    return;
    }

    const hasEdited =
      editedCostCenters.some(
        (cc) => cc.action === "modify" || cc.action === "close"
      );

    const hasNewCenters = newCenters.length > 0;

    if (!hasEdited && !hasNewCenters) {
      alert("Non ci sono variazioni da applicare.");
      return;
    }

    const centersPayload = [
      // centri attuali variati (modify/close)
      ...editedCostCenters
        .filter((cc) => cc.action === "modify" || cc.action === "close")
        .map((cc) => ({
          cost_center_id: cc.cost_center_id,
          old_percent: cc.weight_percent,
          new_percent: cc.new_weight_percent,
          action: cc.action,
          note: cc.note,
        })),
      // eventuale nuovo centro
      ...newCenters.map((nc) => ({
        cost_center_id: nc.cost_center_id,
        old_percent: 0,
        new_percent: Number(nc.weight_percent),
        action: "add",
        note: nc.note,
      })),

    ];

    const payload = {
      modification_date: variationDate,
      centers: centersPayload,
    };

    try {
      await api.post(`/api/v1/employees/${employeeId}/cost-centers`, payload);
      alert("Variazione centri di costo registrata.");
      loadCurrentData();
      // reset dopo applicazione
      setVariationDate("");
      setNewCenters([]);

    } catch (err: any) {
      alert(
        err.response?.data?.detail?.msg ||
        err.response?.data?.detail?.[0]?.msg ||
        err.response?.data?.detail ||
        "Errore durante la variazione dei centri di costo."
      );

    }
  };

  const updateNewCenter = (index: number, changes: any) => {
    setNewCenters((prev) =>
      prev.map((nc, i) => (i === index ? { ...nc, ...changes } : nc))
    );
  };

  const loadDepartments = async (siteId: number | string) => {
    const numericSiteId = Number(siteId);
    if (!numericSiteId || isNaN(numericSiteId)) return;

    try {
      const res = await api.get(`/api/v1/departments?site_id=${numericSiteId}`);
      setDepartments(res.data);
    } catch (err) {
      console.error("Errore caricamento reparti:", err);
    }
  };

  const loadManagers = async (siteId: number | string) => {
    const numericSiteId = Number(siteId);
    if (!numericSiteId || isNaN(numericSiteId)) return;

    try {
      const res = await api.get(`/api/v1/preposti?site_id=${numericSiteId}`);
      
      // Mappiamo i dati normalizzando ID e Nome per la Select
      const formatted = res.data.map((m: any) => {
        const idVal = m.id ?? m.employee_id ?? m.manager_id;
        const nameVal =
          m.full_name ||
          m.name ||
          `${m.first_name || ""} ${m.last_name || ""}`.trim() ||
          `Preposto #${idVal}`;

        return {
          ...m,
          id: idVal,
          full_name: nameVal,
        };
      });

      setManagers(formatted);
    } catch (err) {
      console.error("Errore caricamento preposti:", err);
    }
  };

  useEffect(() => {
    const activeSiteId = currentSite?.id || currentSite?.site_id;

    if (activeSiteId) {
      const numericSiteId = Number(activeSiteId);
      loadDepartments(numericSiteId);
      loadManagers(numericSiteId);
    }
  }, [currentSite, selectedSection]);




  // ===============================
  // CARICAMENTO DATI ATTUALI
  // ===============================

  useEffect(() => {
    if (!employeeId) return;
    loadCurrentData();
  }, [employeeId]);

  const loadCurrentData = async () => {
    try {
      const res = await api.get(`/api/v1/employees/${employeeId}`);
      const data = res.data;

      setEditedCostCenters(
        data.cost_centers.map((cc: any) => ({
          id: cc.id,
          cost_center_id: cc.cost_center_id,
          cost_center_name: cc.description,
          weight_percent: cc.weight_percent,
          new_weight_percent: cc.weight_percent,
          from_date: cc.from_date,
          action: "modify",
          note: cc.note || "",
        }))
      );



      setCurrentStatus(data.status_current);
      setCurrentSalary(data.salary_current);
      setCurrentCostCenters(data.cost_centers || []);
      setCurrentDepartment(data.department_current);
      setCurrentSite(data.site_current);
      setCurrentBenefits(data.benefits_current || []);
      setCurrentCompanyCar(data.company_car_current);
      setCurrentEmployer(data.employer_current);
      setCurrentUnion(data.union_current);
      setCurrentEnacCourses(data.enac_courses_current || []);
      setCurrentEnacApprovals(data.enac_approvals_current || []);
    } catch (err: any) {
      console.error("Errore nel caricamento dati attuali:", err);
    }
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
 	
  const [employerList, setEmployerList] = useState<any[]>([]);
  const [unionList, setUnionList] = useState<any[]>([]);

  useEffect(() => {
    loadOptions();
  }, [currentSite?.id]);

  const loadOptions = async () => {
    try {
      const [
        statusRes,
        costCenterRes,
        departmentRes,
        managerRes,
        siteRes,
        benefitRes,
        employerRes,
        unionRes,
      ] = await Promise.all([
        api.get("/api/v1/employment-status-types"),
        api.get("/api/v1/cost-centers"),
        currentSite?.id
          ? api.get(`/api/v1/departments?site_id=${currentSite.id}`)
          : Promise.resolve({ data: [] }),
        currentSite?.id
          ? api.get(`/api/v1/preposti`, { params: { site_id: currentSite.id } })
          : Promise.resolve({ data: [] }),
        api.get("/api/v1/sites"),
        api.get("/api/v1/benefit-types"),
        api.get("/api/v1/employees/employers/list"),
        api.get("/api/v1/employees/unions/list")
      ]);

      setStatusTypes(statusRes.data);
      setCostCenterList(costCenterRes.data);
      setDepartmentList(departmentRes.data);
      setManagerList(managerRes.data);
      setSiteList(siteRes.data);
      setBenefitTypes(benefitRes.data);
      setEmployerList(employerRes.data);
      setUnionList(unionRes.data);
    } catch (err) {
      console.error("Errore nel caricamento delle options:", err);
    }
  };
  // ===============================
  // LAYOUT GENERALE (MODAL XL)
  // ===============================

  return (
    <Dialog
      open
      fullWidth
      maxWidth="xl"
      onClose={() => navigate("/employees")}
    >
      <DialogTitle>Variazioni dipendente</DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Layout principale */}
        <Box display="flex" height="80vh">
          
          {/* SIDEBAR */}
          <Box
            width="260px"
            bgcolor="#f5f5f5"
            borderRight="1px solid #ddd"
            p={2}
          >
            <Typography variant="h6" mb={2}>
              Variazioni
            </Typography>

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

          {/* CONTENUTO — qui dentro andranno i blocchi 4–9 */}
          <Box flex={1} p={3} overflow="auto">
            {/* ===============================
                SEZIONE: STATO AMMINISTRATIVO
               =============================== */}
            {selectedSection === "status" && (
              <Box>
                <Typography variant="h5" mb={2}>
                  Variazione Stato Amministrativo
                </Typography>

                {/* STATO ATTUALE */}
                {currentStatus && (
                  <Box
                    mb={4}
                    p={2}
                    border="1px solid #ddd"
                    borderRadius="8px"
                  >
                    <Typography variant="subtitle1" mb={1}>
                      Stato attuale
                    </Typography>

                    <Typography>
                      Tipo stato: {currentStatus.status_type_description}
                    </Typography>
                    <Typography>Data inizio: {currentStatus.from_date}</Typography>
                    <Typography>Note: {currentStatus.note}</Typography>

                    <TextField
                      fullWidth
                      type="date"
                      label="Data fine (chiusura)"
                      InputLabelProps={{ shrink: true }}
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
                        } catch (err: any) {
                          console.error(err);
                          alert(err.response?.data?.detail ||"Errore durante la chiusura dello stato.");
                        }
                      }}
                    >
                      Chiudi stato attuale
                    </Button>
                  </Box>
                )}

                {/* NUOVO STATO */}
                <Box
                  p={2}
                  border="1px solid #ddd"
                  borderRadius="8px"
                >
                  <Typography variant="subtitle1" mb={2}>
                    Nuovo stato amministrativo
                  </Typography>

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel id="status-type-label">Tipo stato</InputLabel>
                    <Select
                      labelId="status-type-label"
                      value={newStatus.status_type_id}
                      label="Tipo stato"
                      onChange={(e) =>
                        setNewStatus({
                          ...newStatus,
                          status_type_id: e.target.value,
                        })
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
                    InputLabelProps={{ shrink: true }}
                    sx={{ mb: 2 }}
                    value={newStatus.from_date}
                    onChange={(e) =>
                      setNewStatus({
                        ...newStatus,
                        from_date: e.target.value,
                      })
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
                      setNewStatus({
                        ...newStatus,
                        note: e.target.value,
                      })
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
                        await api.post(
                          `/api/v1/employees/${employeeId}/status`,
                          newStatus
                        );
                        alert("Nuovo stato amministrativo aggiunto.");
                        setNewStatus({
                          status_type_id: "",
                          from_date: "",
                          note: "",
                        });
                        loadCurrentData();
                      } catch (err: any) {
                        console.error(err);
                        alert(err.response?.data?.detail ||"Errore durante l'aggiunta dello stato.");
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
                <Typography variant="h5" mb={2}>
                  Variazione RAL
                </Typography>

                {/* RAL ATTUALE */}
                {currentSalary && (
                  <Box
                    mb={4}
                    p={2}
                    border="1px solid #ddd"
                    borderRadius="8px"
                  >
                    <Typography variant="subtitle1">
                      RAL attuale
                    </Typography>

                    <Typography>
                      Importo: {currentSalary.ral_amount} €
                    </Typography>
                    <Typography>
                      Data inizio: {currentSalary.from_date}
                    </Typography>

                    <TextField
                      fullWidth
                      type="date"
                      label="Data fine (chiusura)"
                      InputLabelProps={{ shrink: true }}
                      sx={{ mt: 2 }}
                      value={currentSalary.to_date || ""}
                      onChange={(e) =>
                        setCurrentSalary({
                          ...currentSalary,
                          to_date: e.target.value,
                        })
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

                        try {
                          await api.patch(
                            `/api/v1/employees/${employeeId}/salaries/${currentSalary.id}`,
                            { to_date: currentSalary.to_date }
                          );
                          alert("RAL chiusa.");
                          loadCurrentData();
                        } catch (err: any) {
                          console.error(err);
                          alert(err.response?.data?.detail ||"Errore durante la chiusura della RAL.");
                        }
                      }}
                    >
                      Chiudi RAL attuale
                    </Button>
                  </Box>
                )}

                {/* NUOVA RAL */}
                <Box
                  p={2}
                  border="1px solid #ddd"
                  borderRadius="8px"
                >
                  <Typography variant="subtitle1" mb={2}>
                    Nuova RAL
                  </Typography>

                  <TextField
                    fullWidth
                    label="Importo"
                    type="number"
                    sx={{ mb: 2 }}
                    value={newSalary.ral_amount}
                    onChange={(e) =>
                      setNewSalary({
                        ...newSalary,
                        ral_amount: e.target.value,
                      })
                    }
                  />

                  <TextField
                    fullWidth
                    type="date"
                    label="Data inizio"
                    InputLabelProps={{ shrink: true }}
                    sx={{ mb: 2 }}
                    value={newSalary.from_date}
                    onChange={(e) =>
                      setNewSalary({
                        ...newSalary,
                        from_date: e.target.value,
                      })
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
                      setNewSalary({
                        ...newSalary,
                        note: e.target.value,
                      })
                    }
                  />

                  <Button
                    variant="contained"
                    onClick={async () => {
                      if (!newSalary.ral_amount || !newSalary.from_date) {
                        alert("Compila tutti i campi.");
                        return;
                      }

                      try {
                        await api.post(
                          `/api/v1/employees/${employeeId}/salaries`,
                          newSalary
                        );
                        alert("Nuova RAL aggiunta.");
                        setNewSalary({
                          ral_amount: "",
                          from_date: "",
                          note: "",
                        });
                        loadCurrentData();
                      } catch (err: any) {
                        console.error(err);
                        alert(err.response?.data?.detail ||"Errore durante l'aggiunta della RAL.");
                      }
                    }}
                  >
                    Aggiungi nuova RAL
                  </Button>
                </Box>
              </Box>
            )}
            {/* ===============================
                SEZIONE: CENTRI DI COSTO
               =============================== */}
            {selectedSection === "costCenters" && (
              <Box>
                <Typography variant="h5" mb={2}>
                  Variazione Centri di Costo
                </Typography>

                {/* ===============================
                    DATA VARIAZIONE (UNICA)
                   =============================== */}
                <TextField
                  fullWidth
                  type="date"
                  label="Data variazione"
                  InputLabelProps={{ shrink: true }}
                  sx={{ mb: 3 }}
                  value={variationDate}
                  onChange={(e) => setVariationDate(e.target.value)}
                />

                {/* ===============================
                    CENTRI DI COSTO ATTUALI
                   =============================== */}
                <Typography variant="subtitle1" mb={1}>
                  Centri di costo attuali
                </Typography>

                {editedCostCenters.length === 0 && (
                  <Typography color="error" mb={2}>
                    Nessun centro di costo attivo trovato.
                  </Typography>
                )}

                {editedCostCenters.map((cc) => (
                  <Box
                    key={cc.cost_center_id}
                    mb={3}
                    p={2}
                    border="1px solid #ddd"
                    borderRadius="8px"
                  >
                    <Typography>Centro: {costCenterList.find(c => c.id === cc.cost_center_id)?.description}</Typography>
                    <Typography>Percentuale attuale: {cc.weight_percent}%</Typography>
                    <Typography>Data inizio: {cc.from_date}</Typography>

                    <TextField
                      fullWidth
                      type="number"
                      label="Nuova percentuale"
                      sx={{ mt: 2 }}
                      value={cc.new_weight_percent}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        setEditedCostCenters((prev) =>
                          prev.map((x) =>
                            x.id === cc.id
                              ? {
                                  ...x,
                                  new_weight_percent: value,
                                  action: value === 0 ? "close" : "modify",
                                }
                              : x
                          )
                        );
                      }}
                    />

                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={cc.action === "close"}
                          onChange={(e) =>
                            setEditedCostCenters((prev) =>
                              prev.map((x) =>
                                x.id === cc.id
                                  ? {
                                      ...x,
                                      action: e.target.checked ? "close" : "modify",
                                      new_weight_percent: e.target.checked
                                        ? 0
                                        : x.new_weight_percent,
                                    }
                                  : x
                              )
                            )
                          }
                        />
                      }
                      label="Chiudi centro di costo"
                      sx={{ mt: 1 }}
                    />
                  </Box>
                ))}

                {/* ===============================
                    NUOVI CENTRI DI COSTO (MULTIPLI)
                    =============================== */}

                <Button
                  variant="outlined"
                  sx={{ mt: 2, mb: 2 }}
                  onClick={() =>
                    setNewCenters([
                      ...newCenters,
                      { cost_center_id: "", weight_percent: "", note: "" }
                    ])
                  }
                >
                  + Aggiungi nuovo centro di costo
                </Button>


                {/* ===============================
                    NUOVI CENTRI DI COSTO
                    =============================== */}
                {newCenters.map((nc, index) => (
                  <Box
                    key={index}
                    p={2}
                    border="1px solid #ddd"
                    borderRadius="8px"
                    mt={4}
                  >
                    <Typography variant="subtitle1" mb={2}>
                      Nuova assegnazione centro di costo #{index + 1}
                    </Typography>

                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel id={`cost-center-label-${index}`}>Centro di costo</InputLabel>
                      <Select
                        labelId={`cost-center-label-${index}`}
                        value={nc.cost_center_id}
                        label="Centro di costo"
                        onChange={(e) =>
                          updateNewCenter(index, { cost_center_id: e.target.value })
                        }
                      >
                        {costCenterList.map((cc) => (
                          <MenuItem key={cc.id} value={cc.id}>
                            {cc.description}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <TextField
                      fullWidth
                      type="number"
                      label="Percentuale"
                      sx={{ mb: 2 }}
                      value={nc.weight_percent}
                      onChange={(e) =>
                        updateNewCenter(index, { weight_percent: e.target.value })
                      }
                    />

                    <TextField
                      fullWidth
                      label="Note"
                      multiline
                      rows={3}
                      sx={{ mb: 2 }}
                      value={nc.note}
                      onChange={(e) =>
                        updateNewCenter(index, { note: e.target.value })
                      }
                    />
                  </Box>
                ))}


                {/* ===============================
                    TOTALE PERCENTUALE
                   =============================== */}
                <Box mt={4}>
                  <Typography
                    variant="h6"
                    color={totalPercent === 100 ? "green" : "red"}
                  >
                    Totale: {totalPercent}%
                  </Typography>
                </Box>

                {/* ===============================
                    UNICO PULSANTE DI APPLICAZIONE
                   =============================== */}
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mt: 3 }}
                  disabled={totalPercent !== 100 || !variationDate}
                  onClick={handleApplyCostCenters}
                >
                  Applica variazione centri di costo
                </Button>
              </Box>
            )}

            {/* ===============================
                SEZIONE: REPARTO
               =============================== */}
            {selectedSection === "department" && (
              <Box>
                <Typography variant="h5" mb={2}>
                  Variazione Reparto
                </Typography>

                {/* REPARTO ATTUALE */}
                {currentDepartment && (
                  <Box
                    mb={4}
                    p={2}
                    border="1px solid #ddd"
                    borderRadius="8px"
                  >
                    <Typography variant="subtitle1">
                      Reparto attuale
                    </Typography>

                    <Typography>Reparto: {currentDepartment.name}</Typography>
                    <Typography>Manager: {currentDepartment.manager_full_name}</Typography>

                    <TextField
                      fullWidth
                      type="date"
                      label="Data fine (chiusura)"
                      InputLabelProps={{ shrink: true }}
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

                        try {
                          await api.patch(
                            `/api/v1/employees/${employeeId}/departments/${currentDepartment.id}`,
                            { to_date: currentDepartment.to_date }
                          );
                          alert("Reparto chiuso.");
                          loadCurrentData();
                        } catch (err: any) {
                          console.error(err);
                          alert(err.response?.data?.detail ||"Errore durante la chiusura del reparto.");
                        }
                      }}
                    >
                      Chiudi reparto attuale
                    </Button>
                  </Box>
                )}

                {/* NUOVO REPARTO */}
                <Box
                  p={2}
                  border="1px solid #ddd"
                  borderRadius="8px"
                >
                  <Typography variant="subtitle1" mb={2}>
                    Nuovo reparto
                  </Typography>

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel id="department-label">Reparto</InputLabel>
                    <Select
                      labelId="department-label"
                      value={newDepartment.department_id}
                      label="Reparto"
                      onChange={(e) =>
                        setNewDepartment({
                          ...newDepartment,
                          department_id: e.target.value,
                        })
                      }
                    >
                      {departments.map((d) => (
                        <MenuItem key={d.id} value={String(d.id)}>
                          {d.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel id="manager-label">Manager</InputLabel>
                    <Select
                      labelId="manager-label"
                      value={newDepartment.manager_employee_id}
                      label="Manager"
                      onChange={(e) =>
                        setNewDepartment({
                          ...newDepartment,
                          manager_employee_id: e.target.value,
                        })
                      }
                    >
                      {managers.map((m) => (
                        <MenuItem key={m.id} value={String(m.id)}>
                          {m.full_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    type="date"
                    label="Data inizio"
                    InputLabelProps={{ shrink: true }}
                    sx={{ mb: 2 }}
                    value={newDepartment.from_date}
                    onChange={(e) =>
                      setNewDepartment({
                        ...newDepartment,
                        from_date: e.target.value,
                      })
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
                      setNewDepartment({
                        ...newDepartment,
                        note: e.target.value,
                      })
                    }
                  />

                  <Button
                    variant="contained"
                    onClick={async () => {
                      if (!newDepartment.department_id || !newDepartment.from_date) {
                        alert("Compila tutti i campi.");
                        return;
                      }

                      try {
                        await api.post(
                          `/api/v1/employees/${employeeId}/departments`,
                          newDepartment
                        );
                        alert("Nuovo reparto aggiunto.");
                        setNewDepartment({
                          department_id: "",
                          manager_employee_id: "",
                          from_date: "",
                          note: "",
                        });
                        loadCurrentData();
                      } catch (err: any) {
                        console.error(err);
                        alert(err.response?.data?.detail ||"Errore durante l'aggiunta del reparto.");
                      }
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
                <Typography variant="h5" mb={2}>
                  Variazione Sito
                </Typography>

                {/* SITO ATTUALE */}
                {currentSite && (
                  <Box
                    mb={4}
                    p={2}
                    border="1px solid #ddd"
                    borderRadius="8px"
                  >
                    <Typography variant="subtitle1">
                      Sito attuale
                    </Typography>

                    <Typography>Sito: {currentSite.site_name}</Typography>

                    <TextField
                      fullWidth
                      type="date"
                      label="Data fine (chiusura)"
                      InputLabelProps={{ shrink: true }}
                      sx={{ mt: 2 }}
                      value={currentSite.to_date || ""}
                      onChange={(e) =>
                        setCurrentSite({
                          ...currentSite,
                          to_date: e.target.value,
                        })
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

                        try {
                          await api.patch(
                            `/api/v1/employees/${employeeId}/sites/${currentSite.id}`,
                            { to_date: currentSite.to_date }
                          );
                          alert("Sito chiuso.");
                          loadCurrentData();
                        } catch (err: any) {
                          console.error(err);
                          alert(err.response?.data?.detail || "Errore durante la chiusura del sito.");
                        }
                      }}
                    >
                      Chiudi sito attuale
                    </Button>
                  </Box>
                )}

                {/* NUOVO SITO */}
                <Box
                  p={2}
                  border="1px solid #ddd"
                  borderRadius="8px"
                >
                  <Typography variant="subtitle1" mb={2}>
                    Nuovo sito
                  </Typography>

                  {/* 1. SELEZIONE SITO (ripristinato siteList) */}
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel id="site-label">Sito</InputLabel>
                    <Select
                      labelId="site-label"
                      value={String(newSite.site_id || "")}
                      label="Sito"
                      onChange={(e) => {
                        const siteId = e.target.value as string;
                        setNewSite({ ...newSite, site_id: siteId });

                        if (siteId) {
                          const numericId = Number(siteId);
                          loadDepartments(numericId);
                          loadManagers(numericId);
                        } else {
                          setDepartments([]);
                          setManagers([]);
                        }

                        setDepartment({
                          department_id: 0,
                          manager_employee_id: 0,
                          from_date: "",
                          note: "",
                        });
                      }}
                    >
                      <MenuItem value="">Seleziona Sito</MenuItem>
                      {siteList.map((s: any) => (
                        <MenuItem key={s.id} value={String(s.id)}>
                          {s.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* 2. UNICA DATA DI INIZIO */}
                  <TextField
                    fullWidth
                    type="date"
                    label="Data inizio"
                    InputLabelProps={{ shrink: true }}
                    sx={{ mb: 2 }}
                    value={String(newSite.from_date || "")}
                    onChange={(e) =>
                      setNewSite({ ...newSite, from_date: e.target.value })
                    }
                  />

                  {/* 3. UNICO CAMPO NOTE */}
                  <TextField
                    fullWidth
                    label="Note"
                    multiline
                    rows={3}
                    sx={{ mb: 2 }}
                    value={newSite.note || ""}
                    onChange={(e) =>
                      setNewSite({ ...newSite, note: e.target.value })
                    }
                  />

                  {/* 4. REPARTO */}
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel id="department-label">Reparto</InputLabel>
                    <Select
                      labelId="department-label"
                      value={String(department.department_id || "0")}
                      label="Reparto"
                      onChange={(e) =>
                        setDepartment({
                          ...department,
                          department_id: Number(e.target.value),
                        })
                      }
                    >
                      <MenuItem value="0">Seleziona</MenuItem>
                      {departments.map((d: any) => (
                        <MenuItem key={d.id} value={String(d.id)}>
                          {d.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* 5. PREPOSTO / RESPONSABILE */}
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel id="manager-label">Preposto / Responsabile</InputLabel>
                    <Select
                      labelId="manager-label"
                      value={String(department.manager_employee_id || "0")}
                      label="Preposto"
                      onChange={(e) =>
                        setDepartment({
                          ...department,
                          manager_employee_id: Number(e.target.value),
                        })
                      }
                    >
                      <MenuItem value="0">Seleziona</MenuItem>
                      {managers.map((m: any) => (
                        <MenuItem key={m.id} value={String(m.id)}>
                          {m.full_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* 6. PULSANTE DI SALVATAGGIO */}
                  <Button
                    variant="contained"
                    onClick={async () => {
                      if (!newSite.site_id || !newSite.from_date) {
                        alert("Seleziona un sito e una data di inizio.");
                        return;
                      }

                      try {
                        // A. Salvataggio Variazione Sito
                        await api.post(`/api/v1/employees/${employeeId}/sites`, {
                          site_id: Number(newSite.site_id),
                          from_date: newSite.from_date,
                          note: newSite.note || "",
                        });

                        // B. Salvataggio Reparto (se selezionato)
                        if (department.department_id > 0) {
                          await api.post(`/api/v1/employees/${employeeId}/departments`, {
                            department_id: department.department_id,
                            manager_employee_id: department.manager_employee_id || null,
                            from_date: newSite.from_date,
                            note: newSite.note || "",
                          });
                        }

                        // C. Salvataggio Responsabile nella tabella employee_managers (se selezionato)
                        if (department.manager_employee_id > 0) {
                          await api.post(`/api/v1/employees/${employeeId}/manager`, {
                            manager_id: department.manager_employee_id,
                            from_date: newSite.from_date,
                            note: newSite.note || "",
                          });
                        }

                        alert("Cambio sito registrato con successo!");

                        // D. RESET COMPLETO DI TUTTI I CAMPI
                        setNewSite({
                          site_id: "",
                          from_date: "",
                          note: "",
                        });
                        setDepartment({
                          department_id: 0,
                          manager_employee_id: 0,
                          from_date: "",
                          note: "",
                        });

                        // E. Ricarica i dati aggiornati
                        loadCurrentData();
                      } catch (err: any) {
                        console.error(err);
                        alert(
                          err.response?.data?.detail ||
                            "Errore durante il salvataggio della variazione."
                        );
                      }
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
                <Typography variant="h5" mb={2}>
                  Variazione Benefit
                </Typography>

                {/* BENEFIT ATTUALI */}
                {currentBenefits.map((b) => (
                  <Box
                    key={b.id}
                    mb={4}
                    p={2}
                    border="1px solid #ddd"
                    borderRadius="8px"
                  >
                    <Typography variant="subtitle1">
                      Benefit attuale
                    </Typography>

                    <Typography>Tipo: {b.benefit_type_description}</Typography>
                    <Typography>Data inizio: {b.from_date}</Typography>

                    <TextField
                      fullWidth
                      type="date"
                      label="Data fine (chiusura)"
                      InputLabelProps={{ shrink: true }}
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

                        try {
                          await api.patch(
                            `/api/v1/employees/${employeeId}/benefits/${b.id}`,
                            { to_date: b.to_date }
                          );
                          alert("Benefit chiuso.");
                          loadCurrentData();
                        } catch (err: any) {
                          console.error(err);
                          alert(err.response?.data?.detail ||"Errore durante la chiusura del benefit.");
                        }
                      }}
                    >
                      Chiudi benefit
                    </Button>
                  </Box>
                ))}

                {/* NUOVO BENEFIT */}
                <Box
                  p={2}
                  border="1px solid #ddd"
                  borderRadius="8px"
                >
                  <Typography variant="subtitle1" mb={2}>
                    Nuovo benefit
                  </Typography>

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel id="benefit-type-label">Tipo benefit</InputLabel>
                    <Select
                      labelId="benefit-type-label"
                      value={newBenefit.benefit_type_id}
                      label="Tipo benefit"
                      onChange={(e) =>
                        setNewBenefit({
                          ...newBenefit,
                          benefit_type_id: e.target.value,
                        })
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
                    InputLabelProps={{ shrink: true }}
                    sx={{ mb: 2 }}
                    value={newBenefit.from_date}
                    onChange={(e) =>
                      setNewBenefit({
                        ...newBenefit,
                        from_date: e.target.value,
                      })
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
                      setNewBenefit({
                        ...newBenefit,
                        note: e.target.value,
                      })
                    }
                  />

                  <Button
                    variant="contained"
                    onClick={async () => {
                      if (!newBenefit.benefit_type_id || !newBenefit.from_date) {
                        alert("Compila tutti i campi.");
                        return;
                      }

                      try {
                        await api.post(
                          `/api/v1/employees/${employeeId}/benefits`,
                          newBenefit
                        );
                        alert("Nuovo benefit aggiunto.");
                        setNewBenefit({
                          benefit_type_id: "",
                          from_date: "",
                          note: "",
                        });
                        loadCurrentData();
                      } catch (err: any) {
                        console.error(err);
                        alert(err.response?.data?.detail ||"Errore durante l'aggiunta del benefit.");
                      }
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
                <Typography variant="h5" mb={2}>
                  Variazione ENAC – Corsi
                </Typography>

                {/* CORSI ATTUALI */}
                {currentEnacCourses.map((c) => (
                  <Box
                    key={c.id}
                    mb={4}
                    p={2}
                    border="1px solid #ddd"
                    borderRadius="8px"
                  >
                    <Typography variant="subtitle1">
                      Corso attuale
                    </Typography>

                    <Typography>Data corso: {c.course_date}</Typography>
                    <Typography>Data scadenza: {c.expiry_date}</Typography>

                    <TextField
                      fullWidth
                      type="date"
                      label="Data fine (chiusura)"
                      InputLabelProps={{ shrink: true }}
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

                        try {
                          await api.patch(
                            `/api/v1/employees/${employeeId}/enac-courses/${c.id}`,
                            { to_date: c.to_date }
                          );
                          alert("Corso ENAC chiuso.");
                          loadCurrentData();
                        } catch (err: any) {
                          console.error(err);
                          alert(err.response?.data?.detail ||"Errore durante la chiusura del corso ENAC.");
                        }
                      }}
                    >
                      Chiudi corso
                    </Button>
                  </Box>
                ))}

                {/* NUOVO CORSO ENAC */}
                <Box
                  p={2}
                  border="1px solid #ddd"
                  borderRadius="8px"
                >
                  <Typography variant="subtitle1" mb={2}>
                    Nuovo corso ENAC
                  </Typography>

                  <TextField
                    fullWidth
                    type="date"
                    label="Data corso"
                    InputLabelProps={{ shrink: true }}
                    sx={{ mb: 2 }}
                    value={newEnacCourse.course_date}
                    onChange={(e) =>
                      setNewEnacCourse({
                        ...newEnacCourse,
                        course_date: e.target.value,
                      })
                    }
                  />

                  <TextField
                    fullWidth
                    type="date"
                    label="Data scadenza"
                    InputLabelProps={{ shrink: true }}
                    sx={{ mb: 2 }}
                    value={newEnacCourse.expiry_date}
                    onChange={(e) =>
                      setNewEnacCourse({
                        ...newEnacCourse,
                        expiry_date: e.target.value,
                      })
                    }
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={newEnacCourse.is_first_course}
                        onChange={(e) =>
                          setNewEnacCourse({
                            ...newEnacCourse,
                            is_first_course: e.target.checked,
                          })
                        }
                      />
                    }
                    label="Primo corso"
                  />

                  <TextField
                    fullWidth
                    label="Note"
                    multiline
                    rows={3}
                    sx={{ mb: 2 }}
                    value={newEnacCourse.note}
                    onChange={(e) =>
                      setNewEnacCourse({
                        ...newEnacCourse,
                        note: e.target.value,
                      })
                    }
                  />

                  <Button
                    variant="contained"
                    onClick={async () => {
                      if (!newEnacCourse.course_date || !newEnacCourse.expiry_date) {
                        alert("Compila tutti i campi.");
                        return;
                      }

                      try {
                        await api.post(
                          `/api/v1/employees/${employeeId}/enac-courses`,
                          newEnacCourse
                        );
                        alert("Nuovo corso ENAC aggiunto.");
                        setNewEnacCourse({
                          course_date: "",
                          expiry_date: "",
                          is_first_course: false,
                          note: "",
                        });
                        loadCurrentData();
                      } catch (err: any) {
                        console.error(err);
                        alert(err.response?.data?.detail ||"Errore durante l'aggiunta del corso ENAC.");
                      }
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
                <Typography variant="h5" mb={2}>
                  Variazione ENAC – Approvazioni
                </Typography>

                {/* APPROVAZIONI ATTUALI */}
                {currentEnacApprovals.map((a) => (
                  <Box
                    key={a.id}
                    mb={4}
                    p={2}
                    border="1px solid #ddd"
                    borderRadius="8px"
                  >
                    <Typography variant="subtitle1">
                      Approvazione attuale
                    </Typography>

                    <Typography>Data richiesta: {a.request_date}</Typography>
                    <Typography>Data approvazione: {a.approval_date}</Typography>

                    <TextField
                      fullWidth
                      type="date"
                      label="Data fine (chiusura)"
                      InputLabelProps={{ shrink: true }}
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

                        try {
                          await api.patch(
                            `/api/v1/employees/${employeeId}/enac-approvals/${a.id}`,
                            { to_date: a.to_date }
                          );
                          alert("Approvazione ENAC chiusa.");
                          loadCurrentData();
                        } catch (err: any) {
                          console.error(err);
                          alert(err.response?.data?.detail ||"Errore durante la chiusura dell'approvazione ENAC.");
                        }
                      }}
                    >
                      Chiudi approvazione
                    </Button>
                  </Box>
                ))}

                {/* NUOVA APPROVAZIONE ENAC */}
                <Box
                  p={2}
                  border="1px solid #ddd"
                  borderRadius="8px"
                >
                  <Typography variant="subtitle1" mb={2}>
                    Nuova approvazione ENAC
                  </Typography>

                  <TextField
                    fullWidth
                    type="date"
                    label="Data richiesta"
                    InputLabelProps={{ shrink: true }}
                    sx={{ mb: 2 }}
                    value={newEnacApproval.request_date}
                    onChange={(e) =>
                      setNewEnacApproval({
                        ...newEnacApproval,
                        request_date: e.target.value,
                      })
                    }
                  />

                  <TextField
                    fullWidth
                    type="date"
                    label="Data approvazione"
                    InputLabelProps={{ shrink: true }}
                    sx={{ mb: 2 }}
                    value={newEnacApproval.approval_date}
                    onChange={(e) =>
                      setNewEnacApproval({
                        ...newEnacApproval,
                        approval_date: e.target.value,
                      })
                    }
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={newEnacApproval.is_first_approval}
                        onChange={(e) =>
                          setNewEnacApproval({
                            ...newEnacApproval,
                            is_first_approval: e.target.checked,
                          })
                        }
                      />
                    }
                    label="Prima approvazione"
                  />

                  <TextField
                    fullWidth
                    label="Note"
                    multiline
                    rows={3}
                    sx={{ mb: 2 }}
                    value={newEnacApproval.note}
                    onChange={(e) =>
                      setNewEnacApproval({
                        ...newEnacApproval,
                        note: e.target.value,
                      })
                    }
                  />

                  <Button
                    variant="contained"
                    onClick={async () => {
                      if (!newEnacApproval.request_date || !newEnacApproval.approval_date) {
                        alert("Compila tutti i campi.");
                        return;
                      }

                      try {
                        await api.post(
                          `/api/v1/employees/${employeeId}/enac-approvals`,
                          newEnacApproval
                        );

                        alert("Nuova approvazione ENAC aggiunta.");

                        setNewEnacApproval({
                          request_date: "",
                          approval_date: "",
                          is_first_approval: false,
                          note: "",
                        });

                        loadCurrentData();
                      } catch (err: any) {
                        console.error(err);
                        alert(err.response?.data?.detail ||"Errore durante l'aggiunta dell'approvazione ENAC.");
                      }
                    }}
                  >
                    Aggiungi nuova approvazione
                  </Button>
                </Box>
              </Box>
            )}
            {/* ===============================
                SEZIONE: EMPLOYER
               =============================== */}
            {selectedSection === "employer" && (
              <Box>
                <Typography variant="h5" mb={2}>
                  Variazione Employer
                </Typography>

                {/* EMPLOYER ATTUALE */}
                {currentEmployer && (
                  <Box
                    mb={4}
                    p={2}
                    border="1px solid #ddd"
                    borderRadius="8px"
                  >
                    <Typography variant="subtitle1">
                      Employer attuale
                    </Typography>

                    <Typography>Employer: {currentEmployer.employer_name}</Typography>
                    <Typography>Data inizio: {currentEmployer.from_date}</Typography>

                    <TextField
                      fullWidth
                      type="date"
                      label="Data fine"
                      InputLabelProps={{ shrink: true }}
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

                        try {
                          await api.patch(
                            `/api/v1/employees/${employeeId}/employers/${currentEmployer.id}`,
                            { to_date: currentEmployer.to_date }
                          );
                          alert("Employer chiuso.");
                          loadCurrentData();
                        } catch (err: any) {
                          console.error(err);
                          alert(err.response?.data?.detail ||"Errore durante la chiusura dell'employer.");
                        }
                      }}
                    >
                      Chiudi employer attuale
                    </Button>
                  </Box>
                )}

                {/* NUOVO EMPLOYER */}
                <Box
                  p={2}
                  border="1px solid #ddd"
                  borderRadius="8px"
                >
                  <Typography variant="subtitle1" mb={2}>
                    Nuovo employer
                  </Typography>

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel id="employer-label">Employer</InputLabel>
                    <Select
                      labelId="employer-label"
                      value={newEmployer.employer_id}
                      label="Employer"
                      onChange={(e) =>
                        setNewEmployer({
                          ...newEmployer,
                          employer_id: e.target.value,
                        })
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
                    InputLabelProps={{ shrink: true }}
                    sx={{ mb: 2 }}
                    value={newEmployer.from_date}
                    onChange={(e) =>
                      setNewEmployer({
                        ...newEmployer,
                        from_date: e.target.value,
                      })
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
                      setNewEmployer({
                        ...newEmployer,
                        note: e.target.value,
                      })
                    }
                  />

                  <Button
                    variant="contained"
                    onClick={async () => {
                      if (!newEmployer.employer_id || !newEmployer.from_date) {
                        alert("Compila tutti i campi.");
                        return;
                      }

                      try {
                        await api.post(
                          `/api/v1/employees/${employeeId}/employers`,
                          newEmployer
                        );
                        alert("Nuovo employer aggiunto.");
                        setNewEmployer({
                          employer_id: "",
                          from_date: "",
                          note: "",
                        });
                        loadCurrentData();
                      } catch (err: any) {
                        console.error(err);
                        alert(err.response?.data?.detail ||"Errore durante l'aggiunta dell'employer.");
                      }
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
                <Typography variant="h5" mb={2}>
                  Variazione Sindacato
                </Typography>

                {/* SINDACATO ATTUALE */}
                {currentUnion && (
                  <Box
                    mb={4}
                    p={2}
                    border="1px solid #ddd"
                    borderRadius="8px"
                  >
                    <Typography variant="subtitle1">
                      Sindacato attuale
                    </Typography>

                    <Typography>Sindacato: {currentUnion.union_name}</Typography>
                    <Typography>Data inizio: {currentUnion.from_date}</Typography>

                    <TextField
                      fullWidth
                      type="date"
                      label="Data fine"
                      InputLabelProps={{ shrink: true }}
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

                        try {
                          await api.patch(
                            `/api/v1/employees/${employeeId}/unions/${currentUnion.id}`,
                            { to_date: currentUnion.to_date }
                          );
                          alert("Sindacato chiuso.");
                          loadCurrentData();
                        } catch (err: any) {
                          console.error(err);
                          alert(err.response?.data?.detail ||"Errore durante la chiusura del sindacato.");
                        }
                      }}
                    >
                      Chiudi sindacato attuale
                    </Button>
                  </Box>
                )}

                {/* NUOVO SINDACATO */}
                <Box
                  p={2}
                  border="1px solid #ddd"
                  borderRadius="8px"
                >
                  <Typography variant="subtitle1" mb={2}>
                    Nuovo sindacato
                  </Typography>

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel id="union-label">Sindacato</InputLabel>
                    <Select
                      labelId="union-label"
                      value={newUnion.union_id}
                      label="Sindacato"
                      onChange={(e) =>
                        setNewUnion({
                          ...newUnion,
                          union_id: e.target.value,
                        })
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
                    InputLabelProps={{ shrink: true }}
                    sx={{ mb: 2 }}
                    value={newUnion.from_date}
                    onChange={(e) =>
                      setNewUnion({
                        ...newUnion,
                        from_date: e.target.value,
                      })
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
                      setNewUnion({
                        ...newUnion,
                        note: e.target.value,
                      })
                    }
                  />

                  <Button
                    variant="contained"
                    onClick={async () => {
                      if (!newUnion.union_id || !newUnion.from_date) {
                        alert("Compila tutti i campi.");
                        return;
                      }

                      try {
                        await api.post(
                          `/api/v1/employees/${employeeId}/unions`,
                          newUnion
                        );
                        alert("Nuovo sindacato aggiunto.");
                        setNewUnion({
                          union_id: "",
                          from_date: "",
                          note: "",
                        });
                        loadCurrentData();
                      } catch (err: any) {
                        console.error(err);
                        alert(err.response?.data?.detail ||"Errore durante l'aggiunta del sindacato.");
                      }
                    }}
                  >
                    Aggiungi nuovo sindacato
                  </Button>
                </Box>
              </Box>
            )}

            {/* ===============================
                SEZIONE: AUTO AZIENDALE
               =============================== */}
            {selectedSection === "companyCar" && (
              <Box>
                <Typography variant="h5" mb={2}>
                  Variazione Auto Aziendale
                </Typography>

                {/* AUTO ATTUALE */}
                {currentCompanyCar && (
                  <Box
                    mb={4}
                    p={2}
                    border="1px solid #ddd"
                    borderRadius="8px"
                  >
                    <Typography variant="subtitle1">
                      Auto attuale
                    </Typography>

                    <Typography>Modello: {currentCompanyCar.car_model}</Typography>
                    <Typography>Targa: {currentCompanyCar.plate}</Typography>
                    <Typography>Data inizio: {currentCompanyCar.from_date}</Typography>

                    <TextField
                      fullWidth
                      type="date"
                      label="Data fine (chiusura)"
                      InputLabelProps={{ shrink: true }}
                      sx={{ mt: 2 }}
                      value={currentCompanyCar.to_date || ""}
                      onChange={(e) =>
                        setCurrentCompanyCar({
                          ...currentCompanyCar,
                          to_date: e.target.value,
                        })
                      }
                    />

                    <Button
                      variant="outlined"
                      color="error"
                      sx={{ mt: 2 }}
                      onClick={async () => {
                        if (!currentCompanyCar.to_date) {
                          alert("Inserisci una data di fine.");
                          return;
                        }

                        try {
                          await api.patch(
                            `/api/v1/employees/${employeeId}/company-cars/${currentCompanyCar.id}`,
                            { to_date: currentCompanyCar.to_date }
                          );
                          alert("Auto aziendale chiusa.");
                          loadCurrentData();
                        } catch (err: any) {
                          console.error(err);
                          alert(err.response?.data?.detail ||"Errore durante la chiusura dell'auto aziendale.");
                        }
                      }}
                    >
                      Chiudi auto aziendale
                    </Button>
                  </Box>
                )}

                {/* NUOVA AUTO AZIENDALE */}
                <Box
                  p={2}
                  border="1px solid #ddd"
                  borderRadius="8px"
                >
                  <Typography variant="subtitle1" mb={2}>
                    Nuova auto aziendale
                  </Typography>

                  <TextField
                    fullWidth
                    label="Modello"
                    sx={{ mb: 2 }}
                    value={newCompanyCar.car_model}
                    onChange={(e) =>
                      setNewCompanyCar({
                        ...newCompanyCar,
                        car_model: e.target.value,
                      })
                    }
                  />

                  <TextField
                    fullWidth
                    label="Targa"
                    sx={{ mb: 2 }}
                    value={newCompanyCar.plate}
                    onChange={(e) =>
                      setNewCompanyCar({
                        ...newCompanyCar,
                        plate: e.target.value,
                      })
                    }
                  />

                  <TextField
                    fullWidth
                    type="date"
                    label="Data inizio"
                    InputLabelProps={{ shrink: true }}
                    sx={{ mb: 2 }}
                    value={newCompanyCar.from_date}
                    onChange={(e) =>
                      setNewCompanyCar({
                        ...newCompanyCar,
                        from_date: e.target.value,
                      })
                    }
                  />

                  <TextField
                    fullWidth
                    label="Note"
                    multiline
                    rows={3}
                    sx={{ mb: 2 }}
                    value={newCompanyCar.note}
                    onChange={(e) =>
                      setNewCompanyCar({
                        ...newCompanyCar,
                        note: e.target.value,
                      })
                    }
                  />

                  <Button
                    variant="contained"
                    onClick={async () => {
                      if (!newCompanyCar.car_model || !newCompanyCar.from_date) {
                        alert("Compila tutti i campi.");
                        return;
                      }

                      try {
                        await api.post(
                          `/api/v1/employees/${employeeId}/company-cars`,
                          newCompanyCar
                        );

                        alert("Nuova auto aziendale aggiunta.");
                        setNewCompanyCar({
                          car_model: "",
                          plate: "",
                          from_date: "",
                          note: "",
                        });
                        loadCurrentData();
                      } catch (err: any) {
                        console.error(err);
                        alert(err.response?.data?.detail ||"Errore durante l'aggiunta dell'auto aziendale.");
                      }
                    }}
                  >
                    Aggiungi nuova auto aziendale
                  </Button>
                </Box>
              </Box>
            )}

          </Box> {/* CHIUSURA CONTENUTO */}
        </Box> {/* CHIUSURA LAYOUT */}
      </DialogContent>
    </Dialog>
  );
}
