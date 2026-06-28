# Import dei modelli necessari per l'inizializzazione del DB
# ⚠️ Importiamo SOLO ciò che serve davvero e NON duplicato altrove.

from app.models.employee import Employee
from app.models.role import Role
from app.models.site import Site

# Modelli HR
from app.models.employee_contracts import EmployeeContract
from app.models.employee_benefits import EmployeeBenefit
from app.models.employee_site_history import EmployeeSiteHistory
from app.models.employee_status_history import EmployeeStatusHistory
from app.models.employee_enac_approvals import EmployeeEnacApproval
from app.models.employee_enac_courses import EmployeeEnacCourse
from app.models.employee_company_cars import EmployeeCompanyCar
from app.models.employee_salaries import EmployeeSalary
from app.models.employee_departments import EmployeeDepartment
from app.models.employee_cost_centers import EmployeeCostCenter

# Board, Ticket, Communication, Audit
from app.models.board import BoardFile, BoardFileSite
from app.models.ticket import Ticket
from app.models.communication import Communication
from app.models.audit import ActivityLog, UserHistoryLog
from app.models.import_users_log import ImportUsersLog
