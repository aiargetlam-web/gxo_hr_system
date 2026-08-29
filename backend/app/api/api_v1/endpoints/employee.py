from datetime import timedelta, date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from passlib.hash import bcrypt

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
# CREATE EMPLOYEE COMPLETO (CORRETTO)
# ============================================================

@router.post("/", response_model=Employee)
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
    from app.models.shift_type import ShiftType

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

            # 🔥 CORRETTO
            id_lul=payload.id_lul,

            role_id=payload.role_id,

            # 🔥 SITO ATTUALE = quello scelto allo step 0
            site_id=payload.site_history.site_id,

            hire_date=payload.hire_date,
            termination_date=payload.termination_date,
            is_protected_category=payload.is_protected_category,
            is_disadvantaged=payload.is_disadvantaged,
            password_hash=bcrypt.hash("Password123!"),
        )

        # Recupero natura contratto
        cn = db.query(ContractNature).filter(
            ContractNature.id == payload.contract.contract_nature_id
        ).first()

        if not cn:
            raise HTTPException(status_code=400, detail="Natura contratto non valida")

        # Se NON è indeterminato → to_date obbligatorio
        if cn.code != "TI":
            if not payload.contract.to_date:
                raise HTTPException(
                    status_code=400,
                    detail="I contratti non indeterminati devono avere una data di scadenza (to_date)."
                )
            contract_to_date = payload.contract.to_date
        else:
            contract_to_date = None

        db.add(employee)
        db.flush()
        contract = EmployeeContract(
            employee_id=employee.id,
            work_regime_id=payload.contract.work_regime_id,
            contract_nature_id=payload.contract.contract_nature_id,
            from_date=payload.contract.from_date,
            to_date=contract_to_date,
            weekly_hours=payload.contract.weekly_hours,
            fte=payload.contract.fte,
            time_band=payload.contract.time_band,
            shift_type_id=payload.contract.shift_type_id,
            note=payload.contract.note,
            level_ccnl_id=payload.contract.level_ccnl_id,

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
        # BENEFIT
        if payload.benefits:
            for benefit in payload.benefits:
                db.add(EmployeeBenefit(
                    employee_id=employee.id,
                    benefit_type_id=benefit.benefit_type_id,   # può essere None, ed è OK
                    has_benefit=benefit.has_benefit,
                    from_date=benefit.from_date,
                    note=benefit.note,
                ))


        # AUTO AZIENDALE
        if payload.company_car:
            db.add(EmployeeCompanyCar(
                employee_id=employee.id,
                car_model=payload.company_car.car_model,
                plate=payload.company_car.plate,
                from_date=payload.company_car.from_date,
                note=payload.company_car.note,
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
        print("ERRORE CREAZIONE DIPENDENTE:", e)
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Errore creazione dipendente: {str(e)}")
# ============================================================
# NUOVO CONTRATTO
# ============================================================

@router.post("/{employee_id}/contracts")
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

        cn = db.query(ContractNature).filter(
            ContractNature.id == payload.contract_nature_id
        ).first()

        if not cn:
            raise HTTPException(status_code=400, detail="Natura contratto non valida")

        if cn.code != "TI":
            if not payload.to_date:
                raise HTTPException(
                    status_code=400,
                    detail="I contratti non indeterminati devono avere una data di scadenza (to_date)."
                )
            new_to_date = payload.to_date
        else:
            new_to_date = None


        new_contract = EmployeeContract(
            employee_id=employee_id,
            work_regime_id=payload.work_regime_id,
            contract_nature_id=payload.contract_nature_id,
            from_date=payload.from_date,
            to_date=new_to_date,
            weekly_hours=payload.weekly_hours,
            fte=payload.fte,
            time_band=payload.time_band,
            shift_type_id=payload.shift_type_id,
            note=payload.note,
            level_ccnl_id=payload.level_ccnl_id,


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

@router.post("/{employee_id}/cost-centers")
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

@router.post("/{employee_id}/departments")
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

@router.post("/{employee_id}/salaries")
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

@router.post("/{employee_id}/company-cars")
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
# CAMBIO SITO (CORRETTO)
# ============================================================

@router.post("/{employee_id}/sites")
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

        # 🔥 CORRETTO: aggiorna il sito attuale
        employee.site_id = payload.site_id
        db.add(employee)

        db.commit()
        db.refresh(new_site_hist)

        return {"message": "Cambio sito registrato con successo", "site_history": new_site_hist}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Errore durante il cambio sito: {str(e)}")
# ============================================================
# GET LISTA DIPENDENTI (FULL)
# ============================================================

@router.get("/full")
def get_employees_full(db: Session = Depends(get_db)):
    return list_employees(db)

# ============================================================
# GET LISTA DIPENDENTI (VERSIONE COMPLETA E CORRETTA)
# ============================================================

@router.get("/employees")
def list_employees(db: Session = Depends(get_db)):
    from app.models.employee import Employee as EmployeeModel
    from app.models.site import Site
    from app.models.department import Department
    from app.models.work_regime import WorkRegime
    from app.models.contract_nature import ContractNature
    from app.models.employment_status_type import EmploymentStatusType
    from app.models.cost_center import CostCenter as CostCenterModel

    from app.models.employee_site_history import EmployeeSiteHistory
    from app.models.employee_departments import EmployeeDepartment
    from app.models.employee_cost_centers import EmployeeCostCenter
    from app.models.employee_contracts import EmployeeContract
    from app.models.employee_status_history import EmployeeStatusHistory
    from app.models.employee_salaries import EmployeeSalary
    from app.models.employee_company_cars import EmployeeCompanyCar
    from app.models.employee_benefits import EmployeeBenefit
    from app.models.employee_enac_courses import EmployeeEnacCourse
    from app.models.employee_enac_approvals import EmployeeEnacApproval
    from app.models.employee_manager import EmployeeManager
    from app.models.employee_union_history import EmployeeUnionHistory
    from app.models.union import Union
    from app.models.employee_employer_history import EmployeeEmployerHistory
    from app.models.employer import Employer

    employees = db.query(EmployeeModel).all()
    result = []

    for emp in employees:

        # ============================================================
        # SITO ATTUALE + STORICO
        # ============================================================
        site_hist = db.query(EmployeeSiteHistory).filter(
            EmployeeSiteHistory.employee_id == emp.id,
            EmployeeSiteHistory.to_date.is_(None)
        ).first()

        site = None
        site_history = None

        if site_hist:
            site_obj = db.query(Site).filter(Site.id == site_hist.site_id).first()
            if site_obj:
                site = {
                    "id": site_obj.id,
                    "name": site_obj.name or site_obj.code,
                }

            site_history = {
                "id": site_hist.id,
                "site_id": site_hist.site_id,
                "from_date": site_hist.from_date,
                "note": site_hist.note
            }

        # ============================================================
        # REPARTO ATTUALE + MANAGER + STORICO
        # ============================================================
        dep_hist = db.query(EmployeeDepartment).filter(
            EmployeeDepartment.employee_id == emp.id,
            EmployeeDepartment.to_date.is_(None)
        ).first()

        department = None
        manager = None

        if dep_hist:
            dep_obj = db.query(Department).filter(Department.id == dep_hist.department_id).first()

            department = {
                "id": dep_hist.id,
                "department_id": dep_hist.department_id,
                "name": dep_obj.name if dep_obj else None,
                "manager_employee_id": dep_hist.manager_employee_id,
                "from_date": dep_hist.from_date,
                "note": dep_hist.note
            }

            if dep_hist.manager_employee_id:
                manager_emp = db.query(EmployeeModel).filter(
                    EmployeeModel.id == dep_hist.manager_employee_id
                ).first()

                if manager_emp:
                    manager = {
                        "id": manager_emp.id,
                        "name": f"{manager_emp.first_name} {manager_emp.last_name}",
                        "email": manager_emp.email,
                        "from_date": dep_hist.from_date,
                        "note": dep_hist.note
                    }

        # ============================================================
        # CONTRATTO ATTUALE COMPLETO
        # ============================================================
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
                "work_regime": wr.description if wr else None,
                "work_regime_id": contract_hist.work_regime_id,
                "contract_nature": cn.description if cn else None,
                "contract_nature_id": contract_hist.contract_nature_id,
                "weekly_hours": contract_hist.weekly_hours,
                "shift_type_id": contract_hist.shift_type_id,
                "shift_type_name": contract_hist.shift_type.name if contract_hist.shift_type else None,
                "time_band": contract_hist.time_band,
                "fte": contract_hist.fte,
                "from_date": contract_hist.from_date,
                "to_date": contract_hist.to_date,
                "note": contract_hist.note,
                "level_ccnl_id": contract_hist.level_ccnl_id,
                "level_ccnl_description": contract_hist.level_ccnl.description if contract_hist.level_ccnl else None,
            }

        # ============================================================
        # STATO ATTUALE
        # ============================================================
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
                "status_type_id": status_hist.status_type_id,
                "name": st.code if st else None,
                "from_date": status_hist.from_date,
                "note": status_hist.note,
            }

        # ============================================================
        # RAL ATTUALE
        # ============================================================
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

        # ============================================================
        # AUTO AZIENDALE
        # ============================================================
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
                "from_date": car_hist.from_date,
                "note": car_hist.note,
            }

        # ============================================================
        # BENEFIT ATTUALI
        # ============================================================
        benefits_hist = db.query(EmployeeBenefit).filter(
            EmployeeBenefit.employee_id == emp.id,
            EmployeeBenefit.to_date.is_(None)
        ).all()

        benefits = []
        for b in benefits_hist:
            benefits.append({
                "id": b.id,
                "benefit_type_id": b.benefit_type_id,
                "has_benefit": b.has_benefit,
                "from_date": b.from_date,
                "note": b.note
            })

        # ============================================================
        # ENAC CORSI
        # ============================================================
        enac_courses_hist = db.query(EmployeeEnacCourse).filter(
            EmployeeEnacCourse.employee_id == emp.id,
            EmployeeEnacCourse.to_date.is_(None)
        ).all()

        enac_courses = []
        for c in enac_courses_hist:
            enac_courses.append({
                "id": c.id,
                "course_date": c.course_date,
                "expiry_date": c.expiry_date,
                "is_first_course": c.is_first_course,
                "note": c.note
            })

        # ============================================================
        # ENAC APPROVAZIONI
        # ============================================================
        enac_approvals_hist = db.query(EmployeeEnacApproval).filter(
            EmployeeEnacApproval.employee_id == emp.id,
            EmployeeEnacApproval.to_date.is_(None)
        ).all()

        enac_approvals = []
        for a in enac_approvals_hist:
            enac_approvals.append({
                "id": a.id,
                "request_date": a.request_date,
                "approval_date": a.approval_date,
                "is_first_approval": a.is_first_approval,
                "note": a.note
            })

        # ============================================================
        # COST CENTER ATTUALI
        # ============================================================
        cc_hist = db.query(EmployeeCostCenter).filter(
            EmployeeCostCenter.employee_id == emp.id,
            EmployeeCostCenter.to_date.is_(None)
        ).all()

        cost_centers = []
        for cc in cc_hist:
            cc_obj = db.query(CostCenterModel).filter(
                CostCenterModel.id == cc.cost_center_id
            ).first()

            cost_centers.append({
                "id": cc.id,
                "cost_center_id": cc.cost_center_id,
                "code": cc_obj.code if cc_obj else None,
                "description": cc_obj.description if cc_obj else None,
                "weight_percent": cc.weight_percent,
                "from_date": cc.from_date,
                "note": cc.note,
            })

        # ============================================================
        # RUOLO
        # ============================================================
        role = None
        if emp.role:
            role = {
                "id": emp.role.id,
                "name": emp.role.name or emp.role.code,
            }

        # ============================================================
        # COSTRUZIONE RISPOSTA FINALE
        # ============================================================
        result.append({
            "id": emp.id,
            "email": emp.email,
            "first_name": emp.first_name,
            "last_name": emp.last_name,

            # ANAGRAFICA
            "phone": emp.phone,
            "fiscal_code": emp.fiscal_code,
            "gender": emp.gender,
            "birth_date": emp.birth_date,
            "birth_place": emp.birth_place,
            "address_street": emp.address_street,
            "address_city": emp.address_city,
            "address_cap": emp.address_cap,
            "id_lul": emp.id_lul,

            # AZIENDALE
            "hire_date": emp.hire_date,
            "termination_date": emp.termination_date,
            "is_protected_category": emp.is_protected_category,
            "is_disadvantaged": emp.is_disadvantaged,
            "has_law_104": emp.has_law_104,
            "law_104_type": emp.law_104_type,
            "law_104_note": emp.law_104_note,

            # ORGANIZZAZIONE
            "role": role,
            "site": site,
            "site_history": site_history,
            "department": department,
            "manager": manager,

            # HR
            "contract": contract,
            "status": status,
            "salary": salary,
            "company_car": company_car,
            "cost_centers": cost_centers,
            "benefits": benefits,
            "enac_courses": enac_courses,
            "enac_approvals": enac_approvals,

            "is_active": emp.is_active,
            "protected_percentage": emp.protected_percentage,
            "protected_type": emp.protected_type,
        })

    return result

# ============================================================
# GET DETTAGLIO DIPENDENTE (VERSIONE COMPLETA E CORRETTA)
# ============================================================

@router.get("/{employee_id}")
def get_employee(employee_id: int, db: Session = Depends(get_db)):
    from app.models.employee import Employee as EmployeeModel
    from app.models.site import Site
    from app.models.department import Department
    from app.models.work_regime import WorkRegime
    from app.models.contract_nature import ContractNature
    from app.models.employment_status_type import EmploymentStatusType
    from app.models.cost_center import CostCenter as CostCenterModel

    from app.models.employee_site_history import EmployeeSiteHistory
    from app.models.employee_departments import EmployeeDepartment
    from app.models.employee_cost_centers import EmployeeCostCenter
    from app.models.employee_contracts import EmployeeContract
    from app.models.employee_status_history import EmployeeStatusHistory
    from app.models.employee_salaries import EmployeeSalary
    from app.models.employee_company_cars import EmployeeCompanyCar
    from app.models.employee_benefits import EmployeeBenefit
    from app.models.employee_enac_courses import EmployeeEnacCourse
    from app.models.employee_enac_approvals import EmployeeEnacApproval

    emp = db.query(EmployeeModel).filter(EmployeeModel.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Dipendente non trovato")

    # ============================================================
    # SITO ATTUALE + STORICO
    # ============================================================
    site_hist = db.query(EmployeeSiteHistory).filter(
        EmployeeSiteHistory.employee_id == emp.id,
        EmployeeSiteHistory.to_date.is_(None)
    ).first()

    site = None
    site_history = None

    if site_hist:
        site_obj = db.query(Site).filter(Site.id == site_hist.site_id).first()
        if site_obj:
            site = {
                "id": site_obj.id,
                "name": site_obj.name or site_obj.code,
            }

        site_history = {
            "id": site_hist.id,
            "site_id": site_hist.site_id,
            "from_date": site_hist.from_date,
            "note": site_hist.note
        }

    # ============================================================
    # REPARTO ATTUALE COMPLETO
    # ============================================================
    dep_hist = db.query(EmployeeDepartment).filter(
        EmployeeDepartment.employee_id == emp.id,
        EmployeeDepartment.to_date.is_(None)
    ).first()

    department = None
    manager = None

    if dep_hist:
        dep_obj = db.query(Department).filter(Department.id == dep_hist.department_id).first()

        department = {
            "id": dep_hist.id,
            "department_id": dep_hist.department_id,
            "name": dep_obj.name if dep_obj else None,
            "manager_employee_id": dep_hist.manager_employee_id,
            "from_date": dep_hist.from_date,
            "note": dep_hist.note
        }

        if dep_hist.manager_employee_id:
            manager_emp = db.query(EmployeeModel).filter(
                EmployeeModel.id == dep_hist.manager_employee_id
            ).first()

            if manager_emp:
                manager = {
                    "id": manager_emp.id,
                    "name": f"{manager_emp.first_name} {manager_emp.last_name}",
                    "email": manager_emp.email,
                    "from_date": dep_hist.from_date,
                    "note": dep_hist.note
                }

    # ============================================================
    # CONTRATTO ATTUALE COMPLETO
    # ============================================================
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
            "work_regime": wr.description if wr else None,
            "work_regime_id": contract_hist.work_regime_id,
            "contract_nature": cn.description if cn else None,
            "contract_nature_id": contract_hist.contract_nature_id,
            "weekly_hours": contract_hist.weekly_hours,
            "shift_type_id": contract_hist.shift_type_id,
            "shift_type_name": contract_hist.shift_type.name if contract_hist.shift_type else None,
            "time_band": contract_hist.time_band,
            "fte": contract_hist.fte,
            "from_date": contract_hist.from_date,
            "to_date": contract_hist.to_date,
            "note": contract_hist.note,
            "level_ccnl_id": contract_hist.level_ccnl_id,
            "level_ccnl_description": contract_hist.level_ccnl.description if contract_hist.level_ccnl else None,
        }

    # ============================================================
    # STATO ATTUALE
    # ============================================================
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
            "status_type_id": status_hist.status_type_id,
            "name": st.code if st else None,
            "from_date": status_hist.from_date,
            "note": status_hist.note,
        }

    # ============================================================
    # RAL ATTUALE
    # ============================================================
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

    # ============================================================
    # AUTO AZIENDALE
    # ============================================================
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
            "from_date": car_hist.from_date,
            "note": car_hist.note,
        }

    # ============================================================
    # BENEFIT ATTUALI
    # ============================================================
    benefits_hist = db.query(EmployeeBenefit).filter(
        EmployeeBenefit.employee_id == emp.id,
        EmployeeBenefit.to_date.is_(None)
    ).all()

    benefits = []
    for b in benefits_hist:
        benefits.append({
            "id": b.id,
            "benefit_type_id": b.benefit_type_id,
            "has_benefit": b.has_benefit,
            "from_date": b.from_date,
            "note": b.note
        })

    # ============================================================
    # ENAC CORSI
    # ============================================================
    enac_courses_hist = db.query(EmployeeEnacCourse).filter(
        EmployeeEnacCourse.employee_id == emp.id,
        EmployeeEnacCourse.to_date.is_(None)
    ).all()

    enac_courses = []
    for c in enac_courses_hist:
        enac_courses.append({
            "id": c.id,
            "course_date": c.course_date,
            "expiry_date": c.expiry_date,
            "is_first_course": c.is_first_course,
            "note": c.note
        })

    # ============================================================
    # ENAC APPROVAZIONI
    # ============================================================
    enac_approvals_hist = db.query(EmployeeEnacApproval).filter(
        EmployeeEnacApproval.employee_id == emp.id,
        EmployeeEnacApproval.to_date.is_(None)
    ).all()

    enac_approvals = []
    for a in enac_approvals_hist:
        enac_approvals.append({
            "id": a.id,
            "request_date": a.request_date,
            "approval_date": a.approval_date,
            "is_first_approval": a.is_first_approval,
            "note": a.note
        })

    # ============================================================
    # COST CENTER ATTUALI
    # ============================================================
    cc_hist = db.query(EmployeeCostCenter).filter(
        EmployeeCostCenter.employee_id == emp.id,
        EmployeeCostCenter.to_date.is_(None)
    ).all()

    cost_centers = []
    for cc in cc_hist:
        cc_obj = db.query(CostCenterModel).filter(
            CostCenterModel.id == cc.cost_center_id
        ).first()

        cost_centers.append({
            "id": cc.id,
            "cost_center_id": cc.cost_center_id,
            "code": cc_obj.code if cc_obj else None,
            "description": cc_obj.description if cc_obj else None,
            "weight_percent": cc.weight_percent,
            "from_date": cc.from_date,
            "note": cc.note,
        })

    # ============================================================
    # RUOLO
    # ============================================================
    role = None
    if emp.role:
        role = {
            "id": emp.role.id,
            "name": emp.role.name or emp.role.code,
        }

    # ============================================================
    # RISPOSTA FINALE
    # ============================================================
    return {
        "id": emp.id,
        "email": emp.email,
        "first_name": emp.first_name,
        "last_name": emp.last_name,

        # ANAGRAFICA
        "phone": emp.phone,
        "fiscal_code": emp.fiscal_code,
        "gender": emp.gender,
        "birth_date": emp.birth_date,
        "birth_place": emp.birth_place,
        "address_street": emp.address_street,
        "address_city": emp.address_city,
        "address_cap": emp.address_cap,
        "id_lul": emp.id_lul,

        # AZIENDALE
        "hire_date": emp.hire_date,
        "termination_date": emp.termination_date,
        "is_protected_category": emp.is_protected_category,
        "is_disadvantaged": emp.is_disadvantaged,
        "has_law_104": emp.has_law_104,
        "law_104_type": emp.law_104_type,
        "law_104_note": emp.law_104_note,

        # ORGANIZZAZIONE
        "role": role,
        "site": site,
        "site_history": site_history,
        "department": department,
        "manager": manager,

        # HR
        "contract": contract,
        "status": status,
        "salary": salary,
        "company_car": company_car,
        "cost_centers": cost_centers,
        "benefits": benefits,
        "enac_courses": enac_courses,
        "enac_approvals": enac_approvals,

        "is_active": emp.is_active,
        "protected_percentage": emp.protected_percentage,
        "protected_type": emp.protected_type,
    }


 ============================================================
# GET STORICO CONTRATTI
# ============================================================

@router.get("/{employee_id}/contracts")
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

@router.get("/{employee_id}/cost-centers")
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

@router.get("/{employee_id}/departments")
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

@router.get("/{employee_id}/salaries")
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

@router.get("/{employee_id}/company-cars")
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

@router.get("/{employee_id}/sites")
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

@router.get("/{employee_id}/status")
def get_status_history(employee_id: int, db: Session = Depends(get_db)):
    from app.models.employee_status_history import EmployeeStatusHistory
    from app.models.employment_status_type import EmploymentStatusType

    statuses = (
        db.query(EmployeeStatusHistory)
        .filter(EmployeeStatusHistory.employee_id == employee_id)
        .order_by(EmployeeStatusHistory.from_date.desc())
        .all()
    )

    result = []
    for st in statuses:
        st_type = db.query(EmploymentStatusType).filter(
            EmploymentStatusType.id == st.status_type_id
        ).first()

        result.append({
            "id": st.id,
            "name": st_type.code if st_type else None,
            "description": st_type.description if st_type else None,
            "from_date": st.from_date,
            "to_date": st.to_date,
            "note": st.note,
        })

    return result
# ============================================================
# ENAC corsi
# ============================================================
@router.get("/{employee_id}/enac-courses")
def get_enac_courses(employee_id: int, db: Session = Depends(get_db)):
    from app.models.employee_enac_courses import EmployeeEnacCourse
    return (
        db.query(EmployeeEnacCourse)
        .filter(EmployeeEnacCourse.employee_id == employee_id)
        .order_by(EmployeeEnacCourse.course_date.desc())
        .all()
    )
# ============================================================
# ENAC approvazioni
# ============================================================
@router.get("/{employee_id}/enac-approvals")
def get_enac_approvals(employee_id: int, db: Session = Depends(get_db)):
    from app.models.employee_enac_approvals import EmployeeEnacApproval
    return (
        db.query(EmployeeEnacApproval)
        .filter(EmployeeEnacApproval.employee_id == employee_id)
        .order_by(EmployeeEnacApproval.request_date.desc())
        .all()
    )
# ============================================================
# Benefit
# ============================================================
@router.get("/{employee_id}/benefits")
def get_benefits(employee_id: int, db: Session = Depends(get_db)):
    from app.models.employee_benefits import EmployeeBenefit
    return (
        db.query(EmployeeBenefit)
        .filter(EmployeeBenefit.employee_id == employee_id)
        .order_by(EmployeeBenefit.from_date.desc())
        .all()
    )


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
        "contract": current_contract,
        "cost_centers": current_cc,
        "department": current_dep,
        "salary": current_salary,
        "company_car": current_car,
        "site": current_site,
        "status": current_status,
    }

# ============================================================
# post CAMBIO STATO
# ============================================================

@router.post("/{employee_id}/status")
def change_status(employee_id: int, payload: StatusUpdate, db: Session = Depends(get_db)):
    from app.models.employee import Employee as EmployeeModel
    from app.models.employee_status_history import EmployeeStatusHistory
    from app.models.employment_status_type import EmploymentStatusType

    employee = db.query(EmployeeModel).filter(EmployeeModel.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Dipendente non trovato")

    current_status = (
        db.query(EmployeeStatusHistory)
        .filter(EmployeeStatusHistory.employee_id == employee_id)
        .filter(EmployeeStatusHistory.to_date.is_(None))
        .first()
    )

    if current_status:
        current_status.to_date = payload.from_date - timedelta(days=1)
        db.add(current_status)

    status_type = db.query(EmploymentStatusType).filter(
        EmploymentStatusType.id == payload.status_type_id
    ).first()

    if not status_type:
        raise HTTPException(status_code=400, detail="Stato lavorativo non valido")

    new_status = EmployeeStatusHistory(
        employee_id=employee_id,
        status_type_id=payload.status_type_id,
        from_date=payload.from_date,
        note=payload.note
    )
    db.add(new_status)

    # 🔥 QUI AGGIUNGI QUESTA LOGICA
    employee.is_active = status_type.is_active
    if status_type.is_active is False:
        # stato che “cessa” la persona → metti termination_date
        employee.termination_date = payload.from_date
    else:
        # se torna ATTIVO o altro stato attivo → azzera la cessazione
        employee.termination_date = None

    db.add(employee)

    db.commit()
    db.refresh(new_status)

    return {"message": "Cambio stato registrato con successo", "status": new_status}

# ============================================================
# CAMBIO RESPONSABILE (STORICIZZATO)
# ============================================================

@router.post("/{employee_id}/manager")
def change_manager(employee_id: int, payload: dict, db: Session = Depends(get_db)):
    """
    payload = {
        "manager_id": int,
        "from_date": date,
        "note": str | None
    }
    """
    from app.models.employee import Employee as EmployeeModel

    employee = db.query(EmployeeModel).filter(EmployeeModel.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Dipendente non trovato")

    manager_id = payload.get("manager_id")
    from_date = payload.get("from_date")
    note = payload.get("note")

    if not manager_id or not from_date:
        raise HTTPException(status_code=400, detail="manager_id e from_date sono obbligatori")

    # Chiudi il responsabile attuale
    current = (
        db.query(EmployeeManager)
        .filter(EmployeeManager.employee_id == employee_id,
                EmployeeManager.to_date.is_(None))
        .first()
    )

    if current:
        current.to_date = from_date - timedelta(days=1)
        db.add(current)

    # Crea nuovo record
    new_manager = EmployeeManager(
        employee_id=employee_id,
        manager_id=manager_id,
        from_date=from_date,
        note=note
    )

    db.add(new_manager)
    db.commit()
    db.refresh(new_manager)

    return {
        "message": "Responsabile aggiornato con successo",
        "manager": new_manager
    }

# ============================================================
# GET RESPONSABILE ATTUALE
# ============================================================

@router.get("/{employee_id}/manager")
def get_current_manager(employee_id: int, db: Session = Depends(get_db)):
    from app.models.employee import Employee as EmployeeModel

    current = (
        db.query(EmployeeManager)
        .filter(EmployeeManager.employee_id == employee_id,
                EmployeeManager.to_date.is_(None))
        .first()
    )

    if not current:
        return None

    manager = db.query(EmployeeModel).filter(EmployeeModel.id == current.manager_id).first()

    return {
        "id": manager.id,
        "name": f"{manager.first_name} {manager.last_name}",
        "email": manager.email,
        "from_date": current.from_date,
        "note": current.note
    }

# ============================================================
# GET STORICO RESPONSABILI
# ============================================================

@router.get("/{employee_id}/manager-history")
def get_manager_history(employee_id: int, db: Session = Depends(get_db)):
    from app.models.employee import Employee as EmployeeModel

    history = (
        db.query(EmployeeManager)
        .filter(EmployeeManager.employee_id == employee_id)
        .order_by(EmployeeManager.from_date.desc())
        .all()
    )

    result = []
    for h in history:
        manager = db.query(EmployeeModel).filter(EmployeeModel.id == h.manager_id).first()
        result.append({
            "id": h.id,
            "manager_id": h.manager_id,
            "manager_name": f"{manager.first_name} {manager.last_name}" if manager else None,
            "from_date": h.from_date,
            "to_date": h.to_date,
            "note": h.note
        })

    return result


# ============================================================
# put anagrafica
# ============================================================
@router.put("/{employee_id}", response_model=Employee)
def update_employee(employee_id: int, payload: EmployeeUpdate, db: Session = Depends(get_db)):
    from app.models.employee import Employee as EmployeeModel

    employee = db.query(EmployeeModel).filter(EmployeeModel.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Dipendente non trovato")

    try:
        # aggiorna solo i campi presenti nel payload
        for field, value in payload.dict(exclude_unset=True).items():
            setattr(employee, field, value)

        db.add(employee)
        db.commit()
        db.refresh(employee)

        return employee

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Errore aggiornamento dipendente: {str(e)}")

# ============================================================
# Post Enac corsi
# ============================================================
@router.post("/employees/{employee_id}/enac-courses")
def add_enac_course(employee_id: int, payload: EnacCourseCreate, db: Session = Depends(get_db)):
    from app.models.employee import Employee as EmployeeModel
    from app.models.employee_enac_courses import EmployeeEnacCourse

    employee = db.query(EmployeeModel).filter(EmployeeModel.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Dipendente non trovato")

    try:
        new_course = EmployeeEnacCourse(
            employee_id=employee_id,
            course_date=payload.course_date,
            expiry_date=payload.expiry_date,
            is_first_course=payload.is_first_course,
            note=payload.note
        )

        db.add(new_course)
        db.commit()
        db.refresh(new_course)

        return {"message": "Corso ENAC aggiunto con successo", "course": new_course}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Errore durante l'inserimento del corso ENAC: {str(e)}")

# ============================================================
# Post Enac approvazioni
# ============================================================
@router.post("/employees/{employee_id}/enac-approvals")
def add_enac_approval(employee_id: int, payload: EnacApprovalCreate, db: Session = Depends(get_db)):
    from app.models.employee import Employee as EmployeeModel
    from app.models.employee_enac_approvals import EmployeeEnacApproval

    employee = db.query(EmployeeModel).filter(EmployeeModel.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Dipendente non trovato")

    try:
        new_approval = EmployeeEnacApproval(
            employee_id=employee_id,
            request_date=payload.request_date,
            approval_date=payload.approval_date,
            is_first_approval=payload.is_first_approval,
            note=payload.note
        )

        db.add(new_approval)
        db.commit()
        db.refresh(new_approval)

        return {"message": "Approvazione ENAC aggiunta con successo", "approval": new_approval}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Errore durante l'inserimento dell'approvazione ENAC: {str(e)}")

# ============================================================
# UPDATE ANAGRAFICA (EmployeeUpdate)
# ============================================================

@router.put("/{employee_id}", response_model=Employee)
def update_employee(employee_id: int, payload: EmployeeUpdate, db: Session = Depends(get_db)):
    from app.models.employee import Employee as EmployeeModel

    emp = db.query(EmployeeModel).filter(EmployeeModel.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Dipendente non trovato")

    try:
        for field, value in payload.dict(exclude_unset=True).items():
            setattr(emp, field, value)

        db.add(emp)
        db.commit()
        db.refresh(emp)
        return emp

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Errore aggiornamento anagrafica: {str(e)}")

# ============================================================
# UPDATE contratto
# ============================================================
@router.put("/{employee_id}/contracts/{contract_id}")
def update_contract(employee_id: int, contract_id: int, payload: ContractUpdate, db: Session = Depends(get_db)):
    from app.models.employee_contracts import EmployeeContract

    contract = db.query(EmployeeContract).filter(
        EmployeeContract.id == contract_id,
        EmployeeContract.employee_id == employee_id
    ).first()

    if not contract:
        raise HTTPException(status_code=404, detail="Contratto non trovato")

    try:
        for field, value in payload.dict(exclude_unset=True).items():
            setattr(contract, field, value)

        db.add(contract)
        db.commit()
        db.refresh(contract)
        return {"message": "Contratto aggiornato", "contract": contract}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Errore aggiornamento contratto: {str(e)}")

# ============================================================
# UPDATE cost center
# ============================================================
@router.put("/{employee_id}/cost-centers/{cc_id}")
def update_cost_center(employee_id: int, cc_id: int, payload: CostCenterUpdate, db: Session = Depends(get_db)):
    from app.models.employee_cost_centers import EmployeeCostCenter

    cc = db.query(EmployeeCostCenter).filter(
        EmployeeCostCenter.id == cc_id,
        EmployeeCostCenter.employee_id == employee_id
    ).first()

    if not cc:
        raise HTTPException(status_code=404, detail="Cost center non trovato")

    try:
        for field, value in payload.dict(exclude_unset=True).items():
            setattr(cc, field, value)

        db.add(cc)
        db.commit()
        db.refresh(cc)
        return {"message": "Cost center aggiornato", "cost_center": cc}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Errore aggiornamento cost center: {str(e)}")

# ============================================================
# UPDATE reparto
# ============================================================
@router.put("/{employee_id}/departments/{dep_id}")
def update_department(employee_id: int, dep_id: int, payload: DepartmentUpdate, db: Session = Depends(get_db)):
    from app.models.employee_departments import EmployeeDepartment

    dep = db.query(EmployeeDepartment).filter(
        EmployeeDepartment.id == dep_id,
        EmployeeDepartment.employee_id == employee_id
    ).first()

    if not dep:
        raise HTTPException(status_code=404, detail="Reparto non trovato")

    try:
        for field, value in payload.dict(exclude_unset=True).items():
            setattr(dep, field, value)

        db.add(dep)
        db.commit()
        db.refresh(dep)
        return {"message": "Reparto aggiornato", "department": dep}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Errore aggiornamento reparto: {str(e)}")

# ============================================================
# UPDATE ral
# ============================================================
@router.put("/{employee_id}/salaries/{salary_id}")
def update_salary(employee_id: int, salary_id: int, payload: SalaryUpdate, db: Session = Depends(get_db)):
    from app.models.employee_salaries import EmployeeSalary

    sal = db.query(EmployeeSalary).filter(
        EmployeeSalary.id == salary_id,
        EmployeeSalary.employee_id == employee_id
    ).first()

    if not sal:
        raise HTTPException(status_code=404, detail="RAL non trovata")

    try:
        for field, value in payload.dict(exclude_unset=True).items():
            setattr(sal, field, value)

        db.add(sal)
        db.commit()
        db.refresh(sal)
        return {"message": "RAL aggiornata", "salary": sal}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Errore aggiornamento RAL: {str(e)}")

# ============================================================
# UPDATE benefit
# ============================================================
@router.put("/{employee_id}/benefits/{benefit_id}")
def update_benefit(employee_id: int, benefit_id: int, payload: BenefitUpdate, db: Session = Depends(get_db)):
    from app.models.employee_benefits import EmployeeBenefit

    ben = db.query(EmployeeBenefit).filter(
        EmployeeBenefit.id == benefit_id,
        EmployeeBenefit.employee_id == employee_id
    ).first()

    if not ben:
        raise HTTPException(status_code=404, detail="Benefit non trovato")

    try:
        for field, value in payload.dict(exclude_unset=True).items():
            setattr(ben, field, value)

        db.add(ben)
        db.commit()
        db.refresh(ben)
        return {"message": "Benefit aggiornato", "benefit": ben}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Errore aggiornamento benefit: {str(e)}")


# ============================================================
# UPDATE auto
# ============================================================
@router.put("/{employee_id}/company-cars/{car_id}")
def update_company_car(employee_id: int, car_id: int, payload: CompanyCarUpdate, db: Session = Depends(get_db)):
    from app.models.employee_company_cars import EmployeeCompanyCar

    car = db.query(EmployeeCompanyCar).filter(
        EmployeeCompanyCar.id == car_id,
        EmployeeCompanyCar.employee_id == employee_id
    ).first()

    if not car:
        raise HTTPException(status_code=404, detail="Auto aziendale non trovata")

    try:
        for field, value in payload.dict(exclude_unset=True).items():
            setattr(car, field, value)

        db.add(car)
        db.commit()
        db.refresh(car)
        return {"message": "Auto aziendale aggiornata", "company_car": car}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Errore aggiornamento auto aziendale: {str(e)}")


# ============================================================
# UPDATE enac corsi
# ============================================================
@router.put("/{employee_id}/enac-courses/{course_id}")
def update_enac_course(employee_id: int, course_id: int, payload: EnacCourseUpdate, db: Session = Depends(get_db)):
    from app.models.employee_enac_courses import EmployeeEnacCourse

    course = db.query(EmployeeEnacCourse).filter(
        EmployeeEnacCourse.id == course_id,
        EmployeeEnacCourse.employee_id == employee_id
    ).first()

    if not course:
        raise HTTPException(status_code=404, detail="Corso ENAC non trovato")

    try:
        for field, value in payload.dict(exclude_unset=True).items():
            setattr(course, field, value)

        db.add(course)
        db.commit()
        db.refresh(course)
        return {"message": "Corso ENAC aggiornato", "course": course}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Errore aggiornamento corso ENAC: {str(e)}")

# ============================================================
# UPDATE enac approvazioni
# ============================================================
@router.put("/{employee_id}/enac-approvals/{approval_id}")
def update_enac_approval(employee_id: int, approval_id: int, payload: EnacApprovalUpdate, db: Session = Depends(get_db)):
    from app.models.employee_enac_approvals import EmployeeEnacApproval

    appr = db.query(EmployeeEnacApproval).filter(
        EmployeeEnacApproval.id == approval_id,
        EmployeeEnacApproval.employee_id == employee_id
    ).first()

    if not appr:
        raise HTTPException(status_code=404, detail="Approvazione ENAC non trovata")

    try:
        for field, value in payload.dict(exclude_unset=True).items():
            setattr(appr, field, value)

        db.add(appr)
        db.commit()
        db.refresh(appr)
        return {"message": "Approvazione ENAC aggiornata", "approval": appr}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Errore aggiornamento approvazione ENAC: {str(e)}")


# ============================================================
# UPDATE status
# ============================================================
@router.put("/{employee_id}/status/{status_id}")
def update_status(employee_id: int, status_id: int, payload: StatusUpdate, db: Session = Depends(get_db)):
    from app.models.employee_status_history import EmployeeStatusHistory

    st = db.query(EmployeeStatusHistory).filter(
        EmployeeStatusHistory.id == status_id,
        EmployeeStatusHistory.employee_id == employee_id
    ).first()

    if not st:
        raise HTTPException(status_code=404, detail="Status non trovato")

    try:
        for field, value in payload.dict(exclude_unset=True).items():
            setattr(st, field, value)

        db.add(st)
        db.commit()
        db.refresh(st)
        return {"message": "Status aggiornato", "status": st}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Errore aggiornamento status: {str(e)}")



# ============================================================
# UPDATE sito
# ============================================================
@router.put("/{employee_id}/sites/{site_hist_id}")
def update_site(employee_id: int, site_hist_id: int, payload: SiteUpdate, db: Session = Depends(get_db)):
    from app.models.employee_site_history import EmployeeSiteHistory
    from app.models.employee import Employee as EmployeeModel

    hist = db.query(EmployeeSiteHistory).filter(
        EmployeeSiteHistory.id == site_hist_id,
        EmployeeSiteHistory.employee_id == employee_id
    ).first()

    if not hist:
        raise HTTPException(status_code=404, detail="Storico sito non trovato")

    try:
        for field, value in payload.dict(exclude_unset=True).items():
            setattr(hist, field, value)

        # aggiorna anche il sito attuale del dipendente
        emp = db.query(EmployeeModel).filter(EmployeeModel.id == employee_id).first()
        if emp and payload.site_id:
            emp.site_id = payload.site_id
            db.add(emp)

        db.add(hist)
        db.commit()
        db.refresh(hist)
        return {"message": "Sito aggiornato", "site_history": hist}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Errore aggiornamento sito: {str(e)}")
