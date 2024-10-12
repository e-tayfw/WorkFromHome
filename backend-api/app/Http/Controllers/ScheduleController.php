<?php

namespace App\Http\Controllers;

use App\Models\Requests;
use App\Models\Employee;
use Carbon\Carbon;

use Illuminate\Support\Facades\Log;


class ScheduleController extends Controller
{
    // Generate own schedule
    public function generateOwnSchedule($staff_id)
    {

        // Handle invalid Requestor_ID
        if (empty($staff_id)) {
            return response()->json(['message' => 'Invalid Requestor ID provided'], 400);
        }

        $requests = Requests::where('Requestor_ID', $staff_id)
            ->where('Status', 'Approved')
            ->get();
        
        $requests = Requests::where(column: 'Requestor_ID', operator: $staff_id)
            ->where('Status', 'Approved')
            ->get();;
        // Handle empty results
        // if ($requests->isEmpty()) {
        //     continue;
        // }

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
            $formattedDate = $date->format('dmy');

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
            return response()->json(['schedule' => $schedule], 200);
        } else {
            return response()->json(['message' => 'schedule could not be found'], 500);
        }
    }

    // Generate staff's team schedule
    public function generateTeamSchedule($staff_id)
    {
        // Step 1: Find the employee based on the provided employee ID
        $employee = Employee::find($staff_id);

        Log::info($employee);

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

        foreach ($teamMembers as $member_id) {
            // Initialise the schedule
            $schedule = [];

            // Loop through each date within the range stated
            for ($date = $startDate->copy(); $date->lte($endDate); $date->addDay()) {

                // Set the time zone to UTC (or whatever timezone your `Date_Requested` is in)
                $date->setTimezone('UTC');

                // Format date as "ddmmyy"
                $formattedDate = $date->format('dmy');

                // Check if there is an approved request for this team member on this date
                $request = $approvedRequests->where('Requestor_ID', $member_id)
                    ->where('Date_Requested', $date->format('Y-m-d'))
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
        } else {
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

        foreach ($teamMembers as $member_id) {
            // Initialise the schedule
            $schedule = [];

            // Loop through each date within the range stated
            for ($date = $startDate->copy(); $date->lte($endDate); $date->addDay()) {

                // Set the time zone to UTC (or whatever timezone your `Date_Requested` is in)
                $date->setTimezone('UTC');

                // Format date as "ddmmyy"
                $formattedDate = $date->format('dmy');

                // Check if there is an approved request for this team member on this date
                $request = $approvedRequests->where('Requestor_ID', $member_id)
                    ->where('Date_Requested', $date->format('Y-m-d'))
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
        } else {
            return response()->json(['message' => 'Department schedule could not be found or is empty'], 404);
        }
    }

    // Generate staff's team schedule by manager id
    public function generateTeamScheduleByManager($reportingManager)
    {
        // Step 1: Find the employee based on the provided employee ID
        $manager = Employee::find($reportingManager);
        Log::info($reportingManager);
        Log::info($manager);
        if (!$manager) {
            return response()->json(['message' => 'Employee not found'], 404);
        }

        // Step 2: Get all team members who belong to the same department and report to the same manager
        $teamMembers = Employee::where('Dept', $manager->Dept)
            ->where('Reporting_Manager', $manager->Staff_ID)
            ->pluck('Staff_ID'); // Retrieve only team member IDs

        if ($teamMembers->isEmpty()) {
            return response()->json(['message' => 'Perosn is not a manager'], 404);
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

        foreach ($teamMembers as $member_id) {
            // Initialise the schedule
            $schedule = [];

            // Loop through each date within the range stated
            for ($date = $startDate->copy(); $date->lte($endDate); $date->addDay()) {

                // Set the time zone to UTC (or whatever timezone your `Date_Requested` is in)
                $date->setTimezone('UTC');

                // Format date as "ddmmyy"
                $formattedDate = $date->format('dmy');

                // Check if there is an approved request for this team member on this date
                $request = $approvedRequests->where('Requestor_ID', $member_id)
                    ->where('Date_Requested', $date->format('Y-m-d'))
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
        } else {
            return response()->json(['message' => 'Team schedule could not be found or is empty'], 404);
        }
    }

    public function generateHRScheduleByDepartment()
    {
        // Step 1: Get all unique departments from Employee Table
        $departments = Employee::select('Dept')->distinct()->pluck('Dept');

        // Step 2: Initialise the result for schedule grouped by department
        $departmentSchedule = [];

        // Loop through every single department and retrieve the schedule of all team members in that specific department as a dictionary
        foreach ($departments as $dept) {
            // Step 3: Get the schedule for the department
            $deptSchedule = $this->generateDepartmentSchedule($dept);
             // If $deptSchedule is a JsonResponse, decode it into an array
            if ($deptSchedule instanceof \Illuminate\Http\JsonResponse) {
                $deptScheduleArray = $deptSchedule->getData(true); // Decode the JSON response to an array
            } else {
                $deptScheduleArray = $deptSchedule; // In case it's already an array
            }

            // Check if 'dept_schedule' exists in the decoded array
            if (isset($deptScheduleArray['dept_schedule'])) {
                $innerDeptSchedule = $deptScheduleArray['dept_schedule'];
            } else {
                // Handle the case where 'dept_schedule' is not present
                $innerDeptSchedule = [];
            }

            // Add the schedule to the result array
            $departmentSchedule[$dept] = $innerDeptSchedule;
        }

        return response()->json(['HR_department_schedule' => $departmentSchedule]);
    }

    public function generateHRScheduleByTeam()
    {
        // Step 1: Get all unique employees who are listed as Reporting Managers
        // This query ensures that we only get employees whose Staff_ID is listed as a Reporting_Manager
        $managers = Employee::select('Staff_ID', 'Staff_FName', 'Staff_LName')
            ->whereIn('Staff_ID', function($query) {
                $query->select('Reporting_Manager')
                    ->from('Employee');  // Replace 'employees' with your actual table name if needed
            })
            ->distinct()
            ->get();

        // Step 2: Initialise the result for schedule grouped by reporting manager
        $managerSchedule = [];

        // Step 3: For each manager, get the schedule of their team members and own schedule
        foreach ($managers as $manager) {

            // Get the team schedule (ensure it's decoded from a JsonResponse if applicable)
            $managerTeamSchedule = $this->generateTeamScheduleByManager($manager->Staff_ID);
            if ($managerTeamSchedule instanceof \Illuminate\Http\JsonResponse) {
                $managerTeamScheduleArray = $managerTeamSchedule->getData(true);  // Decode JSON response to array
            } else {
                $managerTeamScheduleArray = $managerTeamSchedule;  // Use it as is if already an array
            }

            // Check if the 'team_schedule' key exists
            if (isset($managerTeamScheduleArray['team_schedule'])) {
                $innerTeamSchedule = $managerTeamScheduleArray['team_schedule'];
            } else {
                // Handle missing 'team_schedule' key by setting an empty schedule
                $innerTeamSchedule = [];
            }

            // Store the team's schedule under the manager's name
            $managerSchedule[$manager->Staff_FName . ' ' . $manager->Staff_LName] = $innerTeamSchedule;

            // Get the manager's own schedule (ensure it's decoded from a JsonResponse if applicable)
            $managerOwnSchedule = $this->generateOwnSchedule($manager->Staff_ID);
            if ($managerOwnSchedule instanceof \Illuminate\Http\JsonResponse) {
                $managerOwnScheduleArray = $managerOwnSchedule->getData(true);  // Decode JSON response to array
            } else {
                $managerOwnScheduleArray = $managerOwnSchedule;  // Use it as is if already an array
            }

            // Check if 'schedule' exists in manager's own schedule
            if (isset($managerOwnScheduleArray['schedule'])) {
                // Step 5: Add manager's own schedule inside the key Staff_FName + Staff_LName
                $managerSchedule[$manager->Staff_FName . ' ' . $manager->Staff_LName][$manager->Staff_ID] = $managerOwnScheduleArray['schedule'];
            } else {
                $managerSchedule[$manager->Staff_FName . ' ' . $manager->Staff_LName][$manager->Staff_ID] = [];
            }

        }

        return response()->json(['HR_team_schedule' => $managerSchedule]);        
    }
}
