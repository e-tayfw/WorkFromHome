<?php

namespace App\Http\Controllers;

use App\Models\Requests;
use App\Models\Employee;
use Carbon\Carbon;

class ScheduleController extends Controller
{
    // Generate own schedule
    public function generateOwnSchedule($staff_id)
    {

        // Handle invalid Requestor_ID
        if (empty($employee_id)) {
            return response()->json(['message' => 'Invalid Requestor ID provided'], 400);
        }

        $requests = Requests::where(column: 'Requestor_ID', operator: $staff_id)
                                    ->where('Status', 'Approved')
                                    ->get();;
        // Handle empty results
        if ($requests->isEmpty()) {
            return response()->json(['message' => 'No approved requests found for the given requestor'], 404);
        }

        // Handle invalid Requestor_ID
        if (empty($staff_id)) {
            return response()->json([
                'error' => 'Invalid Requestor ID provided.'
            ], 400); // Bad request
        }
         // Current date
        $currentDate = Carbon::now();
        
        // Dates two months back and three months forward
        $startDate = $currentDate->copy()->subMonths(2);
        $endDate = $currentDate->copy()->addMonths(3);

        //initialise the schedule array for requestor
        $schedule = [];

        for ($date = $startDate->copy(); $date->lte($endDate); $date->addDay()) {

            // Set the time zone to UTC (or whatever timezone your `Date_Requested` is in)
            $date->setTimezone('UTC');

            // Format date as "ddmmyy"
            $formattedDate = $date->format('Y-m-d H:i:s');

            // Check if the date exists in the requests array
            $request = collect($requests)->firstWhere('Date_Requested', $date->format('Y-m-d'));

            if ($request) {
                // Map Duration to value
                switch ($request['Duration'] ?? '') {
                    case 'AM':
                        $value = 1;
                        break;
                    case 'PM':
                        $value = 2;
                        break;
                    case 'FD':
                        $value = 3;
                        break;
                    default:
                        $value = 0;
                        break;
                }
            } else {
                // If date is not present in the requests, set value to 0
                $value = 0;
            }

            // Add to the schedule array
            $schedule[$formattedDate] = $value;
        
        }
        
        if ($schedule) {
            return response()->json(['schedule' => $schedule]);
        } else {
            return response()->json(['message' => 'schedule could not be found'], 500);
        }
    }

    // Generate staff's team schedule
     public function generateTeamSchedule($staff_id)
    {
        // Step 1: Find the employee based on the provided employee ID
        $employee = Employee::find($staff_id);

        if (!$employee) {
            return response()->json(['message' => 'Employee not found'], 404);
        }

        // Step 2: Get all team members who belong to the same department and report to the same manager
        $teamMembers = Employee::where('Dept', $employee->Dept)
                            ->where('Reporting_Manager', $employee->Reporting_Manager)
                            ->where('Staff_ID', '!=', $staff_id) // Exclude the employee themselves
                            ->pluck('Staff_ID'); // Retrieve only team member IDs

        // Exclude the manager from the team if they are part of the result
        if ($employee->Reporting_Manager !== null && $teamMembers->contains($employee->Reporting_Manager)) {
            $teamMembers = $teamMembers->filter(function ($value) use ($employee) {
                return $value != $employee->Reporting_Manager;
            });
        }

        if ($teamMembers->isEmpty()) {
            return response()->json(['message' => 'No team members found'], 404);
        }

        // Step 3: Fetch all approved requests for the team members
        $approvedRequests = Requests::whereIn('Requestor_ID', $teamMembers)
                                ->where('Status', 'Approved')
                                ->get();

        // Current Date
        $currentDate = Carbon::now();

        // Dates two months back and three months forward
        $startDate = $currentDate->copy()->subMonths(2);
        $endDate = $currentDate->copy()->addMonths(3);

        // Step 4: Initialize the result array to store team member schedules
        $teamSchedule = [];

        foreach($teamMembers as $member_id) {
            // Initialise the schedule
            $schedule = [];

            // Loop through each date within the range stated
            for ($date = $startDate->copy(); $date->lte($endDate); $date->addDay()) {

                // Set the time zone to UTC (or whatever timezone your `Date_Requested` is in)
                $date->setTimezone('UTC');

                // Format date as "ddmmyy"
                $formattedDate = $date->format('Y-m-d H:i:s');

                // Check if there is an approved request for this team member on this date
                $request = $approvedRequests->where('Requestor_ID', $member_id)
                                        ->where('Date_Requested', $formattedDate)
                                        ->first();
                
                if ($request) {
                // Map Duration to value (1 = AM, 2 = PM, 3 = FD)
                    switch ($request->Duration) {
                        case 'AM':
                            $value = 1;
                            break;
                        case 'PM':
                            $value = 2;
                            break;
                        case 'FD':
                            $value = 3;
                            break;
                        default:
                            $value = 0;
                            break;
                    }
                } else {
                    // If no request is present for the date, set value to 0
                    $value = 0;
                }

                // Add to the schedule array
                $schedule[$formattedDate] = $value;
            }

            // Add the team member's schedule to the result array
            $teamSchedule[$member_id] = $schedule;
        }

        if ($teamSchedule) {
            // Return the team schedule in JSON format
            return response()->json(['team_schedule' => $teamSchedule]);
        }
        else {
            return response()->json(['message' => 'Team schedule could not be found or is empty'], 404);
        }
    }

    // Generate staff's department schedule
     public function generateDepartmentSchedule($dept)
    {
        // Step 1: Get all unique departments from Employee Table
        $departments = Employee::select('Dept')->distinct()->pluck('Dept');

        // Check if the provided dept exists in the distinct departments
        if (!$departments->contains($dept)) {
            return response()->json(['message' => 'Department does not exist'], 404);
        }

        // Step 2: Get all team members who belong to the same department
       $teamMembers = Employee::where('Dept', $dept)
                      ->pluck('Staff_ID');    // Retrieve only team member IDs
        
        // Step 3: Fetch all approved requests for the team members
        $approvedRequests = Requests::whereIn('Requestor_ID', $teamMembers)
                                ->where('Status', 'Approved')
                                ->get();
        
        // Current Date
        $currentDate = Carbon::now();

        // Dates two months back and three months forward
        $startDate = $currentDate->copy()->subMonths(2);
        $endDate = $currentDate->copy()->addMonths(3);

        // Step 4: Initialize the result array to store team member schedules
        $deptSchedule = [];

        foreach($teamMembers as $member_id) {
            // Initialise the schedule
            $schedule = [];

            // Loop through each date within the range stated
            for ($date = $startDate->copy(); $date->lte($endDate); $date->addDay()) {

                // Set the time zone to UTC (or whatever timezone your `Date_Requested` is in)
                $date->setTimezone('UTC');

                // Format date as "ddmmyy"
                $formattedDate = $date->format('Y-m-d H:i:s');

                // Check if there is an approved request for this team member on this date
                $request = $approvedRequests->where('Requestor_ID', $member_id)
                                        ->where('Date_Requested', $formattedDate)
                                        ->first();
                
                if ($request) {
                // Map Duration to value (1 = AM, 2 = PM, 3 = FD)
                    switch ($request->Duration) {
                        case 'AM':
                            $value = 1;
                            break;
                        case 'PM':
                            $value = 2;
                            break;
                        case 'FD':
                            $value = 3;
                            break;
                        default:
                            $value = 0;
                            break;
                    }
                } else {
                    // If no request is present for the date, set value to 0
                    $value = 0;
                }

                // Add to the schedule array
                $schedule[$formattedDate] = $value;
            }

            // Add the team member's schedule to the result array
            $deptSchedule[$member_id] = $schedule;
        }

        if ($deptSchedule) {
            // Return the team schedule in JSON format
            return response()->json(['dept_schedule' => $deptSchedule]);
        }
        else {
            return response()->json(['message' => 'Department schedule could not be found or is empty'], 404);
        }

        
    }

}
