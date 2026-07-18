import React, { useState, useEffect } from "react";

// employeeService: funzioni singole
import {
  createEmployee,
  getDepartmentsBySite,
  getPrepostiBySite,
} from "../../services/employeeService";

// siteService: oggetto con getSites()
import { siteService } from "../../services/siteService";

// Se questi service esistono davvero, tienili.
// Se non esistono ancora, li creiamo dopo.
import { getWorkRegimes, getContractNatures } from "../../services/contractService";
import { getCostCenters } from "../../services/costCenterService";
import { getBenefits } from "../../services/benefitService";

interface EmployeeCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (employee: any) => void;
}

const EmployeeCreateModal = ({ isOpen, onClose, onCreated }: EmployeeCreateModalProps) => {
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    // ANAGRAFICA
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    fiscal_code: "",
    gender: "",
    birth_date: "",
    birth_place: "",
    address_street: "",
    address_city: "",
    address_cap: "",

    // LUL
    id_lul: "",

    // RUOLO
    role_id: null,

    // STATO LAVORATIVO
    hire_date: "",
    termination_date: "",
    is_protected_category: false,
    is_disadvantaged: false,

    // SITO ATTUALE + STORICO
    site_history: {
      site_id: null,
      from_date: "",
      note: "",
    },

    // CONTRATTO
    contract: {
      work_regime_id: null,
      contract_nature_id: null,
      from_date: "",
      weekly_hours: "",
      fte: "",
      time_band: "",
      shift_type: "",
      note: "",
    },

    // COST CENTER
    cost_centers: [],

    // REPARTO
    department: {
      department_id: null,
      manager_employee_id: null,
      from_date: "",
      note: "",
    },

    // RAL
    salary: {
      ral_amount: "",
      from_date: "",
      note: "",
    },

    // BENEFIT
    benefits: [],

    // AUTO AZIENDALE
    company_car: null,
  });

  // Opzioni per select
  const [sites, setSites] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [preposti, setPreposti] = useState<any[]>([]);
  const [workRegimes, setWorkRegimes] = useState<any[]>([]);
  const [contractNatures, setContractNatures] = useState<any[]>([]);
  const [costCentersOptions, setCostCentersOptions] = useState<any[]>([]);
  const [benefitTypes, setBenefitTypes] = useState<any[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      const [sitesRes, wrRes, cnRes, ccRes, benRes] = await Promise.all([
        siteService.getSites(),
        getWorkRegimes(),
        getContractNatures(),
        getCostCenters(),
        getBenefits(),
      ]);

      setSites(sitesRes);
      setWorkRegimes(wrRes);
      setContractNatures(cnRes);
      setCostCentersOptions(ccRes);
      setBenefitTypes(benRes);
    };

    loadData();
  }, [isOpen]);
  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNestedChange = (section: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleArrayChange = (
    section: string,
    index: number,
    field: string,
    value: any
  ) => {
    setFormData((prev) => {
      const arr = [...(prev as any)[section]];
      arr[index] = {
        ...arr[index],
        [field]: value,
      };
      return {
        ...prev,
        [section]: arr,
      };
    });
  };

  const addCostCenterRow = () => {
    setFormData((prev) => ({
      ...prev,
      cost_centers: [
        ...prev.cost_centers,
        {
          cost_center_id: null,
          weight_percent: "",
          from_date: "",
          note: "",
        },
      ],
    }));
  };

  const addBenefitRow = () => {
    setFormData((prev) => ({
      ...prev,
      benefits: [
        ...prev.benefits,
        {
          benefit_type: null,
          has_benefit: true,
          from_date: "",
          note: "",
        },
      ],
    }));
  };

  const setCompanyCar = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      company_car: {
        ...(prev.company_car || {
          car_model: "",
          plate: "",
          from_date: "",
          benefit_type: "",
          payroll_notes: "",
          note: "",
        }),
        [field]: value,
      },
    }));
  };

  const handleSiteChange = async (siteId: number) => {
    setFormData((prev) => ({
      ...prev,
      site_history: {
        ...prev.site_history,
        site_id: siteId,
      },
    }));

    if (!siteId) {
      setDepartments([]);
      setPreposti([]);
      return;
    }

    const [depsRes, prepostiRes] = await Promise.all([
      getDepartmentsBySite(siteId),
      getPrepostiBySite(siteId),
    ]);

    setDepartments(depsRes);
    setPreposti(prepostiRes);
  };

  const handleSubmit = async () => {
    try {
      const created = await createEmployee(formData);
      if (onCreated) onCreated(created);
      onClose();
    } catch (err) {
      console.error("Errore creazione dipendente", err);
      alert("Errore durante la creazione del dipendente");
    }
  };
  const renderStep = () => {
    switch (step) {
      case 1:
        // ANAGRAFICA + LUL + STATO BASE
        return (
          <div>
            <h3>Anagrafica</h3>
            <input
              type="text"
              placeholder="Nome"
              value={formData.first_name}
              onChange={(e) => handleChange("first_name", e.target.value)}
            />
            <input
              type="text"
              placeholder="Cognome"
              value={formData.last_name}
              onChange={(e) => handleChange("last_name", e.target.value)}
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
            <input
              type="text"
              placeholder="Telefono"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
            <input
              type="text"
              placeholder="Codice fiscale"
              value={formData.fiscal_code}
              onChange={(e) => handleChange("fiscal_code", e.target.value)}
            />
            <input
              type="text"
              placeholder="Genere"
              value={formData.gender}
              onChange={(e) => handleChange("gender", e.target.value)}
            />
            <input
              type="date"
              value={formData.birth_date}
              onChange={(e) => handleChange("birth_date", e.target.value)}
            />
            <input
              type="text"
              placeholder="Luogo di nascita"
              value={formData.birth_place}
              onChange={(e) => handleChange("birth_place", e.target.value)}
            />
            <input
              type="text"
              placeholder="Indirizzo"
              value={formData.address_street}
              onChange={(e) => handleChange("address_street", e.target.value)}
            />
            <input
              type="text"
              placeholder="Città"
              value={formData.address_city}
              onChange={(e) => handleChange("address_city", e.target.value)}
            />
            <input
              type="text"
              placeholder="CAP"
              value={formData.address_cap}
              onChange={(e) => handleChange("address_cap", e.target.value)}
            />

            <h4>LUL</h4>
            <input
              type="text"
              placeholder="ID LUL"
              value={formData.id_lul}
              onChange={(e) => handleChange("id_lul", e.target.value)}
            />

            <h4>Stato lavorativo</h4>
            <input
              type="date"
              value={formData.hire_date}
              onChange={(e) => handleChange("hire_date", e.target.value)}
            />
            <input
              type="date"
              value={formData.termination_date || ""}
              onChange={(e) => handleChange("termination_date", e.target.value)}
            />
            <label>
              Categoria protetta
              <input
                type="checkbox"
                checked={formData.is_protected_category}
                onChange={(e) =>
                  handleChange("is_protected_category", e.target.checked)
                }
              />
            </label>
            <label>
              Svantaggiato
              <input
                type="checkbox"
                checked={formData.is_disadvantaged}
                onChange={(e) =>
                  handleChange("is_disadvantaged", e.target.checked)
                }
              />
            </label>
          </div>
        );

      case 2:
        // CONTRATTO
        return (
          <div>
            <h3>Contratto</h3>
            <select
              value={formData.contract.work_regime_id || ""}
              onChange={(e) =>
                handleNestedChange("contract", "work_regime_id", Number(e.target.value))
              }
            >
              <option value="">Seleziona regime di lavoro</option>
              {workRegimes.map((wr) => (
                <option key={wr.id} value={wr.id}>
                  {wr.description || wr.code}
                </option>
              ))}
            </select>

            <select
              value={formData.contract.contract_nature_id || ""}
              onChange={(e) =>
                handleNestedChange("contract", "contract_nature_id", Number(e.target.value))
              }
            >
              <option value="">Seleziona natura contratto</option>
              {contractNatures.map((cn) => (
                <option key={cn.id} value={cn.id}>
                  {cn.description || cn.code}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={formData.contract.from_date}
              onChange={(e) =>
                handleNestedChange("contract", "from_date", e.target.value)
              }
            />
            <input
              type="number"
              placeholder="Ore settimanali"
              value={formData.contract.weekly_hours}
              onChange={(e) =>
                handleNestedChange("contract", "weekly_hours", e.target.value)
              }
            />
            <input
              type="number"
              step="0.01"
              placeholder="FTE"
              value={formData.contract.fte}
              onChange={(e) =>
                handleNestedChange("contract", "fte", e.target.value)
              }
            />
            <input
              type="text"
              placeholder="Fascia oraria"
              value={formData.contract.time_band}
              onChange={(e) =>
                handleNestedChange("contract", "time_band", e.target.value)
              }
            />
            <input
              type="text"
              placeholder="Tipo turno"
              value={formData.contract.shift_type}
              onChange={(e) =>
                handleNestedChange("contract", "shift_type", e.target.value)
              }
            />
            <textarea
              placeholder="Note contratto"
              value={formData.contract.note}
              onChange={(e) =>
                handleNestedChange("contract", "note", e.target.value)
              }
            />
          </div>
        );

      case 3:
        // COST CENTER
        return (
          <div>
            <h3>Cost center</h3>
            <button type="button" onClick={addCostCenterRow}>
              Aggiungi cost center
            </button>
            {formData.cost_centers.map((cc, index) => (
              <div key={index}>
                <select
                  value={cc.cost_center_id || ""}
                  onChange={(e) =>
                    handleArrayChange(
                      "cost_centers",
                      index,
                      "cost_center_id",
                      Number(e.target.value)
                    )
                  }
                >
                  <option value="">Seleziona cost center</option>
                  {costCentersOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name || c.code}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="% peso"
                  value={cc.weight_percent}
                  onChange={(e) =>
                    handleArrayChange(
                      "cost_centers",
                      index,
                      "weight_percent",
                      e.target.value
                    )
                  }
                />
                <input
                  type="date"
                  value={cc.from_date}
                  onChange={(e) =>
                    handleArrayChange(
                      "cost_centers",
                      index,
                      "from_date",
                      e.target.value
                    )
                  }
                />
                <input
                  type="text"
                  placeholder="Note"
                  value={cc.note}
                  onChange={(e) =>
                    handleArrayChange(
                      "cost_centers",
                      index,
                      "note",
                      e.target.value
                    )
                  }
                />
              </div>
            ))}
          </div>
        );

      case 4:
        // SITO + REPARTO + PREPOSTO
        return (
          <div>
            <h3>Sito e reparto</h3>
            <select
              value={formData.site_history.site_id || ""}
              onChange={(e) => handleSiteChange(Number(e.target.value))}
            >
              <option value="">Seleziona sito</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name || s.code}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={formData.site_history.from_date}
              onChange={(e) =>
                handleNestedChange("site_history", "from_date", e.target.value)
              }
            />
            <input
              type="text"
              placeholder="Note sito"
              value={formData.site_history.note}
              onChange={(e) =>
                handleNestedChange("site_history", "note", e.target.value)
              }
            />

            <h4>Reparto</h4>
            <select
              value={formData.department.department_id || ""}
              onChange={(e) =>
                handleNestedChange(
                  "department",
                  "department_id",
                  Number(e.target.value)
                )
              }
            >
              <option value="">Seleziona reparto</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name || d.code}
                </option>
              ))}
            </select>

            <select
              value={formData.department.manager_employee_id || ""}
              onChange={(e) =>
                handleNestedChange(
                  "department",
                  "manager_employee_id",
                  Number(e.target.value)
                )
              }
            >
              <option value="">Seleziona preposto</option>
              {preposti.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.last_name} {p.first_name}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={formData.department.from_date}
              onChange={(e) =>
                handleNestedChange("department", "from_date", e.target.value)
              }
            />
            <input
              type="text"
              placeholder="Note reparto"
              value={formData.department.note}
              onChange={(e) =>
                handleNestedChange("department", "note", e.target.value)
              }
            />
          </div>
        );
      case 5:
        // RAL + BENEFIT + AUTO
        return (
          <div>
            <h3>RAL</h3>
            <input
              type="number"
              placeholder="RAL"
              value={formData.salary.ral_amount}
              onChange={(e) =>
                handleNestedChange("salary", "ral_amount", e.target.value)
              }
            />
            <input
              type="date"
              value={formData.salary.from_date}
              onChange={(e) =>
                handleNestedChange("salary", "from_date", e.target.value)
              }
            />
            <input
              type="text"
              placeholder="Note RAL"
              value={formData.salary.note}
              onChange={(e) =>
                handleNestedChange("salary", "note", e.target.value)
              }
            />

            <h3>Benefit</h3>
            <button type="button" onClick={addBenefitRow}>
              Aggiungi benefit
            </button>
            {formData.benefits.map((b, index) => (
              <div key={index}>
                <select
                  value={b.benefit_type || ""}
                  onChange={(e) =>
                    handleArrayChange(
                      "benefits",
                      index,
                      "benefit_type",
                      e.target.value
                    )
                  }
                >
                  <option value="">Seleziona benefit</option>
                  {benefitTypes.map((bt) => (
                    <option key={bt.id} value={bt.code}>
                      {bt.description || bt.code}
                    </option>
                  ))}
                </select>
                <label>
                  Attivo
                  <input
                    type="checkbox"
                    checked={b.has_benefit}
                    onChange={(e) =>
                      handleArrayChange(
                        "benefits",
                        index,
                        "has_benefit",
                        e.target.checked
                      )
                    }
                  />
                </label>
                <input
                  type="date"
                  value={b.from_date}
                  onChange={(e) =>
                    handleArrayChange(
                      "benefits",
                      index,
                      "from_date",
                      e.target.value
                    )
                  }
                />
                <input
                  type="text"
                  placeholder="Note"
                  value={b.note}
                  onChange={(e) =>
                    handleArrayChange(
                      "benefits",
                      index,
                      "note",
                      e.target.value
                    )
                  }
                />
              </div>
            ))}

            <h3>Auto aziendale</h3>
            <input
              type="text"
              placeholder="Modello auto"
              value={formData.company_car?.car_model || ""}
              onChange={(e) => setCompanyCar("car_model", e.target.value)}
            />
            <input
              type="text"
              placeholder="Targa"
              value={formData.company_car?.plate || ""}
              onChange={(e) => setCompanyCar("plate", e.target.value)}
            />
            <input
              type="date"
              value={formData.company_car?.from_date || ""}
              onChange={(e) => setCompanyCar("from_date", e.target.value)}
            />
            <input
              type="text"
              placeholder="Tipo benefit"
              value={formData.company_car?.benefit_type || ""}
              onChange={(e) => setCompanyCar("benefit_type", e.target.value)}
            />
            <input
              type="text"
              placeholder="Note payroll"
              value={formData.company_car?.payroll_notes || ""}
              onChange={(e) => setCompanyCar("payroll_notes", e.target.value)}
            />
            <input
              type="text"
              placeholder="Note auto"
              value={formData.company_car?.note || ""}
              onChange={(e) => setCompanyCar("note", e.target.value)}
            />
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Nuovo dipendente</h2>

        {renderStep()}

        <div className="modal-footer">
          <button type="button" onClick={onClose}>
            Annulla
          </button>

          {step > 1 && (
            <button type="button" onClick={() => setStep(step - 1)}>
              Indietro
            </button>
          )}

          {step < 5 && (
            <button type="button" onClick={() => setStep(step + 1)}>
              Avanti
            </button>
          )}

          {step === 5 && (
            <button type="button" onClick={handleSubmit}>
              Conferma creazione
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeCreateModal;
