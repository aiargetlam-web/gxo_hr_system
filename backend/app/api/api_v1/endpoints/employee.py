from datetime import timedelta, date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db

# Schemi Pydantic
from app.schemas.employee import (
    EmployeeCreate,
    Employee,
    ContractCreate,
    CostCenterAssignmentCreate,
    DepartmentAssignmentCreate,
    SalaryCreate,
    SiteAssignmentCreate,
    CompanyCarCreate,
    EmployeeUpdate,
    ContractUpdate,
    SalaryUpdate,
    DepartmentUpdate,
    CostCenterUpdate,
    SiteUpdate,
    StatusUpdate,
    CompanyCarUpdate,
)

router = APIRouter()

# ============================================================
# CREATE EMPLOYEE COMPLETO
# ============================================================

@router.post("/employees", response_model=Employee)
def create_employee(payload: EmployeeCreate, db: Session = Depends(get_db)):
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

    try:
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
        db.flush()

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

        for cc in payload.cost_centers:
            db.add(EmployeeCostCenter(
                employee_id=employee.id,
                cost_center_id=cc.cost_center_id,
                weight_percent=cc.weight_percent,
                from_date=cc.from_date,
                note=cc.note
            ))

        department = EmployeeDepartment(
            employee_id=employee.id,
            department_id=payload.department.department_id,
            manager_employee_id=payload.department.manager_employee_id,
            from_date=payload.department.from_date,
            note=payload.department.note
        )
        db.add(department)

        salary = EmployeeSalary(
            employee_id=employee.id,
            ral_amount=payload.salary.ral_amount,
            from_date=payload.salary.from_date,
            note=payload.salary.note
        )
        db.add(salary)

        site_history = EmployeeSiteHistory(
            employee_id=employee.id,
            site_id=payload.site_history.site_id,
            from_date=payload.site_history.from_date,
            note=payload.site_history.note
        )
        db.add(site_history)

        for b in payload.benefits:
            db.add(EmployeeBenefit(
                employee_id=employee.id,
                benefit_type=b.benefit_type,
                has_benefit=b.has_benefit,
                from_date=b.from_date,
                note=b.note
            ))

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
def add_contract(employee_id: int, payload: ContractCreate, db: Session = Depends(get_db)):
    from app.models.employee import Employee as EmployeeModel
    from app.models.employee_contracts import EmployeeContract

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

        return {"message": "Nuovo contratto aggiunto con successo", "contract": new_contract}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Errore durante l'inserimento del contratto: {str(e)}")


# ============================================================
# NUOVO COST CENTER
# ============================================================

@router.post("/employees/{employee_id}/cost-centers")
def add_cost_center(employee_id: int, payload: CostCenterAssignmentCreate, db: Session = Depends(get_db)):
    from app.models.employee import Employee as EmployeeModel
    from app.models.employee_cost_centers import EmployeeCostCenter

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

        return {"message": "Nuovo cost center aggiunto con successo", "cost_center": new_cc}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Errore durante l'inserimento del cost center: {str(e)}")


# ============================================================
# NUOVO REPARTO
# ============================================================

@router.post("/employees/{employee_id}/departments")
def add_department(employee_id: int, payload: DepartmentAssignmentCreate, db: Session = Depends(get_db)):
    from app.models.employee import Employee as EmployeeModel
    from app.models.employee_departments import EmployeeDepartment

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

        return {"message": "Nuovo reparto assegnato con successo", "department": new_dep}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Errore durante l'inserimento del reparto: {str(e)}")


# ============================================================
# NUOVA RAL
# ============================================================

@router.post("/employees/{employee_id}/salaries")
def add_salary(employee_id: int, payload: SalaryCreate, db: Session = Depends(get_db)):
    from app.models.employee import Employee as EmployeeModel
    from app.models.employee_salaries import EmployeeSalary

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

        return {"message": "Nuova RAL inserita con successo", "salary": new_salary}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Errore durante l'inserimento della RAL: {str(e)}")


# ============================================================
# NUOVA AUTO AZIENDALE
# ============================================================

@router.post("/employees/{employee_id}/company-cars")
def add_company_car(employee_id: int, payload: CompanyCarCreate, db: Session = Depends(get_db)):
    from app.models.employee import Employee as EmployeeModel
    from app.models.employee_company_cars import EmployeeCompanyCar

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

        return {"message": "Nuova auto aziendale assegnata con successo", "company_car": new_car}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Errore durante l'inserimento dell'auto aziendale: {str(e)}")


# ============================================================
# CAMBIO SITO
# ============================================================

@router.post("/employees/{employee_id}/sites")
def change_site(employee_id: int, payload: SiteAssignmentCreate, db: Session = Depends(get_db)):
    from app.models.employee import Employee as EmployeeModel
    from app.models.employee_site_history import EmployeeSiteHistory

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

        employee.current_site_id = payload.site_id
        db.add(employee)

        db.commit()
        db.refresh(new_site_hist)

        return {"message": "Cambio sito registrato con successo", "site_history": new_site_hist}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Errore durante il cambio sito: {str(e)}")


# ============================================================
# CAMBIO STATO LAVORATIVO
# ============================================================

@router.post("/employees/{employee_id}/status")
def change_status(employee_id: int, status_type_id: int, from_date: date, note: str | None = None, db: Session = Depends(get_db)):
    from app.models.employee import Employee as EmployeeModel
    from app.models.employee_status_history import EmployeeStatusHistory

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

        return {"message": "Cambio stato lavorativo registrato con successo", "status": new_status}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Errore durante il cambio stato lavorativo: {str(e)}")


# ============================================================
# GET LISTA DIPENDENTI
# ============================================================

@router.get("/employees", response_model=list[Employee])
def list_employees(db: Session = Depends(get_db)):
    from app.models.employee import Employee as EmployeeModel

    employees = db.query(EmployeeModel).all()
    return employees


# ============================================================
# GET DETTAGLIO DIPENDENTE
# ============================================================

@router.get("/employees/{employee_id}", response_model=Employee)
def get_employee(employee_id: int, db: Session = Depends(get_db)):
    from app.models.employee import Employee as EmployeeModel

    employee = db.query(EmployeeModel).filter(EmployeeModel.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Dipendente non trovato")
    return employee


# ============================================================
# GET STORICO CONTRATTI
# ============================================================

@router.get("/employees/{employee_id}/contracts")
def get_contracts(employee_id: int, db: Session = Depends(get_db)):
    from app.models.employee_contracts import EmployeeContract

    contracts = (
        db.query(EmployeeContract)
        .filter(EmployeeContract.employee_id == employee_id)
        .order_by(EmployeeContract.from_date.desc())
        .all()
    )
    return contracts


# ============================================================
# GET STORICO COST CENTER
# ============================================================

@router.get("/employees/{employee_id}/cost-centers")
def get_cost_centers(employee_id: int, db: Session = Depends(get_db)):
    from app.models.employee_cost_centers import EmployeeCostCenter

    ccs = (
        db.query(EmployeeCostCenter)
        .filter(EmployeeCostCenter.employee_id == employee_id)
        .order_by(EmployeeCostCenter.from_date.desc())
        .all()
    )
    return ccs


# ============================================================
# GET STORICO REPARTI
# ============================================================

@router.get("/employees/{employee_id}/departments")
def get_departments(employee_id: int, db: Session = Depends(get_db)):
    from app.models.employee_departments import EmployeeDepartment

    deps = (
        db.query(EmployeeDepartment)
        .filter(EmployeeDepartment.employee_id == employee_id)
        .order_by(EmployeeDepartment.from_date.desc())
        .all()
    )
    return deps


# ============================================================
# GET STORICO RAL
# ============================================================

@router.get("/employees/{employee_id}/salaries")
def get_salaries(employee_id: int, db: Session = Depends(get_db)):
    from app.models.employee_salaries import EmployeeSalary

    salaries = (
        db.query(EmployeeSalary)
        .filter(EmployeeSalary.employee_id == employee_id)
        .order_by(EmployeeSalary.from_date.desc())
        .all()
    )
    return salaries


# ============================================================
# GET STORICO AUTO AZIENDALI
# ============================================================

@router.get("/employees/{employee_id}/company-cars")
def get_company_cars(employee_id: int, db: Session = Depends(get_db)):
    from app.models.employee_company_cars import EmployeeCompanyCar

    cars = (
        db.query(EmployeeCompanyCar)
        .filter(EmployeeCompanyCar.employee_id == employee_id)
        .order_by(EmployeeCompanyCar.from_date.desc())
        .all()
    )
    return cars


# ============================================================
# GET STORICO SITI
# ============================================================

@router.get("/employees/{employee_id}/sites")
def get_sites(employee_id: int, db: Session = Depends(get_db)):
    from app.models.employee_site_history import EmployeeSiteHistory

    sites = (
        db.query(EmployeeSiteHistory)
        .filter(EmployeeSiteHistory.employee_id == employee_id)
        .order_by(EmployeeSiteHistory.from_date.desc())
        .all()
