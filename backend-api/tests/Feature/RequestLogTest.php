<?php

namespace Tests\Feature;

use Database\Seeders\EmployeeSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\RequestLog;
use Tests\TestCase;
use DB;
use Log;

class RequestLogTest extends TestCase
{
    use RefreshDatabase; // Use the RefreshDatabase trait

    protected function setUp(): void
    {
        parent::setUp();

        // Seed the employee data
        $this->seed(EmployeeSeeder::class);
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
     * Test if the API returns a 200 for getting all request logs.
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_it_returns_200_all_request_logs(): void
    {
        // Create the first request to generate a request log
        $request_1 = $this->postJson('/api/request', [
            "staffid" => 151583,
            "date" => "2024-08-14",
            "arrangement" => "FD",
            "reason" => "WFH Test"
        ]);

        // Assert that the first request was created successfully
        $request_1->assertStatus(200); // Assuming 200 Created status on success

        // Create the second request to generate another request log
        $request_2 = $this->postJson('/api/request', [
            "staffid" => 151583,
            "date" => "2024-09-18",
            "arrangement" => "HD",  // Half Day arrangement, for example
            "reason" => "Another WFH Test"
        ]);

        // Assert that the second request was created successfully
        $request_2->assertStatus(200); // Assuming 200 Created status on success

        // Call the API to get all request logs
        $response = $this->getJson('/api/requestLog');

        // Assert the response status is 200
        $response->assertStatus(200);
    }

    /**
     * Test if the API returns a specific request log by ID.
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_it_returns_200_request_log_by_id(): void
    {
        // Create a request to generate a log
        $request = $this->postJson('/api/request', [
            "staffid" => 151583,
            "date" => "2024-08-06",
            "arrangement" => "FD",
            "reason" => "WFH Test"
        ]);

        // Assert the request was created successfully
        $request->assertStatus(200);

        // Extract the generated request log ID from the response
        $logId = RequestLog::first()->Log_ID; // Assuming the log is created in the database

        // Call the API to get the specific request log by ID
        $response = $this->getJson("/api/requestLog/logId/{$logId}");

        // Assert the response status is 200 
        $response->assertStatus(200);
    }

    public function test_it_returns_400_for_invalid_log_id(): void
    {
        // Attempt to retrieve a log with a non-numeric ID
        $response = $this->getJson('/api/requestLog/logId/abc');

        $response->assertStatus(400)
            ->assertJson(['message' => 'Invalid log ID: abc']);

        // Attempt to retrieve a log with a negative ID
        $response = $this->getJson('/api/requestLog/logId/-1');

        $response->assertStatus(400)
            ->assertJson(['message' => 'Invalid log ID: -1']);

        // Attempt to retrieve a log with a zero ID
        $response = $this->getJson('/api/requestLog/logId/0');

        $response->assertStatus(400)
            ->assertJson(['message' => 'Invalid log ID: 0']);
    }

    /**
     * Test if the API returns 404 for a non-existent request log ID.
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_it_returns_404_for_non_existent_request_log_id(): void
    {
        // Attempt to retrieve a non-existent log ID
        $response = $this->getJson('/api/requestLog/logId/999'); // Assuming 999 does not exist

        // Assert that the response status is 404 with appropriate message
        $response->assertStatus(404)
            ->assertJson(['message' => 'No logs found for log ID: 999']);
    }

    /**
     * Test if the API returns 400 for an invalid employee ID.
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_it_returns_400_for_invalid_employee_id(): void
    {
        // Attempt to retrieve logs with a non-numeric employee ID
        $response = $this->getJson('/api/requestLog/employeeId/abc');

        $response->assertStatus(400)
            ->assertJson(['message' => 'Invalid employee ID: abc']);
    }

    /**
     * Test if the API returns 404 when no logs exist for a valid employee ID.
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_it_returns_404_for_valid_employee_id_with_no_logs(): void
    {
        // Assuming the employee exists but no logs are present
        $response = $this->getJson('/api/requestLog/employeeId/151583');
        $response->assertStatus(404)->assertJson([
            'message' => 'No logs found for employee ID: 151583'
        ]);
    }

    /**
     * Test if `filterRequestLogs` filters logs correctly by a date range with Y-m-d format.
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_filter_logs_by_date_range(): void
    {
        // Use today's date in Y-m-d format
        $today = now()->format('Y-m-d');

        // Create the first request to generate a log
        $this->postJson('/api/request', [
            "staffid" => 151583,
            "date" => $today, // Use Y-m-d formatted date
            "arrangement" => "FD",
            "reason" => "WFH Test"
        ])->assertStatus(200);

        // Create a second request with the same date to generate another log
        $this->postJson('/api/request', [
            "staffid" => 151583,
            "date" => $today, // Use Y-m-d formatted date
            "arrangement" => "HD",
            "reason" => "Another WFH Test"
        ])->assertStatus(200);

        // Call the filterRequestLogs API with the same start and end date (today)
        $response = $this->postJson('/api/requestLog/filter', [
            'Start_Date' => $today,
            'End_Date' => $today,
        ]);

        // Assert that the response status is 200 and two logs are returned
        $response->assertStatus(200);
    }

    /**
     * Test filtering request logs by multiple criteria.
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_filter_logs_by_multiple_criteria(): void
    {
        $employeeId = 151583;

        // Create a request to generate a log with specific criteria
        $this->postJson('/api/request', [
            "staffid" => $employeeId,
            "date" => now()->format('Y-m-d'),
            "arrangement" => "FD",
            "reason" => "Test for Multiple Criteria"
        ])->assertStatus(200);

        // Call the filterRequestLogs API with multiple filters
        $response = $this->postJson('/api/requestLog/filter', [
            'Employee_ID' => $employeeId,
            'Previous_State' => 'Pending',
        ]);

        // Assert that the correct log is returned
        $response->assertStatus(200)
            ->assertJsonFragment(['Employee_ID' => $employeeId, 'Previous_State' => 'Pending'])
            ->assertJsonCount(1);
    }

    /**
     * Test filtering request logs by date range and employee ID.
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_filter_logs_by_date_range_and_employee_id(): void
    {
        $employeeId = 151583;

        // Create a request to generate a log for today
        $this->postJson('/api/request', [
            "staffid" => $employeeId,
            "date" => now()->format('Y-m-d'),
            "arrangement" => "FD",
            "reason" => "Test for Date Range and Employee"
        ])->assertStatus(200);

        // Call the filterRequestLogs API with date range and employee ID filters
        $response = $this->postJson('/api/requestLog/filter', [
            'Start_Date' => now()->format('Y-m-d'),
            'End_Date' => now()->format('Y-m-d'),
            'Employee_ID' => $employeeId,
        ]);

        // Assert that the correct log is returned
        $response->assertStatus(200)
            ->assertJsonFragment(['Employee_ID' => $employeeId]);
    }

    /**
     * Test that filterRequestLogs returns 404 when no logs match the filters.
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_no_matching_logs_returns_404(): void
    {
        // Call the filterRequestLogs API with filters that don't match any logs
        $response = $this->postJson('/api/requestLog/filter', [
            'Employee_ID' => 999999, // Non-existent Employee ID
        ]);

        // Assert that the response is 404 with the correct message
        $response->assertStatus(404)
            ->assertJson(['message' => 'No logs found for the provided filters']);
    }

    /**
     * Test fetching request logs by a valid Request ID.
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_fetch_logs_by_valid_request_id(): void
    {
        // Create a request to generate a request log
        $response = $this->postJson('/api/request', [
            "staffid" => 151583,
            "date" => now()->format('Y-m-d'),
            "arrangement" => "FD",
            "reason" => "Test Request"
        ])->assertStatus(200); // Ensure request creation succeeds

        // Extract the generated Request ID
        $requestId = $response->json()['Request_ID'];

        // Call the API to get logs by Request ID
        $response = $this->getJson("/api/requestLog/requestId/{$requestId}");

        // Assert that the response is 200 and contains the correct Request ID
        $response->assertStatus(200)
            ->assertJsonFragment(['Request_ID' => $requestId]);
    }

    /**
     * Test fetching request logs by an invalid Request ID (non-numeric).
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_fetch_logs_by_invalid_request_id(): void
    {
        // Call the API with an invalid Request ID (non-numeric)
        $response = $this->getJson('/api/requestLog/requestId/abc');

        // Assert that the response is 400 Bad Request
        $response->assertStatus(400)
            ->assertJson(['message' => 'Invalid Request ID: abc']);
    }

    /**
     * Test fetching request logs by a non-existent Request ID.
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_fetch_logs_by_non_existent_request_id(): void
    {
        // Call the API with a Request ID that doesn't exist
        $response = $this->getJson('/api/requestLog/requestId/999999');

        // Assert that the response is 404 Not Found
        $response->assertStatus(404)
            ->assertJson(['message' => 'No logs found for Request ID: 999999']);
    }
}
