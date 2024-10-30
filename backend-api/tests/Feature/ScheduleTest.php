<?php

namespace Tests\Feature;

use Database\Seeders\EmployeeSeeder;
use Database\Seeders\RequestSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Requests;
use App\Models\Employee;
use Tests\TestCase;
use Log;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ScheduleTest extends TestCase
{
    use RefreshDatabase; // Use the RefreshDatabase trait

    protected function setUp(): void
    {
        parent::setUp();

        // Seed the database
        $this->seed(EmployeeSeeder::class);
        $this->seed(RequestSeeder::class);
    }

    /**
     * Test to check if the database is the testing database.
     */
    public function test_database_is_test_db(): void
    {
        // Get the current database name
        $dbName = DB::connection()->getDatabaseName();
    
        // Assert that the base name of the database is 'test_db', ignoring any suffixes
        $this->assertStringContainsString('test_db', $dbName, 'The database name does not contain "test_db"');
    }
    

    /**
     * Test if the API returns a 200 for a existing employee ID.
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_get_schedule_by_id_returns_200_for_existing_employee_id(): void
    {
        // Make a GET request to the API endpoint with a valid employee ID (130002)
        $response = $this->getJson('/api/generateOwnSchedule/171014');
    
        // Assert that the response status is 200 (OK)
        $response->assertStatus(200);
    }

    /**
     * Test if the API returns 200 for an existing employee email.
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_get_team_schedule_by_id_returns_200_for_existing_employee_id(): void
    {
        // Send a GET request with an invalid ID (e.g., a string instead of an integer)
        $response = $this->getJson('/api/generateTeamSchedule/171014');

        // Assert that the response status is 200 (OK) due to validation
        $response->assertStatus(200);
    }

    /**
     * Test if the API to retrieve the team schedule excludes the manager's schedule.
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_retrieve_team_schedule_excluding_manager(): void
    {
        // Create a manager using the EmployeeFactory and specify necessary attributes
        $manager = Employee::factory()->create([
            'Staff_ID' => '140120',
            'Staff_FName' => 'John',
            'Staff_LName' => 'Legend',
            'Dept' => 'IT',
            'Position' => 'IT Manager',
            'Country' => 'Singapore',
            'Reporting_Manager' => '140001', // No reporting manager since this is the manager
        ]);

        // Create an employee reporting to the manager
        $employee = Employee::factory()->create([
            'Staff_ID' => '140182',
            'Staff_FName' => 'Mary',
            'Staff_LName' => 'Bel',
            'Dept' => 'IT',
            'Position' => 'Developer',
            'Country' => 'Singapore',
            'Reporting_Manager' => '140120', // No reporting manager since this is the manager
        ]);

        $employee2 = Employee::factory()->create([
            'Staff_ID' => '140183',
            'Staff_FName' => 'Ben',
            'Staff_LName' => 'Simmons',
            'Dept' => 'IT',
            'Position' => 'Developer',
            'Country' => 'Singapore',
            'Reporting_Manager' => '140120', // No reporting manager since this is the manager
        ]);

        // Send a GET request to the API endpoint to retrieve the team schedule
        $response = $this->getJson("/api/generateTeamSchedule/140182");

        // Assert that the response status is 200
        $response->assertStatus(200);

        // Retrieve the 'team_schedule' from the response
        $teamSchedule = $response->json('team_schedule');

        // Assert that the team schedule includes the employee but excludes the manager
        $this->assertArrayHasKey($employee2->Staff_ID, $teamSchedule);
        $this->assertArrayNotHasKey($manager->Staff_ID, $teamSchedule);
    }

    /**
     * Test if the API returns a 404 for a non-existing employee email.
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_get_team_schedule_by_id_returns_200_for_existing_manager_id(): void
    {
        // Send a GET request to a non-existing email
        $response = $this->getJson('/api/generateTeamScheduleByManager/171009');

        // Assert that the response status is 200 (OK)
        $response->assertStatus(200);
    }


    /**
     * Test if the API returns a 404 for a non-existing employee email.
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_get_team_schedule_by_id_returns_404_for_person_is_not_manager(): void
    {
        // Send a GET request to a non-existing email
        $response = $this->getJson('/api/generateTeamScheduleByManager/170208');

        // Assert that the response status is 404 (Not Found) as person is not a manager
        $response->assertStatus(404);
    }

    /**
     * Test if the generate own schedule API includes withdraw pending status requests.
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_get_requests_with_withdraw_pending_status_own_schedule()
    {
        // Set current date using Carbon for consistent testing (e.g., set test date as 2024-10-27)
        Carbon::setTestNow('2024-10-27');

        // Define the desired statuses
        $approvedStatus = 'Approved';
        $withdrawPendingStatus = 'Withdraw Pending';

        $dateWithinRange1 = Carbon::now()->format('Y-m-d');  // Current date
        $dateWithinRange2 = Carbon::now()->addDay()->format('Y-m-d'); // One day after current date

       // Create requests within the valid date range with valid statuses
        Requests::factory()->create(['Status' => $approvedStatus, 'Requestor_ID' => '171014', 'Date_Requested' => $dateWithinRange1, 'Duration' => 'AM']);
        Requests::factory()->create(['Status' => $withdrawPendingStatus, 'Requestor_ID' => '171014', 'Date_Requested' => $dateWithinRange2, 'Duration' => 'PM']);
        
        $response = $this->getJson('/api/generateOwnSchedule/171014');
        
        $response->assertStatus(200);
        $schedule = $response->json('schedule');

        $formattedDate1 = Carbon::parse($dateWithinRange1)->format('dmy');
        $formattedDate2 = Carbon::parse($dateWithinRange2)->format('dmy');
        
        $this->assertEquals(1, $schedule[$formattedDate1]); // 'AM' -> 1 for Approved
        $this->assertEquals(2, $schedule[$formattedDate2]); // 'PM' -> 2 for Withdraw Pending

    }

    /**
     * Test if the generate own schedule API includes withdraw rejected status requests.
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_get_requests_with_withdraw_rejected_status_schedule()
    {
        // Set current date using Carbon for consistent testing (e.g., set test date as 2024-10-27)
        Carbon::setTestNow('2024-10-27');

        // Define the desired statuses
        $approvedStatus = 'Approved';
        $withdrawRejectedStatus = 'Withdraw Rejected';

        $dateWithinRange1 = Carbon::now()->format('Y-m-d');  // Current date
        $dateWithinRange2 = Carbon::now()->addDay()->format('Y-m-d'); // One day after current date

       // Create requests within the valid date range with valid statuses
        Requests::factory()->create(['Status' => $approvedStatus, 'Requestor_ID' => '171014', 'Date_Requested' => $dateWithinRange1, 'Duration' => 'AM']);
        Requests::factory()->create(['Status' => $withdrawRejectedStatus, 'Requestor_ID' => '171014', 'Date_Requested' => $dateWithinRange2, 'Duration' => 'PM']);
        
        $response = $this->getJson('/api/generateOwnSchedule/171014');
        
        $response->assertStatus(200);
        $schedule = $response->json('schedule');

        $formattedDate1 = Carbon::parse($dateWithinRange1)->format('dmy');
        $formattedDate2 = Carbon::parse($dateWithinRange2)->format('dmy');
        
        $this->assertEquals(1, $schedule[$formattedDate1]); // 'AM' -> 1 for Approved
        $this->assertEquals(2, $schedule[$formattedDate2]); // 'PM' -> 2 for Withdraw Pending
    }

}
