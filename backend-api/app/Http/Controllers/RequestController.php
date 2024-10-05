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

            $existingRequest = Requests::where([
                ['Requestor_ID', '=', $staffId],
                ['Date_Requested', '=', $selectedDate]
            ])->first();

            if ($existingRequest) {
                return response()->json([
                    'message' => 'A request for the same date already exists',
                    'date' => $selectedDate,
                    'success' => false
                ]);
            }

            $reportingManager = $employee->Reporting_Manager;
            if (!$reportingManager) {
                return response()->json(['message' => 'Reporting manager not found', 'success' => false], 404);
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
                'date' => $selectedDate,
                'arrangement' => $arrangement,
                'reportingManager' => $reportingManager
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Employee not found', 'success' => false], 404);
        } catch (\Exception $e) {
            // Rollback transaction in case of any failure
            DB::rollBack();
            return response()->json(['message' => 'Failed to create Request or RequestLog', 'error' => $e->getMessage()], 500);
        }
    }

    public function withdrawRequest($id)
    {
        $request = Requests::find($id);

        if (!$request) {
            return response()->json(['message' => 'No request found with that id'], 404);
        }

        switch ($request->Status) {
            case 'Approved':
                $wfhDate = Carbon::parse($request->Date_Requested);
                $currentDate = Carbon::now();

                // Check if the current date is within 2 weeks of the WFH date
                if ($currentDate->diffInDays($wfhDate, false) <= 14) {
                    Requests::where('Request_ID', $id)->update(['Status' => 'Withdraw Pending']);
                    return response()->json(['message' => 'Request submitted for withdrawal and is now pending approval'], 200);
                } else {
                    return response()->json(['message' => 'Withdraw request can only be submitted within 2 weeks of the WFH date'], 400);
                }
            case 'Pending':
                Requests::where('Request_ID', $id)->update(['Status' => 'Withdrawn']);
                return response()->json(['message' => 'Request withdrawn successfully'], 200);
            case 'Rejected':
                return response()->json(['message' => 'Request is rejected for WFH, require Pending or Approved Status to withdraw'], 200);
            case 'Withdraw Rejected':
                // Allow staff to submit the withdraw again
                Requests::where('Request_ID', $id)->update(['Status' => 'Withdraw Pending']);
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
