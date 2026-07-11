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

router = APIRouter(tags=["Employees"])

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
# GET LISTA DIPENDENTI (FULL) — ROTTA AGGIUNTA
# ============================================================

@router.get("/employees/full")
def get_employees_full(db: Session = Depends(get_db)):
    return list_employees(db)


# ============================================================
# GET LISTA DIPENDENTI (VERSIONE CORRETTA)
# ============================================================

@router.get("/employees")
def list_employees(db: Session = Depends(get_db)):
    from app.models.employee import Employee as EmployeeModel
    from app.models.site import Site
    from app.models.department import Department
    from app.models.work_regime import WorkRegime
    from app.models.contract_nature import ContractNature
    from app.models.employment_status_type import EmploymentStatusType

    from app.models.employee_site_history import EmployeeSiteHistory
    from app.models.employee_departments import EmployeeDepartment
    from app.models.employee_cost_centers import EmployeeCostCenter
    from app.models.employee_contracts import EmployeeContract
    from app.models.employee_status_history import EmployeeStatusHistory
    from app.models.employee_salaries import EmployeeSalary
    from app.models.employee_company_cars import EmployeeCompanyCar

    employees = db.query(EmployeeModel).all()
    result = []

    for emp in employees:

        # SITO
        site_hist = db.query(EmployeeSiteHistory).filter(
            EmployeeSiteHistory.employee_id == emp.id,
            EmployeeSiteHistory.to_date.is_(None)
        ).first()

        site = None
        if site_hist:
            site_obj = db.query(Site).filter(Site.id == site_hist.site_id).first()
            if site_obj:
                site = {
                    "id": site_obj.id,
                    "name": site_obj.name or site_obj.code
                }

        # REPARTO
        dep_hist = db.query(EmployeeDepartment).filter(
            EmployeeDepartment.employee_id == emp.id,
            EmployeeDepartment.to_date.is_(None)
        ).first()

        department = None
        if dep_hist:
            dep_obj = db.query(Department).filter(Department.id == dep_hist.department_id).first()
            if dep_obj:
                department = {
                    "id": dep_obj.id,
                    "name": dep_obj.name or dep_obj.code
                }

        # CONTRATTO
        contract_hist = db.query(EmployeeContract).filter(
            EmployeeContract.employee_id == emp.id,
            EmployeeContract.to_date.is_(None)
        ).first()

        contract = None
        if contract_hist:
            wr = db.query(WorkRegime).filter(WorkRegime.id == contract_hist.work_regime_id).first()
            cn = db.query(ContractNature).filter(ContractNature.id == contract_hist.contract_nature_id).first()

            contract = {
                "id": contract_hist.id,
                "work_regime": wr.description or wr.code if wr else None,
		"contract_nature": cn.description or cn.code if cn else None,
                "weekly_hours": contract_hist.weekly_hours,
                "shift_type": contract_hist.shift_type,
                "time_band": contract_hist.time_band,
                "fte": contract_hist.fte,
                "from_date": contract_hist.from_date,
                "note": contract_hist.note,
            }

        # STATO
        status_hist = db.query(EmployeeStatusHistory).filter(
            EmployeeStatusHistory.employee_id == emp.id,
            EmployeeStatusHistory.to_date.is_(None)
        ).first()

        status = None
        if status_hist:
            st = db.query(EmploymentStatusType).filter(
                EmploymentStatusType.id == status_hist.status_type_id
            ).first()

            status = {
                "id": status_hist.id,
                "name": st.name if st else None,
                "from_date": status_hist.from_date,
                "note": status_hist.note,
            }

        # RAL
        salary_hist = db.query(EmployeeSalary).filter(
            EmployeeSalary.employee_id == emp.id,
            EmployeeSalary.to_date.is_(None)
        ).first()

        salary = None
        if salary_hist:
            salary = {
                "id": salary_hist.id,
                "ral_amount": salary_hist.ral_amount,
                "from_date": salary_hist.from_date,
                "note": salary_hist.note,
            }

        # AUTO
        car_hist = db.query(EmployeeCompanyCar).filter(
            EmployeeCompanyCar.employee_id == emp.id,
            EmployeeCompanyCar.to_date.is_(None)
        ).first()

        company_car = None
        if car_hist:
            company_car = {
                "id": car_hist.id,
                "car_model": car_hist.car_model,
                "plate": car_hist.plate,
                "benefit_type": car_hist.benefit_type,
                "from_date": car_hist.from_date,
                "note": car_hist.note,
            }

        # RUOLO
        role = None
        if emp.role:
            role = {
                "id": emp.role.id,
                "name": emp.role.name or emp.role.code
            }

        result.append({
            "id": emp.id,
            "email": emp.email,
            "first_name": emp.first_name,
            "last_name": emp.last_name,
            "role": role,
            "site": site,
            "department": department,
            "contract": contract,
            "status": status,
            "salary": salary,
            "company_car": company_car,
        })

    return result


# ============================================================
# GET DETTAGLIO DIPENDENTE (VERSIONE CORRETTA)
# ============================================================

@router.get("/employees/{employee_id}")
def get_employee(employee_id: int, db: Session = Depends(get_db)):
    from app.models.employee import Employee as EmployeeModel
    from app.models.employee_site_history import EmployeeSiteHistory
    from app.models.employee_departments import EmployeeDepartment
    from app.models.employee_cost_centers import EmployeeCostCenter
    from app.models.employee_contracts import EmployeeContract
    from app.models.employee_status_history import EmployeeStatusHistory
    from app.models.employee_salaries import EmployeeSalary
    from app.models.employee_company_cars import EmployeeCompanyCar

    employee = db.query(EmployeeModel).filter(EmployeeModel.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Dipendente non trovato")

    site = db.query(EmployeeSiteHistory).filter(
        EmployeeSiteHistory.employee_id == employee_id,
        EmployeeSiteHistory.to_date.is_(None)
    ).first()

    department = db.query(EmployeeDepartment).filter(
        EmployeeDepartment.employee_id == employee_id,
        EmployeeDepartment.to_date.is_(None)
    ).first()

    cost_centers = db.query(EmployeeCostCenter).filter(
        EmployeeCostCenter.employee_id == employee_id,
        EmployeeCostCenter.to_date.is_(None)
    ).all()

    contract = db.query(EmployeeContract).filter(
        EmployeeContract.employee_id == employee_id,
        EmployeeContract.to_date.is_(None)
    ).first()

    status = db.query(EmployeeStatusHistory).filter(
        EmployeeStatusHistory.employee_id == employee_id,
        EmployeeStatusHistory.to_date.is_(None)
    ).first()

    salary = db.query(EmployeeSalary).filter(
        EmployeeSalary.employee_id == employee_id,
        EmployeeSalary.to_date.is_(None)
    ).first()

    car = db.query(EmployeeCompanyCar).filter(
        EmployeeCompanyCar.employee_id == employee_id,
        EmployeeCompanyCar.to_date.is_(None)
    ).first()

    return {
        "id": employee.id,
        "email": employee.email,
        "first_name": employee.first_name,
        "last_name": employee.last_name,
        "phone": employee.phone,
        "fiscal_code": employee.fiscal_code,
        "gender": employee.gender,
        "birth_date": employee.birth_date,
        "birth_place": employee.birth_place,
        "address_street": employee.address_street,
        "address_city": employee.address_city,
        "address_cap": employee.address_cap,
        "lul_id": employee.lul_id,
        "role": employee.role,
        "is_active": employee.is_active,
        "hire_date": employee.hire_date,
        "termination_date": employee.termination_date,
        "site": site,
        "department": department,
        "cost_centers": cost_centers,
        "contract": {
    		"id": contract.id,
   		"work_regime": contract.work_regime.description or contract.work_regime.code if contract.work_regime else None,
    		"contract_nature": contract.contract_nature.description or contract.contract_nature.code if contract.contract_nature else None,
    		"weekly_hours": contract.weekly_hours,
    		"shift_type": contract.shift_type,
    		"time_band": contract.time_band,
    		"fte": contract.fte,
    		"from_date": contract.from_date,
    		"note": contract.note,
	} if contract else None,
        "status": status,
        "salary": salary,
        "company_car": car,
    }


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
    )
    return sites


# ============================================================
# GET STORICO STATI LAVORATIVI
# ============================================================

@router.get("/employees/{employee_id}/status")
def get_status_history(employee_id: int, db: Session = Depends(get_db)):
    from app.models.employee_status_history import EmployeeStatusHistory

    statuses = (
        db.query(EmployeeStatusHistory)
        .filter(EmployeeStatusHistory.employee_id == employee_id)
        .order_by(EmployeeStatusHistory.from_date.desc())
        .all()
    )
    return statuses


# ============================================================
# GET STATO ATTUALE COMPLETO
# ============================================================

@router.get("/employees/{employee_id}/current")
def get_current_status(employee_id: int, db: Session = Depends(get_db)):
    from app.models.employee import Employee as EmployeeModel
    from app.models.employee_contracts import EmployeeContract
    from app.models.employee_cost_centers import EmployeeCostCenter
    from app.models.employee_departments import EmployeeDepartment
    from app.models.employee_salaries import EmployeeSalary
    from app.models.employee_company_cars import EmployeeCompanyCar
    from app.models.employee_site_history import EmployeeSiteHistory
    from app.models.employee_status_history import EmployeeStatusHistory

    employee = db.query(EmployeeModel).filter(EmployeeModel.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Dipendente non trovato")

    current_contract = db.query(EmployeeContract).filter(
        EmployeeContract.employee_id == employee_id,
        EmployeeContract.to_date.is_(None)
    ).first()

    current_cc = db.query(EmployeeCostCenter).filter(
        EmployeeCostCenter.employee_id == employee_id,
        EmployeeCostCenter.to_date.is_(None)
    ).all()

    current_dep = db.query(EmployeeDepartment).filter(
        EmployeeDepartment.employee_id == employee_id,
        EmployeeDepartment.to_date.is_(None)
    ).first()

    current_salary = db.query(EmployeeSalary).filter(
        EmployeeSalary.employee_id == employee_id,
        EmployeeSalary.to_date.is_(None)
    ).first()

    current_car = db.query(EmployeeCompanyCar).filter(
        EmployeeCompanyCar.employee_id == employee_id,
        EmployeeCompanyCar.to_date.is_(None)
    ).first()

    current_site = db.query(EmployeeSiteHistory).filter(
        EmployeeSiteHistory.employee_id == employee_id,
        EmployeeSiteHistory.to_date.is_(None)
    ).first()

    current_status = db.query(EmployeeStatusHistory).filter(
        EmployeeStatusHistory.employee_id == employee_id,
        EmployeeStatusHistory.to_date.is_(None)
    ).first()

    return {
        "employee": employee,
        "contract": {
    		"id": current_contract.id,
    		"work_regime": current_contract.work_regime.description or current_contract.work_regime.code if current_contract.work_regime else None,
    		"contract_nature": current_contract.contract_nature.description or current_contract.contract_nature.code if current_contract.contract_nature else None,
    		"weekly_hours": current_contract.weekly_hours,
    		"shift_type": current_contract.shift_type,
    		"time_band": current_contract.time_band,
    		"fte": current_contract.fte,
    		"from_date": current_contract.from_date,
   		"note": current_contract.note,
	} if current_contract else None,
        "cost_centers": current_cc,
        "department": current_dep,
        "salary": current_salary,
        "company_car": current_car,
        "site": current_site,
        "status": current_status,
    }


# ============================================================
# UPDATE AUTO AZIENDALE ATTIVA
# ============================================================

@router.put("/employees/{employee_id}/company-cars/current")
def update_current_company_car(employee_id: int, payload: CompanyCarUpdate, db: Session = Depends(get_db)):
    from app.models.employee_company_cars import EmployeeCompanyCar

    car = (
        db.query(EmployeeCompanyCar)
        .filter(
            EmployeeCompanyCar.employee_id == employee_id,
            EmployeeCompanyCar.to_date.is_(None)
        )
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
