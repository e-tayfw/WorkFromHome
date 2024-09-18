<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\TestScheduleController;

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

// Employee
Route::get('/employees', [EmployeeController::class, 'getAllEmployees']);
Route::get('/employee/id/{id}', [EmployeeController::class, 'getEmployeeById']);
Route::get('/employee/email/{email}', [EmployeeController::class, 'getEmployeeByEmail']);
Route::get(uri: '/testScheduleData', action: [TestScheduleController::class, 'getSchedule']);