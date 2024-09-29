<?php

namespace App\Http\Controllers;

use App\Models\Requests;
use App\Models\RequestLog;
use App\Models\Employee;
use Illuminate\Http\Request;

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
        // Decode json input and give assign to variables based on key
        $staff_id = $request->input('staffid');
        $selectedDate = $request->input('date');
        $arrangement = $request->input('arrangement');
        $reason = $request->input('reason');

        // Fetch employee row using staff_id
        $employee = Employee::where("Staff_ID", $staff_id)->first();


        if ($employee) {

            // Check if a request exists for the same date
            $existingRequest = Requests::where([["Requestor_ID", '=', $staff_id],["Date_Requested",'=', $selectedDate]])->first();
            if($existingRequest){
                return response()->json([
                    'message' => 'Request for the same date already exists',
                    'status' => "failure"
                ]);
            }
            else{
                // Get reporting manager
                $reporting_manager = $employee->Reporting_Manager;
            
                // If Reporting Manager found, update the DB with the request
                if ($reporting_manager) {
                    // Create new Request row
                    $newRequest = new Requests();
                    $newRequest->Requestor_ID = $staff_id;
                    $newRequest->Approver_ID = $reporting_manager;
                    $newRequest->Status = "Pending";
                    $newRequest->Date_Requested = $selectedDate;
                    $newRequest->Date_Of_Request = date("Y-m-d");
                    $newRequest->Duration = $arrangement;
            
                    // Save the Request
                    if ($newRequest->save()) {
                        // Create new Request Log row
                        $newRequestLog = new RequestLog();
                        $newRequestLog->Request_ID = $newRequest->Request_ID;
                        $newRequestLog->Previous_State = "-";
                        $newRequestLog->New_State = "Pending";
                        $newRequestLog->Employee_ID = $staff_id;
                        $newRequestLog->Date = date("Y-m-d");
                        $newRequestLog->Remarks = $reason;
            
                        // Save the Request Log
                        if ($newRequestLog->save()) {
                            // Return success response with created Request and RequestLog details
                            return response()->json([
                                'message' => 'Request and RequestLog created successfully',
                                'status' => 'success',
                                'date' => $selectedDate,
                                "arrangement" => $arrangement,
                                "reportingManager" => $reporting_manager
                            ]);
                        } else {
                            // Handle error saving RequestLog
                            return response()->json(['message' => 'Failed to create RequestLog'], 500);
                        }
                    } else {
                        // Handle error saving Request
                        return response()->json(['message' => 'Failed to create Request'], 500);
                    }
                }
            }
        }
    }

}
