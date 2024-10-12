<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\TestScheduleController;
use App\Http\Controllers\RequestController;
use App\Http\Controllers\ScheduleController;

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

// Employee
Route::get('/employees', [EmployeeController::class, 'getAllEmployees']);
Route::get('/employee/id/{id}', [EmployeeController::class, 'getEmployeeById']);
Route::get('/employee/email/{email}', [EmployeeController::class, 'getEmployeeByEmail']);
Route::get('/employee/department/{department}', [EmployeeController::class, 'getEmployeeByDepartment']);
Route::get('/employee/team/manager/{reportingManager}', [EmployeeController::class, 'getEmployeeTeamByManager']);
Route::get('/employee/team/member/{teamMember}', [EmployeeController::class, 'getEmployeeTeamByMember']);
Route::get('/employee/name/{id}', [EmployeeController::class, 'getEmployeeFullNameByStaffID']);
Route::get(uri: '/testScheduleData', action: [TestScheduleController::class, 'getSchedule']);

// Request
Route::get(uri: '/request', action: [RequestController::class, 'getAllRequests']);
Route::get(uri: '/request/requestorId/{employee_id}', action: [RequestController::class, 'getRequestsByRequestorID']);
Route::get(uri: '/request/approverID/{employee_id}', action: [RequestController::class, 'getRequestsByApproverID']);
Route::post(uri:'/request', action: [RequestController::class, 'createRequest']);

// Schedule
Route::get(uri: '/generateOwnSchedule/{staff_id}', action: [ScheduleController::class, 'generateOwnSchedule']);
Route::get(uri: '/generateTeamSchedule/{staff_id}', action: [ScheduleController::class, 'generateTeamSchedule']);
Route::get(uri: '/generateTeamScheduleByManager/{reportingManager}', action:[ScheduleController::class, 'generateTeamScheduleByManager']);
Route::get(uri: '/generateDepartmentSchedule/{dept}', action:[ScheduleController::class, 'generateDepartmentSchedule']);
Route::get('/generateHRScheduleByDepartment', [ScheduleController::class, 'generateHRScheduleByDepartment']);
Route::get('/generateHRScheduleByTeam' , [ScheduleController::class, 'generateHRScheduleByTeam']);
