<?php

namespace App\Http\Controllers;

use App\Models\Requests;
use App\Models\RequestLog;
use App\Models\Employee;
use Illuminate\Http\Request;
use DateTime;
use Error;
use App\Jobs\RejectPendingRequestsOlderThanTwoMonthsJob;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

use Log;
use Mockery\Generator\StringManipulation\Pass\Pass;

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
        $request = Requests::where([['Approver_ID', $approver_id], ['Status', 'Approved']])->get();
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
            return response()->json(['message' => 'The format of date is not correct, sample format 2024-10-03'], 424);
        }
        $formattedDate = (new DateTime($date))->format('Y-m-d');

        // query database for the people with that approver
        $request = Requests::where([['Approver_ID', $approver_id], ['Status', 'Approved']])->get();
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
            return response()->json(['message' => 'Request not found'], 404);
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

    public function createRequest(Request $request)
    {
        $staffId = $request->staffid;
        $selectedDate = $request->date;
        $arrangement = $request->arrangement;
        $reason = $request->reason;

        if (strlen($reason) > 255) {
            $reason = substr($reason, 0, 255);
        }

        try {
            $employee = Employee::where("Staff_ID", $staffId)->firstOrFail();

            // Check if there are existing requests
            $existingRequests = Requests::where('Requestor_ID', $staffId)
            ->where('Date_Requested', $selectedDate)
            ->whereIn('Status', ['Pending', 'Approved', 'Withdraw Rejected', 'Withdraw Pending'])
            ->get();

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
                
                // Return failure if existing request condition is met
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

            // Check for reporting manager and return failure if not found
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

            // Create new row in Request if all conditions are met
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

            // Create new row in Request Log
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

    public function createRecurringRequest(Request $request)
    {
        // Step 1: Retrieve Start Date (YYYY-MM-DD), End Date (YYYY-MM-DD), Staff ID, Arrangement (AM, PM, FD), Reason, Day chosen for Recurring (Integer format)
        $staffId = $request->staffId;
        $startDate = $request->startDate;
        $endDate = $request->endDate;
        $arrangement = $request->arrangement;
        $reason = $request->reason;
        $dayChosen = $request->dayChosen;

        // Step 1a: Check if the reason is more than 255 characters, if more than 255 characters, return the first 255
        if (strlen($reason) > 255) {
            $reason = substr($reason, 0, 255);
        }

        // Step 1b: take the current date in (YYYY-MM-DD) format as well
        $currentDate = date("Y-m-d");

        // Step 1c: Get current UNIX timestamp in milliseconds
        $requestBatch = round(microtime(true) * 1000); // Using microtime for milliseconds

        // Step 1d: Condition to check if $startDate and endDate is more than 3 months apart, if more than 3 months apart, return an error message which state the reason
        // **Condition 1**: Validate date range is within 3 months apart
        $startDateCarbon = Carbon::createFromFormat('Y-m-d', $startDate);
        $endDateCarbon = Carbon::createFromFormat('Y-m-d', $endDate);
        if ($startDateCarbon->diffInMonths($endDateCarbon) > 3) {
            return response()->json([
                'message' => 'The date range must be within 3 months apart',
                'success' => false,
                'day' => $dayChosen,
                'startDate' => $startDate,
                'endDate' => $endDate,
                'arrangement' => $arrangement,
                'reason' => $reason,
            ], 400);
        }

        // Step 2: Retrieve the Staff ID from the Employee Table 
        try {
            $employee = Employee::where("Staff_ID", $staffId)->firstOrFail();

            // Step 3: Check if there is any pending / approved / withdraw pending / withdraw rejected requests for the staff ID within the start date and end date
            $existingRequests = Requests::where('Requestor_ID', $staffId)
                ->whereBetween('Date_Requested', [$startDate, $endDate])
                ->whereIn('Status', ['Pending', 'Approved', 'Withdraw Rejected', 'Withdraw Pending'])
                ->get();

            // Step 4: Check for the following conditions
            // **Condition 2**: Validate date range is within 2 months back and 3 months forward
            $startDateCarbon = Carbon::createFromFormat('Y-m-d', $startDate);
            $endDateCarbon = Carbon::createFromFormat('Y-m-d', $endDate);
            $currentDateCarbon = Carbon::createFromFormat('Y-m-d', $currentDate);

            $twoMonthAgoFromCurrent = $currentDateCarbon->copy()->subMonths(2);
            $threeMonthForwardFromCurrent = $currentDateCarbon->copy()->addMonths(3);

            if ($startDateCarbon->lt($twoMonthAgoFromCurrent) || $endDateCarbon->gte($threeMonthForwardFromCurrent)) {
                return response()->json([
                    'message' => 'The date range must be within 2 months back and 3 months forward from the current date',
                    'success' => false,
                    'day' => $dayChosen,
                    'startDate' => $startDate,
                    'endDate' => $endDate,
                    'arrangement' => $arrangement,
                    'reason' => $reason,
                    ], 400);
            }

            // **Condition 3**: Check for duplicate requests on the same day
            $recurringDates = [];
            $current = $startDateCarbon->copy();

            while ($current->lte($endDateCarbon)) {
                if ($current->dayOfWeek === $dayChosen) {
                    $recurringDates[] = $current->format('Y-m-d');
                }
                $current->addDay();
            }

            // Condition 2b: Check if any of the recurringDates clash with existingRequests
            foreach ($recurringDates as $date) {
                $duplicate = $existingRequests->where('Date_Requested', $date)->first();
                if ($duplicate) {
                    return response()->json([
                        'message' => "Duplicate request found on {$date}. Cannot create recurring requests with overlapping dates.",
                        'success' => false,
                        'day' => $dayChosen,
                        'startDate' => $startDate,
                        'endDate' => $endDate,
                        'arrangement' => $arrangement,
                        'reason' => $reason,
                    ], 409); // 409 Conflict
                }
            }

            // Step 5: Retrieve the Reporting Manager ID from the Employee Table
            $reportingManager = $employee->Reporting_Manager;
            $reportingManagerName = "";
            if (!$reportingManager) {
                return response()->json(['message' => 'Reporting manager not found', 
                                               'success' => false,
                                               'startDate' => $startDate,
                                               'day' => $dayChosen,
                                               'endDate' => $endDate,
                                               'arrangement' => $arrangement,
                                               'reason' => $reason,
                                            ], 404);
            } else {
                $reportingManagerRow = Employee::where("Staff_ID", $reportingManager)->firstOrFail();
                $reportingManagerName = $reportingManagerRow->Staff_FName . " " . $reportingManagerRow->Staff_LName;
            }
            DB::beginTransaction();
            // Step 6: create recurring requests:
            $createdRequests = [];
            foreach ($recurringDates as $date) {
                $newRequest = Requests::create([
                    'Requestor_ID' => $staffId,
                    'Approver_ID' => $reportingManager,
                    'Status' => 'Pending',
                    'Date_Requested' => $date,
                    'Request_Batch' => $requestBatch,
                    'Date_Of_Request' => now(),
                    'Duration' => $arrangement
                ]);
                // Dispatch the job to check status after 2 months
                RejectPendingRequestsOlderThanTwoMonthsJob::dispatch($newRequest)->delay(now()->addMonths(2));
                $createdRequests[] = $newRequest;
            }

            // Step 7: Add all following requests to the request log table
            foreach ($createdRequests as $request) {
                RequestLog::create([
                    'Request_ID' => $request->Request_ID,
                    'Previous_State' => 'Pending',
                    'New_State' => 'Pending',
                    'Employee_ID' => $staffId,
                    'Date' => now(),
                    'Remarks' => $reason,
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'Rows for Request and RequestLog have been successfully created',
                'success' => true,
                'Request_Batch' => $requestBatch,
                'day' => $dayChosen,
                'startDate' => $startDate,
                'endDate' => $endDate,
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

    // Approve Request
    public function approveRequest(Request $request)
    {
        // Decode json input and give assign to variables based on key
        $request_id = $request->input('Request_ID');
        $approver_id = $request->input('Approver_ID');
        $status = $request->input('Status');
        $date = $request->input('Date_Requested');
        $request_batch = $request->input('Request_Batch');
        $wfh_type = $request->input('Duration');
        $reason = $request->input('Reason');

        // Fetch employee row using staff_id
        $requestDB = Requests::where("Request_ID", $request_id)->first();

        // can check if the request is currently at a state from which it can be approved

        // check for batch = null
        if ($request_batch !== null) {
            return response()->json(['message' => 'Request is batch request, unable to approve this request by itself'], 400);
        }
        
        // check for correct status
        if ($status == 'Approved' || $status == 'Withdrawn') {
            
        } else {
            return response()->json(['message' => 'You are not trying to approve request, this endpoint was to approve requests'], 400);
        }
        
        // check if the requst is already approved
        if ($requestDB->Status== "Approved") {
            return response()->json(['message' => "Request was already Approved"], 400);
        }

        // check if the requst is already approved
        if ($requestDB->Status== "Withdrawn") {
            return response()->json(['message' => "Request was already Withdrawn"], 400);
        }

        // check if the person rejecting the request is the approver
        if ($requestDB->Approver_ID !== $approver_id) {
            return response()->json(['message' => "You are not allowed to approve this request"], 400);
        }

        if (strlen($reason) > 255) {
            $reason = substr($reason, 0, 255);
        }

        if ($requestDB->Status == 'Withdraw Pending' && $status == 'Withdrawn') {
            $newRequestLog = new RequestLog();
            $newRequestLog->Request_ID = $requestDB->Request_ID;
            $newRequestLog->Previous_State = $requestDB->Status;
            $newRequestLog->New_State = $status;
            $newRequestLog->Employee_ID = $approver_id;
            $newRequestLog->Date = date("Y-m-d");
            $newRequestLog->Remarks = $reason;
            $newRequestLog->save();
            $requestDB->Status = 'Withdrawn';
            $requestDB->save();
            return response()->json($requestDB, 200);
        }

        // check for date formatting
        if (!preg_match('/^\d{4}-(0?[1-9]|1[0-2])-(0?[1-9]|[12]\d|3[01])$/', $date)) {
            return response()->json(['message' => 'The format of date is not correct, sample format 2024-10-03'], 400);
        }
        $formattedDate = (new DateTime($date))->format('Y-m-d');
        
        // query database for the people with that approver
        $requests = Requests::where('Approver_ID', $approver_id)
                    ->get();
                    
        $team_size = Employee::where('Reporting_Manager', $approver_id)->count();
        
        if ($team_size != 0) {
            $proportion = 1 / $team_size;
        } else {
            return response()->json(['message' => 'This person manages 0 people.'], 404);
        }
        
        if ($requests) {
            // create a dictionary of different dates and check how many people are working from home for that date
            $date_dictionary = [];
            $counter = 0;
            // for loop to iterate through date_dictionary to find different dates and see how many people are working from home for that date
            foreach ($requests as $req) {
                $dateOfReq = $req->Date_Requested;
                $formattedDateOfReq = (new DateTime($dateOfReq))->format('Y-m-d');
                if ($formattedDate == $formattedDateOfReq && $req->Status == $status) {
                    $counter++;
                    
                    // how to print the values of $dateOfReq and $date
                    $arrangement = $req->Duration;

                    if (!isset($date_dictionary[$formattedDateOfReq])) {
                        $date_dictionary[$formattedDateOfReq] = ['AM' => 0, 'PM' => 0, 'FD' => 0];
                    }

                    if ($arrangement === 'AM') {
                        $date_dictionary[$formattedDateOfReq]['AM'] += $proportion;
                    } else if ($arrangement === "PM") {
                        $date_dictionary[$formattedDateOfReq]['PM'] += $proportion;
                    } else if ($arrangement === "FD") {
                        $date_dictionary[$formattedDateOfReq]["FD"] += $proportion;
                    }
                }
            }
            if ($counter != 0) {
                // Check for if the next person exceeds 50% violation
                $curr = $date_dictionary[$formattedDate][$wfh_type];
                $curr = $curr + $proportion;
                if ($curr > 0.5) {
                    return response()->json(['message' => 'Unable to accept request as this would lead to less than 50% of the team being in office'], 400);
                }
            }
            
        } else {
            return response()->json(["message"=> "Unable to query from Requests Table"], 400);
        }

        // Approve request
        // Add to request log table
        if ($status == "Approved" && $requestDB->Status == "Pending") {
            $newRequestLog = new RequestLog();
            $newRequestLog->Request_ID = $requestDB->Request_ID;
            $newRequestLog->Previous_State = $requestDB->Status;
            $newRequestLog->New_State = $status;
            $newRequestLog->Employee_ID = $approver_id;
            $newRequestLog->Date = date("Y-m-d");
            $newRequestLog->Remarks = $reason;
            $requestDB->Status = 'Approved';
            $requestDB->save();
        } else {
            return response()->json(["message"=> "Unable to convert status: $requestDB->Status to $status"], 400);
        }

        // Save the Request Log
        if ($newRequestLog->save()) {
            // If request log saves successfully
            return response()->json($requestDB, 200);
        } else {
            // Handle error saving RequestLog
            return response()->json(['message' => 'Failed to create Request Logs'], 500);
        }
    }

    // Reject Request
    public function rejectRequest(Request $request)
    {
        // Decode json input and give assign to variables based on key
        $request_id = $request->input('Request_ID');
        $approver_id = $request->input('Approver_ID');
        $status = $request->input('Status');
        $request_batch = $request->input('Request_Batch');
        $reason = $request->input('Reason');

        // Fetch employee row using staff_id
        $requestDB = Requests::where("Request_ID", $request_id)->first();


        // Checking for correct status
        if ($status == 'Rejected' || $status == "Withdraw Rejected") {
            
        } else {
            return response()->json(['message' => 'You are not trying to reject request, this endpoint was to reject requests'], 400);
        }

        // check for batch = null
        if ($request_batch !== null) {
            return response()->json(['message' => 'Request is batch request, unable to approve this request by itself'], 400);
        }

        // check for reason provided
        if ($reason == "") {
            return response()->json(['message' => "Reason was not provided"], 401);
        }

        if (strlen($reason) > 255) {
            $reason = substr($reason, 0, 255);
        }

        // check if the requst is already rejected
        if ($requestDB->Status == "Withdraw Rejected") {
            return response()->json(['message' => "Request was already Withdraw Rejected"], 400);
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
        if ($requestDB->Status == 'Pending' && $status == 'Rejected') {
            $requestDB->Status = 'Rejected';
        } else if ($requestDB->Status=='Withdraw Pending' && $status == 'Withdraw Rejected'){
            $requestDB->Status = 'Withdraw Rejected';
        } else {
            return response()->json(['message' => "A state change from $requestDB->Status to $status is not allowed"], 400);
        }
        
        $requestDB->save();
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
            return response()->json(['message' => 'Failed to create Request Logs'], 400);
        }
    }
}
