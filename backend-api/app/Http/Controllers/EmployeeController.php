<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Illuminate\Http\Request;

class EmployeeController extends Controller
{   
    // Fetch All
    public function getAllEmployees()
    {
        return response()->json(Employee::all());
    }

    // Fetch by Staff_ID
    public function getEmployeeById($staff_id)
    {
        $employee = Employee::where('Staff_ID', $staff_id)->first();

        if ($employee) {
            return response()->json($employee);
        } else {
            return response()->json(['message' => 'Employee not found'], 404);
        }
    }

    // Fetch by email
    public function getEmployeeByEmail($email)
    {
        $employee = Employee::where('Email', $email)->first();

        if ($employee) {
            return response()->json($employee);
        } else {
            return response()->json(['message' => 'Employee not found'], 404);
        }
    }

    // Fetch by department
    public function getEmployeeByDepartment($department)
    {
        // Retrieve unique departments from the Employee table
        $uniqueDepartments = Employee::select('Dept')->distinct()->pluck('Dept');
    
        // Check if the requested department exists in the list of unique departments
        if (!$uniqueDepartments->contains($department)) {
            return response()->json(['message' => 'Department not found'], 404); 
        }
    
        // Proceed to fetch employees in the department
        $employees = Employee::where('Dept', $department)->get();
    
        if ($employees->isEmpty()) {
            return response()->json(['message' => 'No employees found in this department'], 404);
        } else {
            return response()->json($employees);
        }
    }

    // Fetch team by their manager
    public function getEmployeeTeamByManager($reportingManager)
    {
        // Proceed to fetch employees in the department
        $manager = Employee::where('Staff_ID', $reportingManager)->first();
        $employees = Employee::where('Reporting_Manager', $reportingManager)->get();

        if (!$manager) {
            return response()->json(['message' => 'Reporting manager not found'], 404);
        }
        
        if ($employees->isEmpty()) {
            return response()->json(['message' => 'No employee reports to this person'], 404);
        } else {
            // Combine the manager and employees in a single response
            $result = [
                'manager' => $manager,
                'employees' => $employees
            ];
            return response()->json($result);
        }
    }

    // Fetch team by their member
    public function getEmployeeTeamByMember($teamMember)
    {
        // First, fetch the team member's information to find their reporting manager
        $member = Employee::where('Staff_ID', $teamMember)->first();

        if (!$member) {
            return response()->json(['message' => 'Team member not found'], 404);
        }

        // Now, fetch the reporting manager of this team member
        $reportingManager = $member->Reporting_Manager;

        // Fetch the manager's information
        $manager = Employee::where('Staff_ID', $reportingManager)->first();

        if (!$manager) {
            return response()->json(['message' => 'Reporting manager not found'], 404);
        }

        // Fetch all employees reporting to the same manager (i.e., the team)
        $employees = Employee::where('Reporting_Manager', $reportingManager)->get();

        if ($employees->isEmpty()) {
            return response()->json(['message' => 'No employees report to this manager'], 404);
        }

        // Combine the manager and the employees into a single response
        $result = [
            'manager' => $manager,
            'employees' => $employees
        ];

        return response()->json($result);
    }

    public function getEmployeeFullNameByStaffID($staff_id)
    {
         $employee = Employee::where('Staff_ID', $staff_id)->first();

        if ($employee) {
            return response()->json($employee->Staff_FName . ' ' . $employee->Staff_LName);
        } else {
            return 'Employee not found';
        }
    }

}
