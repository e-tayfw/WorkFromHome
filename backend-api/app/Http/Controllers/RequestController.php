<?php

namespace App\Http\Controllers;

use App\Models\Requests;


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

    // public function createRequest($request_info)
    // {   
    //     // Decode json input and give assign to variables based on key
    //     $decoded_request = json_decode($request_info);

    //     $staff_id = $decoded_request->staffid;
    //     $selectedDate = $decoded_request->date;
    //     $arrangement = $decoded_request->preferredArrangement;
    //     $reason = $decoded_request->reason;

    //     // Fetch employee row using staff_id
    //     $employee = Employee::where("Staff_ID", $staff_id)->first();

    //     // If found retrieve the staff's Reporting Manager
    //     if ($employee) {
            
    //         $reporting_manager = $employee->Reporting_Manager;

    //         // If Reporting Manager found, update the DB with the request
    //         if ($reporting_manager) {
    //             // Create new Request row
    //             $newRequest = new Requests();
    //             $newRequest -> Requestor_ID = $staff_id;
    //             $newRequest -> Approver_ID = $reporting_manager;
    //             $newRequest -> Status = "Pending";
    //             $newRequest -> Date_Requested = $selectedDate;
    //             $newRequest -> Date_Of_Request = date("Y-m-d");
    //             $newRequest -> Duration = $arrangement;

    //             $newRequest-> save();

                // Create new Request Log row
                // $newRequestLog = new 
            }
        }
    }
}
