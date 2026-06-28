# IMPORTA TUTTI I MODELLI QUI
from app.models.site import Site, HRSite
from app.models.employee import Employee
from app.models.role import Role

# Modelli HR principali
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

# Modelli aggiuntivi
from app.models.work_regime import WorkRegime
from app.models.contract_nature import ContractNature
from app.models.cost_center import CostCenter
from app.models.department import Department

