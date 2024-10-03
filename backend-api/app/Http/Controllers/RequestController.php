<?php

namespace App\Http\Controllers;

use App\Models\Requests;
use App\Models\RequestLog;
use App\Models\Employee;
use Illuminate\Http\Request;
use DateTime;
use Error;

class RequestController extends Controller
{
    // Fetch All Requests
    public function getAllRequests()
    {
        return response()->json(Requests::all());
    }

    // Fetch propoertion of people in team that is working from home
    public function getProportionOfTeam($approver_id)
    {
        // query database for the people with that approver
        $request = Requests::where(column: 'Approver_ID', operator: $approver_id)->get();
        $team_size = Employee::where('Reporting_Manager', $approver_id)->count();
        if ($team_size != 0) {
            $proportion = 1 / $team_size;
        } else {
            return response()->json(['message' => 'This person managers 0 people.'], 404);
        }

        if ($request) {
            // create a dictionary of different dates and check how many people are working from home for that date
            $date_dictionary = [];
            // for loop to iterate through date_dictionary to find different dates and see how many people are working from home for that date
            foreach ($request as $req) {
                $date = $req->Date_Requested;
                $arrangement = $req->Duration;

                if (!isset($date_dictionary[$date])) {
                    $date_dictionary[$date] = ['AM' => 0, 'PM' => 0, 'FD' => 0];
                }

                if ($arrangement === 'AM') {
                    $date_dictionary[$date]['AM'] += $proportion;
                } else if ($arrangement === "PM") {
                    $date_dictionary[$date]['PM'] += $proportion;
                } else if ($arrangement === "FD") {
                    $date_dictionary[$date]["FD"] += $proportion;
                }
            }

            return response()->json($date_dictionary);
        } else {
            return response()->json(['message' => 'Request not found'], 404);
        }
    }

    // Fetch propoertion of people in team that is working from home on a specific date
    public function getProportionOfTeamOnDate($approver_id, $date)
    {
        if (!preg_match('/^\d{4}-(0?[1-9]|1[0-2])-(0?[1-9]|[12]\d|3[01])$/', $date)) {
            return response()->json(['message' => 'The format of date is not correct, sample format 2024-10-03', 'received format' => $date], 400);
        }
        $formattedDate = (new DateTime($date))->format('Y-m-d');

        // query database for the people with that approver
        $request = Requests::where(column: 'Approver_ID', operator: $approver_id)->get();
        $team_size = Employee::where('Reporting_Manager', $approver_id)->count();
        if ($team_size != 0) {
            $proportion = 1 / $team_size;
        } else {
            return response()->json(['message' => 'This person manages 0 people.'], 404);
        }

        if ($request) {
            // create a dictionary of different dates and check how many people are working from home for that date
            $date_dictionary = [];
            // for loop to iterate through date_dictionary to find different dates and see how many people are working from home for that date
            foreach ($request as $req) {
                $dateOfReq = $req->Date_Requested;
                $formattedDateOfReq = (new DateTime($dateOfReq))->format('Y-m-d');
                if ($formattedDate == $formattedDateOfReq) {
                    // how to print the values of $dateOfReq and $date
                    $arrangement = $req->Duration;

                    if (!isset($date_dictionary[$date])) {
                        $date_dictionary[$date] = ['AM' => 0, 'PM' => 0, 'FD' => 0];
                    }

                    if ($arrangement === 'AM') {
                        $date_dictionary[$date]['AM'] += $proportion;
                    } else if ($arrangement === "PM") {
                        $date_dictionary[$date]['PM'] += $proportion;
                    } else if ($arrangement === "FD") {
                        $date_dictionary[$date]["FD"] += $proportion;
                    }
                }
            }

            return response()->json($date_dictionary);
        } else {
            return response()->json(['message' => 'Request not found', "dateofreq" => $dateOfReq,], 404);
        }
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

    // Create Request
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
            $existingRequest = Requests::where([["Requestor_ID", '=', $staff_id], ["Date_Requested", '=', $selectedDate]])->first();
            if ($existingRequest) {
                return response()->json([
                    'message' => 'A request for the same date already exists',
                    'date' => $selectedDate,
                    'success' => false
                ]);
            } else {
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
                        $newRequestLog->Previous_State = 'Pending';
                        $newRequestLog->New_State = "Pending";
                        $newRequestLog->Employee_ID = $staff_id;
                        $newRequestLog->Date = date("Y-m-d");
                        $newRequestLog->Remarks = $reason;

                        // Save the Request Log
                        if ($newRequestLog->save()) {
                            // Return success response with created Request and RequestLog details
                            return response()->json([
                                'message' => 'Rows for Request and RequestLog have been successfully created',
                                'success' => true,
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

    // Approve Request
    public function approveRequest(Request $request)
    {
        // Decode json input and give assign to variables based on key
        $request_id = $request->input('Request_ID');
        $requestor_id = $request->input('Requestor_ID');
        $approver_id = $request->input('Approver_ID');
        $status = $request->input('Status');
        $date = $request->input('Date_Requested');
        $request_batch = $request->input('Request_Batch');
        $date_of_request = $request->input('Date_Of_Request');
        $wfh_type = $request->input('Duration');
        $created_at = $request->input('created_at');
        $updated_at = $request->input('updated_at');
        $reason = $request->input('reason');

        // Fetch employee row using staff_id
        $requestDB = Requests::where("Request_ID", $request_id)->first();

        // check for batch = null
        if($request_batch !== null) {
            return response()-> json(['message'=>'Request is batch request, unable to approve this request by itself'], 400);
        }

        // check for correct status
        if ($status !== 'Approved') {
            return response()->json(['message' => 'You are not trying to approve request, this endpoint was to approve requests'], 400);
        }

        // check if the requst is already approved
        if ($requestDB->Status == "Approved") {
            return response()->json(['message' => "Request was already Approved"], 400);
        }

        // check if the person rejecting the request is the approver
        if ($requestDB->Approver_ID !== $approver_id) {
            return response()->json(['message' => "You are not allowed to approve this request"], 400);
        }

        // check for 50% rule violation
        if (!preg_match('/^\d{4}-(0?[1-9]|1[0-2])-(0?[1-9]|[12]\d|3[01])$/', $date)) {
            return response()->json(['message' => 'The format of date is not correct, sample format 2024-10-03', 'received format' => $date], 400);
        }
        $formattedDate = (new DateTime($date))->format('Y-m-d');

        // query database for the people with that approver
        $requests = Requests::where(column: 'Approver_ID', operator: $approver_id)->get();
        $team_size = Employee::where('Reporting_Manager', $approver_id)->count();
        if ($team_size != 0) {
            $proportion = 1 / $team_size;
        } else {
            return response()->json(['message' => 'This person manages 0 people.'], 404);
        }


        if ($requests) {
            // create a dictionary of different dates and check how many people are working from home for that date
            $date_dictionary = [];
            // for loop to iterate through date_dictionary to find different dates and see how many people are working from home for that date
            foreach ($requests as $req) {
                $dateOfReq = $req->Date_Requested;
                $formattedDateOfReq = (new DateTime($dateOfReq))->format('Y-m-d');
                if ($formattedDate == $formattedDateOfReq) {
                    // how to print the values of $dateOfReq and $date
                    $arrangement = $req->Duration;

                    if (!isset($date_dictionary[$date])) {
                        $date_dictionary[$date] = ['AM' => 0, 'PM' => 0, 'FD' => 0];
                    }

                    if ($arrangement === 'AM') {
                        $date_dictionary[$date]['AM'] += $proportion;
                    } else if ($arrangement === "PM") {
                        $date_dictionary[$date]['PM'] += $proportion;
                    } else if ($arrangement === "FD") {
                        $date_dictionary[$date]["FD"] += $proportion;
                    }
                }
            }
            // Check for if the next person exceeds 50% violation
            $curr = $date_dictionary[$date][$wfh_type];
            $curr = $curr + $proportion;
            if ($curr > 0.5) {
                return response()->json(['message' => 'Unable to accept request as this would lead to less than 50% of the team being in office'], 400);
            }
        }

        // Approve request
        // Add to request log table
        $newRequestLog = new RequestLog();
        $newRequestLog->Request_ID = $requestDB->Request_ID;
        $newRequestLog->Previous_State = $requestDB->Status;
        $newRequestLog->New_State = $status;
        $newRequestLog->Employee_ID = $approver_id;
        $newRequestLog->Date = date("Y-m-d");
        $newRequestLog->Remarks = $reason;
        $requestDB->Status = 'Approved';
        $requestDB->save();

        // Save the Request Log
        if ($newRequestLog->save()) {
            // If request log saves successfully
            return response()->json($requestDB, 200);
        } else {
            // Handle error saving RequestLog
            return response()->json(['message' => 'Failed to create Request Logs'], 500);
        }
        
        return response()->json($requestDB);
    }

    // Reject Request
    public function rejectRequest(Request $request)
    {
        // Decode json input and give assign to variables based on key
        $request_id = $request->input('Request_ID');
        $requestor_id = $request->input('Requestor_ID');
        $approver_id = $request->input('Approver_ID');
        $status = $request->input('Status');
        $date_requested = $request->input('Date_Requested');
        $request_batch = $request->input('Request_Batch');
        $date_of_request = $request->input('Date_Of_Request');
        $duration = $request->input('Duration');
        $created_at = $request->input('created_at');
        $updated_at = $request->input('updated_at');
        $reason = $request->input('reason');

        // Fetch employee row using staff_id
        $requestDB = Requests::where("Request_ID", $request_id)->first();

        // Checking for correct status
        if ($status !== 'Rejected') {
            return response()->json(['message' => 'You are not trying to reject request, this endpoint was to reject requests'], 400);
        }

        // check for batch = null
        if($request_batch !== null) {
            return response()-> json(['message'=>'Request is batch request, unable to approve this request by itself'], 400);
        }

        // check for reason provided
        if ($reason == "") {
            return response()->json(['message' => "Reason was not provided"], 400);
        }

        // check if the requst is already rejected
        if ($requestDB->Status == "Rejected") {
            return response()->json(['message' => "Request was already rejected"], 400);
        }

        // check if the person rejecting the request is the approver
        if ($requestDB->Approver_ID !== $approver_id) {
            return response()->json(['message' => "You are not allowed to reject this request"], 400);
        }

        // Insert any other functional checks before rejection can be done

        // Change state of the ticket to rejected
        $requestDB->Status = 'Rejected';
        $requestDB->save();
        return response()->json($requestDB);
        // Add to request log table
        $newRequestLog = new RequestLog();
        $newRequestLog->Request_ID = $requestDB->Request_ID;
        $newRequestLog->Previous_State = $requestDB->Status;
        $newRequestLog->New_State = $status;
        $newRequestLog->Employee_ID = $approver_id;
        $newRequestLog->Date = date("Y-m-d");
        $newRequestLog->Remarks = $reason;
        // Save the Request Log
        if ($newRequestLog->save()) {
            // If request log saves successfully
            return response()->json($requestDB, 200);
        } else {
            // Handle error saving RequestLog
            return response()->json(['message' => 'Failed to create Request Logs'], 500);
        }
    }
}
