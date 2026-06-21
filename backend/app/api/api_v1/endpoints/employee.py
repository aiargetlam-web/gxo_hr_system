from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db

# MODELLI SQLALCHEMY
from app.models.employee import Employee as EmployeeModel
from app.models.employee_contracts import EmployeeContract
from app.models.employee_cost_centers import EmployeeCostCenter
from app.models.employee_departments import EmployeeDepartment
from app.models.employee_salaries import EmployeeSalary
from app.models.employee_company_cars import EmployeeCompanyCar
from app.models.employee_enac_courses import EmployeeEnacCourse
from app.models.employee_enac_approvals import EmployeeEnacApproval
from app.models.employee_status_history import EmployeeStatusHistory
from app.models.employee_site_history import EmployeeSiteHistory
from app.models.employee_benefits import EmployeeBenefit

# SCHEMA Pydantic
from app.schemas.employee import (
    EmployeeCreate,
    Employee,
    ContractCreate,
    CostCenterAssignmentCreate,
    DepartmentAssignmentCreate,
    SalaryCreate,
    SiteAssignmentCreate,
    CompanyCarCreate,
)

router = APIRouter()


# ============================================================
# CREATE EMPLOYEE COMPLETO
# ============================================================

@router.post("/employees", response_model=Employee)
def create_employee(payload: EmployeeCreate, db: Session = Depends(get_db)):

    try:
        # 1) Dipendente base
        employee = EmployeeModel(
            first_name=payload.first_name,
            last_name=payload.last_name,
            email=payload.email,
            phone=payload.phone,
            fiscal_code=payload.fiscal_code,
            gender=payload.gender,
            birth_date=payload.birth_date,
            birth_place=payload.birth_place,
            address_street=payload.address_street,
            address_city=payload.address_city,
            address_cap=payload.address_cap,
            lul_id=payload.lul_id,
            role_id=payload.role_id,
            current_site_id=payload.current_site_id,
            hire_date=payload.hire_date,
            termination_date=payload.termination_date,
            is_protected_category=payload.is_protected_category,
            is_disadvantaged=payload.is_disadvantaged,
        )

        db.add(employee)
        db.flush()  # otteniamo employee.id

        # 2) Contratto iniziale
        contract = EmployeeContract(
            employee_id=employee.id,
            work_regime_id=payload.contract.work_regime_id,
            contract_nature_id=payload.contract.contract_nature_id,
            from_date=payload.contract.from_date,
            weekly_hours=payload.contract.weekly_hours,
            fte=payload.contract.fte,
            time_band=payload.contract.time_band,
            shift_type=payload.contract.shift_type,
            note=payload.contract.note,
        )
        db.add(contract)

        # 3) Cost center iniziali
        for cc in payload.cost_centers:
            db.add(EmployeeCostCenter(
                employee_id=employee.id,
                cost_center_id=cc.cost_center_id,
                weight_percent=cc.weight_percent,
                from_date=cc.from_date,
                note=cc.note
            ))

        # 4) Reparto + responsabile
        department = EmployeeDepartment(
            employee_id=employee.id,
            department_id=payload.department.department_id,
            manager_employee_id=payload.department.manager_employee_id,
            from_date=payload.department.from_date,
            note=payload.department.note
        )
        db.add(department)

        # 5) RAL iniziale
        salary = EmployeeSalary(
            employee_id=employee.id,
            ral_amount=payload.salary.ral_amount,
            from_date=payload.salary.from_date,
            note=payload.salary.note
        )
        db.add(salary)

        # 6) Sito iniziale (storico)
        site_history = EmployeeSiteHistory(
            employee_id=employee.id,
            site_id=payload.site_history.site_id,
            from_date=payload.site_history.from_date,
            note=payload.site_history.note
        )
        db.add(site_history)

        # 7) Benefici iniziali
        for b in payload.benefits:
            db.add(EmployeeBenefit(
                employee_id=employee.id,
                benefit_type=b.benefit_type,
                has_benefit=b.has_benefit,
                from_date=b.from_date,
                note=b.note
            ))

        # 8) Auto aziendale (opzionale)
        if payload.company_car:
            db.add(EmployeeCompanyCar(
                employee_id=employee.id,
                car_model=payload.company_car.car_model,
                plate=payload.company_car.plate,
                from_date=payload.company_car.from_date,
                benefit_type=payload.company_car.benefit_type,
                payroll_notes=payload.company_car.payroll_notes,
                note=payload.company_car.note
            ))

        # 9) Stato lavorativo iniziale = ATTIVO (id=1)
        status = EmployeeStatusHistory(
            employee_id=employee.id,
            status_type_id=1,
            from_date=payload.hire_date or payload.contract.from_date,
            note="Stato iniziale"
        )
        db.add(status)

        db.commit()
        db.refresh(employee)
        return employee

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Errore creazione dipendente: {str(e)}")


# ============================================================
# NUOVO CONTRATTO
# ============================================================

@router.post("/employees/{employee_id}/contracts")
def add_contract(
    employee_id: int,
    payload: ContractCreate,
    db: Session = Depends(get_db)
):
    employee = db.query(EmployeeModel).filter(EmployeeModel.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Dipendente non trovato")

    try:
        current_contract = (
            db.query(EmployeeContract)
            .filter(
                EmployeeContract.employee_id == employee_id,
                EmployeeContract.to_date.is_(None)
            )
            .first()
        )

        if current_contract:
            current_contract.to_date = payload.from_date - timedelta(days=1)
            db.add(current_contract)

        new_contract = EmployeeContract(
            employee_id=employee_id,
            work_regime_id=payload.work_regime_id,
            contract_nature_id=payload.contract_nature_id,
            from_date=payload.from_date,
            weekly_hours=payload.weekly_hours,
            fte=payload.fte,
            time_band=payload.time_band,
            shift_type=payload.shift_type,
            note=payload.note
        )

        db.add(new_contract)
        db.commit()
        db.refresh(new_contract)

        return {
            "message": "Nuovo contratto aggiunto con successo",
            "contract": new_contract
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Errore durante l'inserimento del contratto: {str(e)}")


# ============================================================
# NUOVO COST CENTER (aggiunta di una nuova riga)
# ============================================================

@router.post("/employees/{employee_id}/cost-centers")
def add_cost_center(
    employee_id: int,
    payload: CostCenterAssignmentCreate,
    db: Session = Depends(get_db)
):
    employee = db.query(EmployeeModel).filter(EmployeeModel.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Dipendente non trovato")

    try:
        new_cc = EmployeeCostCenter(
            employee_id=employee_id,
            cost_center_id=payload.cost_center_id,
            weight_percent=payload.weight_percent,
            from_date=payload.from_date,
            note=payload.note
        )

        db.add(new_cc)
        db.commit()
        db.refresh(new_cc)

        return {
            "message": "Nuovo cost center aggiunto con successo",
            "cost_center": new_cc
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Errore durante l'inserimento del cost center: {str(e)}")


# ============================================================
# NUOVO REPARTO / RESPONSABILE
# ============================================================

@router.post("/employees/{employee_id}/departments")
def add_department(
    employee_id: int,
    payload: DepartmentAssignmentCreate,
    db: Session = Depends(get_db)
):
    employee = db.query(EmployeeModel).filter(EmployeeModel.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Dipendente non trovato")

    try:
        current_dep = (
            db.query(EmployeeDepartment)
            .filter(
                EmployeeDepartment.employee_id == employee_id,
                EmployeeDepartment.to_date.is_(None)
            )
            .first()
        )

        if current_dep:
            current_dep.to_date = payload.from_date - timedelta(days=1)
            db.add(current_dep)

        new_dep = EmployeeDepartment(
            employee_id=employee_id,
            department_id=payload.department_id,
            manager_employee_id=payload.manager_employee_id,
            from_date=payload.from_date,
            note=payload.note
        )

        db.add(new_dep)
        db.commit()
        db.refresh(new_dep)

        return {
            "message": "Nuovo reparto assegnato con successo",
            "department": new_dep
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Errore durante l'inserimento del reparto: {str(e)}")


# ============================================================
# NUOVA RAL
# ============================================================

@router.post("/employees/{employee_id}/salaries")
def add_salary(
    employee_id: int,
    payload: SalaryCreate,
    db: Session = Depends(get_db)
):
    employee = db.query(EmployeeModel).filter(EmployeeModel.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Dipendente non trovato")

    try:
        current_salary = (
            db.query(EmployeeSalary)
            .filter(
                EmployeeSalary.employee_id == employee_id,
                EmployeeSalary.to_date.is_(None)
            )
            .first()
        )

        if current_salary:
            current_salary.to_date = payload.from_date - timedelta(days=1)
            db.add(current_salary)

        new_salary = EmployeeSalary(
            employee_id=employee_id,
            ral_amount=payload.ral_amount,
            from_date=payload.from_date,
            note=payload.note
        )

        db.add(new_salary)
        db.commit()
        db.refresh(new_salary)

        return {
            "message": "Nuova RAL inserita con successo",
            "salary": new_salary
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Errore durante l'inserimento della RAL: {str(e)}")


# ============================================================
# NUOVA AUTO AZIENDALE
# ============================================================

@router.post("/employees/{employee_id}/company-cars")
def add_company_car(
    employee_id: int,
    payload: CompanyCarCreate,
    db: Session = Depends(get_db)
):
    employee = db.query(EmployeeModel).filter(EmployeeModel.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Dipendente non trovato")

    try:
        current_car = (
            db.query(EmployeeCompanyCar)
            .filter(
                EmployeeCompanyCar.employee_id == employee_id,
                EmployeeCompanyCar.to_date.is_(None)
            )
            .first()
        )

        if current_car:
            current_car.to_date = payload.from_date - timedelta(days=1)
            db.add(current_car)

        new_car = EmployeeCompanyCar(
            employee_id=employee_id,
            car_model=payload.car_model,
            plate=payload.plate,
            from_date=payload.from_date,
            benefit_type=payload.benefit_type,
            payroll_notes=payload.payroll_notes,
            note=payload.note
        )

        db.add(new_car)
        db.commit()
        db.refresh(new_car)

        return {
            "message": "Nuova auto aziendale assegnata con successo",
            "company_car": new_car
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Errore durante l'inserimento dell'auto aziendale: {str(e)}")


# ============================================================
# CAMBIO SITO (STORICO)
# ============================================================

@router.post("/employees/{employee_id}/sites")
def change_site(
    employee_id: int,
    payload: SiteAssignmentCreate,
    db: Session = Depends(get_db)
):
    employee = db.query(EmployeeModel).filter(EmployeeModel.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Dipendente non trovato")

    try:
        current_site_hist = (
            db.query(EmployeeSiteHistory)
            .filter(
                EmployeeSiteHistory.employee_id == employee_id,
                EmployeeSiteHistory.to_date.is_(None)
            )
            .first()
        )

        if current_site_hist:
            current_site_hist.to_date = payload.from_date - timedelta(days=1)
            db.add(current_site_hist)

        new_site_hist = EmployeeSiteHistory(
            employee_id=employee_id,
            site_id=payload.site_id,
            from_date=payload.from_date,
            note=payload.note
        )
        db.add(new_site_hist)

        # aggiorna sito corrente in employees
        employee.current_site_id = payload.site_id
        db.add(employee)

        db.commit()
        db.refresh(new_site_hist)

        return {
            "message": "Cambio sito registrato con successo",
            "site_history": new_site_hist
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Errore durante il cambio sito: {str(e)}")


# ============================================================
# CAMBIO STATO LAVORATIVO
# ============================================================

@router.post("/employees/{employee_id}/status")
def change_status(
    employee_id: int,
    status_type_id: int,
    from_date: date,
    note: str | None = None,
    db: Session = Depends(get_db)
):
    employee = db.query(EmployeeModel).filter(EmployeeModel.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Dipendente non trovato")

    try:
        current_status = (
            db.query(EmployeeStatusHistory)
            .filter(
                EmployeeStatusHistory.employee_id == employee_id,
                EmployeeStatusHistory.to_date.is_(None)
            )
            .first()
        )

        if current_status:
            current_status.to_date = from_date - timedelta(days=1)
            db.add(current_status)

        new_status = EmployeeStatusHistory(
            employee_id=employee_id,
            status_type_id=status_type_id,
            from_date=from_date,
            note=note
        )

        db.add(new_status)
        db.commit()
        db.refresh(new_status)

        return {
            "message": "Cambio stato lavorativo registrato con successo",
            "status": new_status
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Errore durante il cambio stato lavorativo: {str(e)}")


# ============================================================
# 📌 GET LISTA DIPENDENTI
# NOTE: restituisce tutti i dipendenti con i campi base
# ============================================================

@router.get("/employees", response_model=list[Employee])
def list_employees(db: Session = Depends(get_db)):
    employees = db.query(EmployeeModel).all()
    return employees



# ============================================================
# 📌 GET DETTAGLIO DIPENDENTE
# NOTE: restituisce il dipendente completo (senza storici)
# ============================================================

@router.get("/employees/{employee_id}", response_model=Employee)
def get_employee(employee_id: int, db: Session = Depends(get_db)):
    employee = db.query(EmployeeModel).filter(EmployeeModel.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Dipendente non trovato")
    return employee



# ============================================================
# 📌 GET STORICO CONTRATTI
# NOTE: restituisce tutti i contratti, ordinati dal più recente
# ============================================================

@router.get("/employees/{employee_id}/contracts")
def get_contracts(employee_id: int, db: Session = Depends(get_db)):
    contracts = (
        db.query(EmployeeContract)
        .filter(EmployeeContract.employee_id == employee_id)
        .order_by(EmployeeContract.from_date.desc())
        .all()
    )
    return contracts



# ============================================================
# 📌 GET STORICO COST CENTER
# NOTE: restituisce tutti i CDC assegnati nel tempo
# ============================================================

@router.get("/employees/{employee_id}/cost-centers")
def get_cost_centers(employee_id: int, db: Session = Depends(get_db)):
    ccs = (
        db.query(EmployeeCostCenter)
        .filter(EmployeeCostCenter.employee_id == employee_id)
        .order_by(EmployeeCostCenter.from_date.desc())
        .all()
    )
    return ccs



# ============================================================
# 📌 GET STORICO REPARTI
# NOTE: restituisce tutti i reparti e responsabili avuti
# ============================================================

@router.get("/employees/{employee_id}/departments")
def get_departments(employee_id: int, db: Session = Depends(get_db)):
    deps = (
        db.query(EmployeeDepartment)
        .filter(EmployeeDepartment.employee_id == employee_id)
        .order_by(EmployeeDepartment.from_date.desc())
        .all()
    )
    return deps



# ============================================================
# 📌 GET STORICO RAL
# NOTE: restituisce tutte le RAL nel tempo
# ============================================================

@router.get("/employees/{employee_id}/salaries")
def get_salaries(employee_id: int, db: Session = Depends(get_db)):
    salaries = (
        db.query(EmployeeSalary)
        .filter(EmployeeSalary.employee_id == employee_id)
        .order_by(EmployeeSalary.from_date.desc())
        .all()
    )
    return salaries



# ============================================================
# 📌 GET STORICO AUTO AZIENDALI
# NOTE: restituisce tutte le auto assegnate nel tempo
# ============================================================

@router.get("/employees/{employee_id}/company-cars")
def get_company_cars(employee_id: int, db: Session = Depends(get_db)):
    cars = (
        db.query(EmployeeCompanyCar)
        .filter(EmployeeCompanyCar.employee_id == employee_id)
        .order_by(EmployeeCompanyCar.from_date.desc())
        .all()
    )
    return cars



# ============================================================
# 📌 GET STORICO SITI
# NOTE: restituisce tutti i siti in cui ha lavorato
# ============================================================

@router.get("/employees/{employee_id}/sites")
def get_sites(employee_id: int, db: Session = Depends(get_db)):
    sites = (
        db.query(EmployeeSiteHistory)
        .filter(EmployeeSiteHistory.employee_id == employee_id)
        .order_by(EmployeeSiteHistory.from_date.desc())
        .all()
    )
    return sites



# ============================================================
# 📌 GET STORICO STATI LAVORATIVI
# NOTE: restituisce tutti gli stati (attivo, sospeso, cessato…)
# ============================================================

@router.get("/employees/{employee_id}/status")
def get_status_history(employee_id: int, db: Session = Depends(get_db)):
    statuses = (
        db.query(EmployeeStatusHistory)
        .filter(EmployeeStatusHistory.employee_id == employee_id)
        .order_by(EmployeeStatusHistory.from_date.desc())
        .all()
    )
    return statuses



# ============================================================
# 📌 GET STATO ATTUALE COMPLETO
# NOTE: restituisce contratto attuale, RAL attuale, reparto attuale,
#       sito attuale, auto attuale, CDC attuali, stato lavorativo attuale
# ============================================================

@router.get("/employees/{employee_id}/current")
def get_current_status(employee_id: int, db: Session = Depends(get_db)):

    employee = db.query(EmployeeModel).filter(EmployeeModel.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Dipendente non trovato")

    current_contract = (
        db.query(EmployeeContract)
        .filter(EmployeeContract.employee_id == employee_id, EmployeeContract.to_date.is_(None))
        .first()
    )

    current_cc = (
        db.query(EmployeeCostCenter)
        .filter(EmployeeCostCenter.employee_id == employee_id, EmployeeCostCenter.to_date.is_(None))
        .all()
    )

    current_dep = (
        db.query(EmployeeDepartment)
        .filter(EmployeeDepartment.employee_id == employee_id, EmployeeDepartment.to_date.is_(None))
        .first()
    )

    current_salary = (
        db.query(EmployeeSalary)
        .filter(EmployeeSalary.employee_id == employee_id, EmployeeSalary.to_date.is_(None))
        .first()
    )

    current_car = (
        db.query(EmployeeCompanyCar)
        .filter(EmployeeCompanyCar.employee_id == employee_id, EmployeeCompanyCar.to_date.is_(None))
        .first()
    )

    current_site = (
        db.query(EmployeeSiteHistory)
        .filter(EmployeeSiteHistory.employee_id == employee_id, EmployeeSiteHistory.to_date.is_(None))
        .first()
    )

    current_status = (
        db.query(EmployeeStatusHistory)
        .filter(EmployeeStatusHistory.employee_id == employee_id, EmployeeStatusHistory.to_date.is_(None))
        .first()
    )

    return {
        "employee": employee,
        "contract": current_contract,
        "cost_centers": current_cc,
        "department": current_dep,
        "salary": current_salary,
        "company_car": current_car,
        "site": current_site,
        "status": current_status,
    }
# ============================================================
# UPDATE ANAGRAFICA DIPENDENTE
# ============================================================

from app.schemas.employee import (
    EmployeeUpdate,
    ContractUpdate,
    SalaryUpdate,
    DepartmentUpdate,
    CostCenterUpdate,
    SiteUpdate,
    StatusUpdate,
    CompanyCarUpdate,
)

@router.put("/employees/{employee_id}", response_model=Employee)
def update_employee(employee_id: int, payload: EmployeeUpdate, db: Session = Depends(get_db)):
    employee = db.query(EmployeeModel).filter(EmployeeModel.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Dipendente non trovato")

    try:
        for field, value in payload.dict(exclude_unset=True).items():
            setattr(employee, field, value)

        db.commit()
        db.refresh(employee)
        return employee

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Errore aggiornamento dipendente: {str(e)}")


# ============================================================
# UPDATE CONTRATTO ATTUALE
# ============================================================

@router.put("/employees/{employee_id}/contracts/current")
def update_current_contract(employee_id: int, payload: ContractUpdate, db: Session = Depends(get_db)):
    contract = (
        db.query(EmployeeContract)
        .filter(EmployeeContract.employee_id == employee_id, EmployeeContract.to_date.is_(None))
        .first()
    )

    if not contract:
        raise HTTPException(status_code=404, detail="Nessun contratto attivo trovato")

    try:
        for field, value in payload.dict(exclude_unset=True).items():
            setattr(contract, field, value)

        db.commit()
        db.refresh(contract)
        return contract

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Errore aggiornamento contratto: {str(e)}")


# ============================================================
# UPDATE RAL ATTUALE
# ============================================================

@router.put("/employees/{employee_id}/salaries/current")
def update_current_salary(employee_id: int, payload: SalaryUpdate, db: Session = Depends(get_db)):
    salary = (
        db.query(EmployeeSalary)
        .filter(EmployeeSalary.employee_id == employee_id, EmployeeSalary.to_date.is_(None))
        .first()
    )

    if not salary:
        raise HTTPException(status_code=404, detail="Nessuna RAL attiva trovata")

    try:
        for field, value in payload.dict(exclude_unset=True).items():
            setattr(salary, field, value)

        db.commit()
        db.refresh(salary)
        return salary

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Errore aggiornamento RAL: {str(e)}")


# ============================================================
# UPDATE REPARTO ATTUALE
# ============================================================

@router.put("/employees/{employee_id}/departments/current")
def update_current_department(employee_id: int, payload: DepartmentUpdate, db: Session = Depends(get_db)):
    dep = (
        db.query(EmployeeDepartment)
        .filter(EmployeeDepartment.employee_id == employee_id, EmployeeDepartment.to_date.is_(None))
        .first()
    )

    if not dep:
        raise HTTPException(status_code=404, detail="Nessun reparto attivo trovato")

    try:
        for field, value in payload.dict(exclude_unset=True).items():
            setattr(dep, field, value)

        db.commit()
        db.refresh(dep)
        return dep

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Errore aggiornamento reparto: {str(e)}")


# ============================================================
# UPDATE COST CENTER ATTIVI
# ============================================================

@router.put("/employees/{employee_id}/cost-centers/current")
def update_current_cost_centers(employee_id: int, payload: CostCenterUpdate, db: Session = Depends(get_db)):
    cc = (
        db.query(EmployeeCostCenter)
        .filter(
            EmployeeCostCenter.employee_id == employee_id,
            EmployeeCostCenter.id == payload.id,          # <--- AGGIUNTO
            EmployeeCostCenter.to_date.is_(None)
        )
        .first()
    )

    if not cc:
        raise HTTPException(status_code=404, detail="Cost center attivo non trovato")

    try:
        for field, value in payload.dict(exclude_unset=True).items():
            if field != "id":                             # <--- NON aggiorniamo l'id
                setattr(cc, field, value)

        db.commit()
        db.refresh(cc)
        return cc

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Errore aggiornamento cost center: {str(e)}")


# ============================================================
# UPDATE SITO ATTUALE
# ============================================================

@router.put("/employees/{employee_id}/sites/current")
def update_current_site(employee_id: int, payload: SiteUpdate, db: Session = Depends(get_db)):
    site = (
        db.query(EmployeeSiteHistory)
        .filter(EmployeeSiteHistory.employee_id == employee_id, EmployeeSiteHistory.to_date.is_(None))
        .first()
    )

    if not site:
        raise HTTPException(status_code=404, detail="Nessun sito attivo trovato")

    try:
        for field, value in payload.dict(exclude_unset=True).items():
            setattr(site, field, value)

        db.commit()
        db.refresh(site)
        return site

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Errore aggiornamento sito: {str(e)}")


# ============================================================
# UPDATE STATO LAVORATIVO ATTUALE
# ============================================================

@router.put("/employees/{employee_id}/status/current")
def update_current_status(employee_id: int, payload: StatusUpdate, db: Session = Depends(get_db)):
    status = (
        db.query(EmployeeStatusHistory)
        .filter(EmployeeStatusHistory.employee_id == employee_id, EmployeeStatusHistory.to_date.is_(None))
        .first()
    )

    if not status:
        raise HTTPException(status_code=404, detail="Nessuno stato attivo trovato")

    try:
        for field, value in payload.dict(exclude_unset=True).items():
            setattr(status, field, value)

        db.commit()
        db.refresh(status)
        return status

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Errore aggiornamento stato: {str(e)}")


# ============================================================
# UPDATE AUTO AZIENDALE ATTIVA
# ============================================================

@router.put("/employees/{employee_id}/company-cars/current")
def update_current_company_car(employee_id: int, payload: CompanyCarUpdate, db: Session = Depends(get_db)):
    car = (
        db.query(EmployeeCompanyCar)
        .filter(EmployeeCompanyCar.employee_id == employee_id, EmployeeCompanyCar.to_date.is_(None))
        .first()
    )

    if not car:
        raise HTTPException(status_code=404, detail="Nessuna auto aziendale attiva trovata")

    try:
        for field, value in payload.dict(exclude_unset=True).items():
            setattr(car, field, value)

        db.commit()
        db.refresh(car)
        return car

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Errore aggiornamento auto aziendale: {str(e)}")
