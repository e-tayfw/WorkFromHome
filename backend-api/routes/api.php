<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\TestScheduleController;
use App\Http\Controllers\RequestController;
use App\Http\Controllers\RequestLogController;
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
Route::post(uri: '/request', action: [RequestController::class, 'createRequest']);
Route::get(uri: '/request/proportionOfTeam/{approver_id}', action: [RequestController::class, 'getProportionOfTeam']);
Route::get(uri: '/request/proportionOfTeam/date/{approver_id}/{date}', action: [RequestController::class, 'getProportionOfTeamOnDate']);
Route::post('/request/withdraw', [RequestController::class, 'withdrawRequest']);
Route::post('/request/managerWithdraw', [RequestController::class, 'managerWithdrawBooking']);

// Schedule
Route::get(uri: '/generateOwnSchedule/{staff_id}', action: [ScheduleController::class, 'generateOwnSchedule']);
Route::get(uri: '/generateTeamSchedule/{staff_id}', action: [ScheduleController::class, 'generateTeamSchedule']);
Route::get(uri: '/generateTeamScheduleByManager/{reportingManager}', action: [ScheduleController::class, 'generateTeamScheduleByManager']);
Route::get(uri: '/generateDepartmentSchedule/{dept}', action: [ScheduleController::class, 'generateDepartmentSchedule']);

// Request Approval
Route::post(uri: '/approveRequest', action: [RequestController::class, 'approveRequest']);

// Request Rejection
Route::post(uri: '/rejectRequest', action: [RequestController::class, 'rejectRequest']);
Route::get(uri: '/generateTeamScheduleByManager/{reportingManager}', action:[ScheduleController::class, 'generateTeamScheduleByManager']);
Route::get(uri: '/generateDepartmentSchedule/{dept}', action:[ScheduleController::class, 'generateDepartmentSchedule']);
Route::get('/generateHRScheduleByDepartment', [ScheduleController::class, 'generateHRScheduleByDepartment']);
Route::get('/generateHRScheduleByTeam' , [ScheduleController::class, 'generateHRScheduleByTeam']);
Route::get('/generateTeamScheduleByDirector/{director}', [ScheduleController::class, 'generateTeamScheduleByDirector']);

// Recurring Requests
Route::post('/recurringRequest', [RequestController::class, 'createRecurringRequest']);
Route::post(uri: '/rejectRecurringRequest', action: [RequestController::class, 'rejectRecurringRequest']);
Route::post(uri: '/approveRecurringRequest', action: [RequestController::class, 'approveRecurringRequest']);

// Request Logs
Route::get('/requestLog', [RequestLogController::class, 'getAllRequestLog']);
Route::get('/requestLog/logId/{id}', [RequestLogController::class, 'getRequestLogById']);
Route::get('/requestLog/employeeId/{employee_id}', [RequestLogController::class, 'getRequestLogByEmployeeID']);
Route::get('/requestLog/autoRejected', [RequestLogController::class, 'getAutoRejectedLogs']);
Route::get('/requestLog/requestId/{requestId}', [RequestLogController::class, 'getRequestLogsByRequestId']);
Route::post('/requestLog/filter', [RequestLogController::class, 'filterRequestLogs']);
