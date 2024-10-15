<?php

namespace Tests\Feature;

use Database\Seeders\EmployeeSeeder;
use Database\Seeders\RequestSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use DB;
use Log;

class RequestTest extends TestCase
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
     * Test if the API returns a 200 for getting all requests.
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_get_all_requests(): void
    {
        // Make a GET request to the API endpoint with a valid employee ID (130002)
        $response = $this->getJson('/api/request');

        // Assert that the response status is 200 (OK)
        $response->assertStatus(200);
    }

    /**
     * Test if the API returns 200 for getting request by requestor ID.
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_get_all_requests_by_requestor_id(): void
    {
        // Send a GET request with an invalid ID (e.g., a string instead of an integer)
        $response = $this->getJson('/api/request/requestorId/171014');

        // Assert that the response status is 200 (OK) due to validation
        $response->assertStatus(200);
    }

    /**
     * Test if the API returns a 200 to get all request by approver ID.
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_get_all_requests_by_aprover_id(): void
    {
        // Send a GET request with an invalid ID (e.g., a string instead of an integer)
        $response = $this->getJson('/api/request/approverID/140001');

        // Assert that the response status is 200 (OK) due to validation
        $response->assertStatus(200);
    }

    /**
     * Test if the API returns a 200 to get all request by approver ID but the ID is not an approver for anyone.
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_get_all_requests_by_aprover_id_person_is_not_approver(): void
    {
        // Send a GET request with an invalid ID (e.g., a string instead of an integer)
        $response = $this->getJson('/api/request/approverID/140880');

        // Assert that the response status is 200 (OK) due to validation
        $response->assertStatus(200);

        // Assert that the response contains an empty array (indicating no requests found)
        $response->assertJson([]);
    }


    /**
     * Test if the API returns a 200 to get proportion of team.
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_get_proportion_of_team(): void
    {
        // Send a GET request
        $response = $this->getJson('/api/request/proportionOfTeam/140001');

        // Assert that the response status is 200 (OK) 
        $response->assertStatus(200);
    }

    /**
     * Test if the API returns a 404 for a non-existing employee.
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_get_proportion_of_team_invalid_id(): void
    {
        // Send a GET request to a non-existing email
        $response = $this->getJson('/api/request/proportionOfTeam/000000');

        // Assert that the response status is 404 (Not Found) as person is not a manager
        $response->assertStatus(404);
    }

    /**
     * Test if the API returns a 404 for a existing employee but who is not a manager.
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_get_proportion_of_team_valid_id_non_manager(): void
    {
        // Send a GET request to an employee that is not a manager
        $response = $this->getJson('/api/request/proportionOfTeam/140910');

        // Assert that the response status is 404 (Not Found) as person is not a manager
        $response->assertStatus(404);
    }

    /**
     * Test if the API returns a 200 to get proportion of team on date.
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_get_proportion_of_team_on_date(): void
    {
        // Send a GET request
        $response = $this->getJson('/api/request/proportionOfTeam/date/140001/2024-10-03');

        // Assert that the response status is 200 (OK) as person is not a manager
        $response->assertStatus(200);
    }

    /**
     * Test if the API returns a 404 if staff_id does not exist.
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_get_proportion_of_team_on_date_invalid_id(): void
    {
        // Send a GET request to a non-existing staff_id
        $response = $this->getJson('/api/request/proportionOfTeam/date/000000/2024-10-03');

        // Assert that the response status is 404 (Not Found) as person is not a manager
        $response->assertStatus(404);
    }

    /**
     * Test if the API returns a 424 if date format is wrong.
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_get_proportion_of_team_on_date_invalid_date_format(): void
    {
        // Send a GET request to a non-existing email
        $response = $this->getJson('/api/request/proportionOfTeam/date/140001/03-10-2024');

        // Assert that the response status is 424 (Not Found) as person is not a manager
        $response->assertStatus(424);
    }

    /**
     * Test creating a request with a non-existent employee.
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_create_request_with_invalid_id(): void
    {
        // Prepare data with a non-existent staff ID
        $staffId = '000000'; // Assuming this staff ID does not exist
        $date = '2024-10-10'; // Valid date
        $arrangement = 'Full Day'; // Valid arrangement
        $reason = 'Personal'; // Valid reason

        // Prepare the payload
        $payload = [
            'staffid' => $staffId,
            'date' => $date,
            'arrangement' => $arrangement,
            'reason' => $reason,
        ];

        // Send POST request to create request
        $response = $this->postJson('/api/request', $payload);

        // Assert that the response status is 404 (Not Found)
        $response->assertStatus(404);

        // Assert the error message
        $response->assertJson([
            'message' => 'Employee not found',
        ]);
    }

    /**
     * Test creating a request
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_creating_request_successful(): void
    {
        // Prepare data with a non-existent staff ID
        $staffId = '140001'; // Assuming this staff ID exist
        $date = '2024-10-6'; // Valid date
        $arrangement = 'Full Day'; // Valid arrangement
        $reason = 'Personal'; // Valid reason

        // Prepare the payload
        $payload = [
            'staffid' => $staffId,
            'date' => $date,
            'arrangement' => $arrangement,
            'reason' => $reason,
        ];

        // Send POST request to create request
        $response = $this->postJson('/api/request', $payload);

        // Assert that the response status is 400 (Bad Request)
        $response->assertStatus(200);
    }

    /**
     * Test creating a multiple requests on the same day
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_create_request_multiple_reqeusts_same_date(): void
    {
        // Prepare data with a non-existent staff ID
        $staffId = '140001'; // Assuming this staff ID exist
        $date = '2024-10-6'; // Valid date butt repeated request
        $arrangement = 'Full Day'; // Valid arrangement
        $reason = 'Personal'; // Valid reason

        // Prepare the payload
        $payload = [
            'staffid' => $staffId,
            'date' => $date,
            'arrangement' => $arrangement,
            'reason' => $reason,
        ];

        // Send POST request to create request
        $response = $this->postJson('/api/request', $payload);

        // Assert that the response status is 400 (Bad Request)
        $response->assertStatus(400);
    }

    /**
     * Test creating a request with inalid date format
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_create_request_with_invalid_date_format(): void
    {
        // Prepare data with a non-existent staff ID
        $staffId = '140001'; // Assuming this staff ID exist
        $date = '2024-10-60'; // Invalid date
        $arrangement = 'Full Day'; // Valid arrangement
        $reason = 'Personal'; // Valid reason

        // Prepare the payload
        $payload = [
            'staffid' => $staffId,
            'date' => $date,
            'arrangement' => $arrangement,
            'reason' => $reason,
        ];

        // Send POST request to create request
        $response = $this->postJson('/api/request', $payload);

        // Assert that the response status is 400 (Bad Request)
        $response->assertStatus(400);
    }
}
