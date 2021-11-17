import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../dashboard.service';
import { AuthenticationService } from '../../authentication/authentication.service';
import { EmployeeModel } from 'src/app/model/employee.model';
import { PlanShiftModel } from 'src/app/model/shift.model';
import { DepartmentModel } from 'src/app/model/department.model';
import { ShiftCodeModel } from 'src/app/model/shift.model';
import { TimeRecordModel } from 'src/app/model/timerecord.model';

@Component({
  selector: 'app-dashboard-employee',
  templateUrl: './dashboard-employee.component.html',
  styleUrls: ['./dashboard-employee.component.scss']
})
export class DashboardEmployeeComponent implements OnInit {
  planshifts: Array<PlanShiftModel> = new Array<PlanShiftModel>()
  today_plan: PlanShiftModel = new PlanShiftModel()
  employee: EmployeeModel = new EmployeeModel()
  today: Date | string
  employee_id: number
  department : DepartmentModel = new DepartmentModel()
  shiftcodes: Array<ShiftCodeModel> = new Array<ShiftCodeModel>()
  actual_times: Array<TimeRecordModel> = new Array<TimeRecordModel>()
  time_in:any = '-'
  time_out:any = '-' 
  date_in:any = '-'
  date_out:any = '-'
  actual_ot: number = 0
  department_id:number

  constructor(private dashboardService: DashboardService, private authService: AuthenticationService) { }

  ngOnInit(): void {
    this.today = new Date()
    this.today = this.today.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    
    this.employee_id = this.authService.getUserid()

    this.dashboardService.getEmployeeInfo(this.employee_id).subscribe((response) => {
      this.employee = response[0]
      this.department = this.employee.department[0]
      this.department_id = this.employee.department[0].id
    })

    this.dashboardService.getEmpPlanShift(this.employee_id).subscribe((response) => {
      this.planshifts = response
      let today = new Date();
      let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();   
      let plan = (this.planshifts.find(element => element["date"] == date))
      if (plan){
        this.today_plan = plan
      }
    })

    this.dashboardService.getAllShiftcode().subscribe((response) => {
      this.shiftcodes = response
    })

    this.dashboardService.getTodayEmpTimerecord(this.employee_id).subscribe((response) => {
      this.actual_times = response
      let IN = (this.actual_times.find(element => element["status"] == "In"))
      let OUT = (this.actual_times.find(element => element["status"] == "Out"))
      if (IN){
        this.time_in = IN?.time.slice(0,8)
        this.date_in = IN?.date
      }
      if (OUT){
        this.time_out = OUT?.time.slice(0,8)
        this.date_out = OUT?.date
      }
    })
    

  }

  start_work(){
    var val = { department: [this.department_id],
                employee: [this.employee_id],
                status: "In",
              }
    console.log(val)
    this.dashboardService.add_timerecord(val).subscribe(res=>{
    alert(res.toString());
    });
  }

  end_work(){
    var val = { 
                "department": [this.department_id],
                "employee": [this.employee_id],
                "status": "Out",
              }
    console.log(val)
    this.dashboardService.add_timerecord(val).subscribe(res=>{
    alert(res.toString());
    });
  }

  convertToThaiDate(d: string) {
    let date = parseInt(d.substring(8,10))
    let month = parseInt(d.substring(5,7))
    let year = parseInt(d.substring(0,4))

    let date_input = new Date(year, month-1, date)
    
    return date_input.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  getBreaktime(start:any){
    let shiftcode = this.shiftcodes.find(element => element.start_time == start)
    return shiftcode?.start_break + '-' + shiftcode?.end_break
  }

  getActualOT(){
    let timediff = this.calculateOT(new Date(this.today_plan.date+' '+this.today_plan.end_time), new Date(this.date_out+' '+this.time_out))
    if (timediff){
      this.actual_ot = timediff
    }
    return this.actual_ot
    
  }

  calculateOT(dateFuture:any, dateNow:any) {
    let diffInMilliSeconds = Math.abs(dateFuture - dateNow) / 1000;

    // calculate days
    const days = Math.floor(diffInMilliSeconds / 86400);
    diffInMilliSeconds -= days * 86400;

    // calculate hours
    const hours = Math.floor(diffInMilliSeconds / 3600) % 24;
    diffInMilliSeconds -= hours * 3600;

    // calculate minutes
    const minutes = Math.floor(diffInMilliSeconds / 60) % 60;
    diffInMilliSeconds -= minutes * 60;
    
    return hours;
  }
  
 
}
