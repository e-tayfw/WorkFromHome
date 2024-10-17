<?php

namespace App\Http\Controllers;

use App\Models\RequestLog;
use App\Models\Employee;
use Illuminate\Http\Request;

class RequestLogController extends Controller
{

    // get all request logs
    public function getAllRequestLog()
    {
        return RequestLog::all();
    }

    // Get request log by ID
    public function getRequestLogById($id)
    {
        // Validate if the ID is a valid positive integer
        if (!ctype_digit($id) || (int) $id <= 0) {
            return response()->json(['message' => "Invalid log ID: $id"], 400); // Bad Request
        }

        // Attempt to find the log in the database
        $log = RequestLog::find($id);

        // If the log is not found, return 404 Not Found
        if (!$log) {
            return response()->json(['message' => "No logs found for log ID: $id"], 404);
        }

        // Return the log data as JSON
        return response()->json($log);
    }

    // Get all request logs by the employee ID
    public function getRequestLogByEmployeeID($employee_id)
    {
        // Validate that the employee ID is a valid positive integer
        if (!ctype_digit($employee_id) || (int) $employee_id < 0) {
            return response()->json([
                'message' => "Invalid employee ID: $employee_id"
            ], 400); // Bad Request
        }

        // Retrieve logs for the specified employee ID
        $logs = RequestLog::where('Employee_ID', $employee_id)->get();

        // Check if no logs are found for the employee
        if ($logs->isEmpty()) {
            return response()->json([
                'message' => "No logs found for employee ID: $employee_id"
            ], 404); // Not Found
        }

        // Return the logs as JSON
        return response()->json($logs);
    }

    // Get all request logs auto-rejected by the system (Employee_ID = '000000')
    public function getAutoRejectedLogs()
    {
        // Retrieve logs where Employee_ID is '000000' (system)
        $logs = RequestLog::where('Employee_ID', '000000')->get();

        // Check if no logs are found
        if ($logs->isEmpty()) {
            return response()->json([
                'message' => 'No auto-rejected logs found by the system (Employee_ID: 000000)'
            ], 404);
        }

        // Return the logs as JSON
        return response()->json($logs);
    }

    // for complex queries
    public function filterRequestLogs(Request $request)
    {
        // Validate the optional filters with capitalized field names
        $validated = $request->validate([
            'Start_Date' => 'nullable|date',
            'End_Date' => 'nullable|date|after_or_equal:Start_Date',
            'Employee_ID' => 'nullable|integer',
            'Previous_State' => 'nullable|string',
            'New_State' => 'nullable|string',
            'Request_ID' => 'nullable|integer',
        ]);

        // Build the query dynamically based on the provided filters
        $query = RequestLog::query();

        // Apply date range filter if provided
        if (!empty($validated['Start_Date']) && !empty($validated['End_Date'])) {
            $query->whereBetween('Date', [$validated['Start_Date'], $validated['End_Date']]);
        }

        // Apply employee ID filter if provided
        if (!empty($validated['Employee_ID'])) {
            $query->where('Employee_ID', $validated['Employee_ID']);
        }

        // Apply request ID filter if provided
        if (!empty($validated['Request_ID'])) {
            $query->where('Request_ID', $validated['Request_ID']);
        }

        // Apply previous state filter if provided
        if (!empty($validated['Previous_State'])) {
            $query->where('Previous_State', $validated['Previous_State']);
        }

        // Apply new state filter if provided
        if (!empty($validated['New_State'])) {
            $query->where('New_State', $validated['New_State']);
        }

        // Execute the query and get the results
        $logs = $query->get();

        // Check if no logs are found
        if ($logs->isEmpty()) {
            return response()->json([
                'message' => 'No logs found for the provided filters'
            ], 404);
        }

        // Return the filtered logs as JSON
        return response()->json($logs);
    }


    // get request logs for that request id
    public function getRequestLogsByRequestId($requestId)
    {
        // Validate that the Request ID is a positive integer
        if (!ctype_digit($requestId) || (int) $requestId <= 0) {
            return response()->json([
                'message' => "Invalid Request ID: $requestId"
            ], 400); // Bad Request
        }

        // Retrieve logs for the specified Request ID
        $logs = RequestLog::where('Request_ID', $requestId)->get();

        // Check if no logs are found for the provided Request ID
        if ($logs->isEmpty()) {
            return response()->json([
                'message' => "No logs found for Request ID: $requestId"
            ], 404); // Not Found
        }

        // Return the logs as JSON
        return response()->json($logs);
    }
}
