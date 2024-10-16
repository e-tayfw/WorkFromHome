<?php

namespace App\Http\Controllers;

use App\Models\Requests;
use App\Models\RequestLog;
use App\Models\Employee;
use Illuminate\Http\Request;
use App\Jobs\RejectPendingRequestsOlderThanTwoMonthsJob;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Carbon\Carbon;
use DB;
use Log;

class RequestController extends Controller
{
    // Fetch All Requests
    public function getAllRequests()
    {
        return response()->json(Requests::all());
    }

    // Fetch all requests by requestorID
    public function getRequestsByRequestorID($requestor_id)
    {
        $request = Requests::where(column: 'Requestor_ID', operator: $requestor_id)->get();
        if ($request) {
            return response()->json($request);
        } else {
            return response()->json(['message' => 'Request not found'], 404);
        }
    }

    // Fetch all requests by approverID
    public function getRequestsByApproverID($approver_id)
    {
        $request = Requests::where(column: 'Approver_ID', operator: $approver_id)->get();
        if ($request) {
            return response()->json($request);
        } else {
            return response()->json(['message' => 'Request not found'], 404);
        }
    }

    public function createRequest(Request $request)
    {
        $staffId = $request->staffid;
        $selectedDate = $request->date;
        $arrangement = $request->arrangement;
        $reason = $request->reason;

        try {
            $employee = Employee::where("Staff_ID", $staffId)->firstOrFail();

            $existingRequests = Requests::where([
                ['Requestor_ID', '=', $staffId],
                ['Date_Requested', '=', $selectedDate],
                ['Status', 'in', ['Pending', 'Approved', 'Withdraw Rejected', 'Withdraw Pending']]
            ])->get();
            
            if ($existingRequests->isNotEmpty()) {
                $message = '';
                $existingArrangements = $existingRequests->pluck('Duration')->toArray();
                $two = false;

                if (count($existingArrangements) === 2 && in_array('AM', $existingArrangements) && in_array('PM', $existingArrangements) && $arrangement === 'FD') {
                    $message = 'Full day request is not needed when both AM and PM requests already exist';
                    $two = true;
                } elseif (in_array($arrangement, $existingArrangements)) {
                    $message = 'Duplicate requests cannot be made';
                } elseif (in_array('FD', $existingArrangements)) {
                    $message = 'Conflict with existing full day request';
                } elseif ($arrangement === 'FD' && (in_array('AM', $existingArrangements) || in_array('PM', $existingArrangements))) {
                    $message = 'Full day being requested when a half day arrangement already exists';
                }
            
                if ($message) {
                    return response()->json([
                        'message' => $message,
                        'existing' => implode(', ', $existingArrangements),
                        'requested' => $arrangement,
                        'date' => $selectedDate,
                        'success' => false,
                        'two' => $two
                    ], 400);
                }
            }
            

            $reportingManager = $employee->Reporting_Manager;
            $reportingManagerFName = "";
            $reportingManagerLName = "";
            $reportingManagerName = "";

            if (!$reportingManager) {
                return response()->json(['message' => 'Reporting manager not found', 'success' => false], 404);
            }
            else{
                $reportingManagerRow = Employee::where("Staff_ID", $reportingManager)->firstOrFail();
                $reportingManagerFName = $reportingManagerRow-> Staff_FName;
                $reportingManagerLName = $reportingManagerRow-> Staff_LName;
                $reportingManagerName = $reportingManagerFName . " " . $reportingManagerLName;
            }

            DB::beginTransaction();

            $newRequest = Requests::create([
                'Requestor_ID' => $staffId,
                'Approver_ID' => $reportingManager,
                'Status' => 'Pending',
                'Date_Requested' => $selectedDate,
                'Date_Of_Request' => now(),
                'Duration' => $arrangement,
            ]);

            // Dispatch the job to check status after 2 months
            RejectPendingRequestsOlderThanTwoMonthsJob::dispatch($newRequest)->delay(now()->addMonths(2));

            RequestLog::create([
                'Request_ID' => $newRequest->Request_ID,
                'Previous_State' => 'Pending',
                'New_State' => 'Pending',
                'Employee_ID' => $staffId,
                'Date' => now(),
                'Remarks' => $reason,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Rows for Request and RequestLog have been successfully created',
                'success' => true,
                'Request_ID' => $newRequest->Request_ID,
                'date' => $selectedDate,
                'arrangement' => $arrangement,
                'reason' => $reason,
                'reportingManager' => $reportingManagerName
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Employee not found', 'success' => false], 404);
        } catch (\Exception $e) {
            // Rollback transaction in case of any failure
            DB::rollBack();
            return response()->json(['message' => 'Failed to create Request or RequestLog', 'error' => $e->getMessage()], 500);
        }
    }

    public function withdrawRequest(Request $request)
    {

        // Check if the employee ID exists in the system
        $employeeExists = Employee::find($request->Employee_ID);
        if (!$employeeExists) {
            return response()->json(['message' => 'Invalid Employee ID'], 400);
        }

        // Check if the request ID exists in the system
        $requestExists = Requests::find($request->Request_ID);
        if (!$requestExists) {
            return response()->json(['message' => 'Invalid Request ID'], 400);
        }

        // Check if the request exists and belongs to the employee
        $booking = Requests::where([
            "Request_ID" => $request->Request_ID,
            "Requestor_ID" => $request->Employee_ID
        ])->first();

        if (!$booking) {
            return response()->json(
                ['message' => "Request ID: {$request->Request_ID} was not originally made by this Employee ID: {$request->Employee_ID}"], 
                404
            );
        }

        switch ($booking->Status) {
            case 'Approved':
                $wfhDate = Carbon::parse($booking->Date_Requested);
                $currentDate = Carbon::now();

                // Check if the current date is within 2 weeks of the WFH date
                if ($currentDate->diffInDays($wfhDate, false) <= 14) {
                    Requests::where('Request_ID', $request->Request_ID)->update(['Status' => 'Withdraw Pending']);
                    RequestLog::create([
                        "Request_ID" => $request->Request_ID,
                        "Employee_ID" => $request->Employee_ID,
                        "Previous_State" => "Approved",
                        "New_State" => "Withdraw Pending",
                        "Date" => $booking->Date_Of_Request, // not sure what this date is for
                        "Remarks" => $request->Reason
                    ]);
                    return response()->json(['message' => 'Request submitted for withdrawal and is now pending approval'], 200);
                } else {
                    return response()->json(['message' => 'Withdraw request can only be submitted within 2 weeks of the WFH date'], 400);
                }
            case 'Pending':
                Requests::where('Request_ID', $request->Request_ID)->update(['Status' => 'Withdrawn']);
                RequestLog::create([
                    "Request_ID" => $request->Request_ID,
                    "Employee_ID" => $request->Employee_ID,
                    "Previous_State" => "Pending",
                    "New_State" => "Withdrawn",
                    "Date" => $booking->Date_Of_Request, // not sure what this date is for
                    "Remarks" => $request->Reason
                ]);
                return response()->json(['message' => 'Request withdrawn successfully'], 200);
            case 'Rejected':
                return response()->json(['message' => 'Request is rejected for WFH, require Pending or Approved Status to withdraw'], 200);
            case 'Withdraw Rejected':
                // Allow staff to submit the withdraw again
                Requests::where('Request_ID', $request->Request_ID)->update(['Status' => 'Withdraw Pending']);
                RequestLog::create([
                    "Request_ID" => $request->Request_ID,
                    "Employee_ID" => $request->Employee_ID,
                    "Previous_State" => "Withdraw Rejected",
                    "New_State" => "Withdraw Pending",
                    "Date" => $booking->Date_Of_Request, // not sure what this date is for
                    "Remarks" => $request->Reason
                ]);
                return response()->json(['message' => 'Request resubmitted for withdrawal and is now pending approval'], 200);
            case 'Withdraw Pending':
                return response()->json(['message' => 'Withdraw Request is waiting for approval from a manager'], 200);
            case 'Withdrawn':
                return response()->json(['message' => 'Request has already been withdrawn'], 200);
            default:
                return response()->json(['message' => 'No valid action for this request Status'], 400);
        }
    }
}
