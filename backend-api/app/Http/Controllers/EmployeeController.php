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
}
