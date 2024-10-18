<?php

namespace Tests\Feature;

use Database\Seeders\EmployeeSeeder;
use Database\Seeders\RequestSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Requests;
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
        $arrangement = 'FD'; // Valid arrangement
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
        $staffId = '140879'; // Assuming this staff ID exist
        $date = '2024-10-6'; // Valid date
        $arrangement = 'FD'; // Valid arrangement
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
        $request = Requests::factory()->create([
            'Status' => 'Pending',
            'Requestor_ID'=>140879,
            'Approver_ID' => 151408,
            'Request_ID' => 15,
            'Date_Requested' => '2024-11-10',
            'Request_Batch' => null,
            'Duration'=>'FD'
        ]);

        // Prepare data with a non-existent staff ID
        $staffId = '140879'; // Assuming this staff ID exist
        $date = '2024-11-10'; // Valid date butt repeated request
        $arrangement = 'FD'; // Valid arrangement
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
     * Test creating a multiple requests on the same day
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_create_request_multiple_reqeusts_same_date_different_arrangement(): void
    {
        $request = Requests::factory()->create([
            'Status' => 'Pending',
            'Requestor_ID'=>140879,
            'Approver_ID' => 151408,
            'Request_ID' => 15,
            'Date_Requested' => '2024-11-10',
            'Request_Batch' => null,
            'Duration'=>'AM'
        ]);

        // Prepare data with a non-existent staff ID
        $staffId = '140879'; // Assuming this staff ID exist
        $date = '2024-11-10'; // Valid date butt repeated request
        $arrangement = 'PM'; // Valid arrangement
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
     * Test if the API returns a 200 for approve request
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_approve_request_success(): void
    {
        $request = Requests::factory()->create([
            'Status' => 'Pending',
            'Approver_ID' => 151408,
            'Request_ID' => 15,
            'Date_Requested' => '2024-09-27',
            'Request_Batch' => null,
            'Duration'=>'FD'
        ]);

        $payload = [
            "Request_ID" => 15,
            "Approver_ID" => 151408,
            "Status" => "Approved",
            "Date_Requested" => '2024-09-27',
            "Request_Batch" => null,
            "Duration" => 'FD',
        ];

        $response = $this->postJson('/api/approveRequest', $payload);

        $response->assertStatus(200);

        $this->assertDatabaseHas('Request', [
            'Request_ID' => 15,
            'Status' => "Approved"
        ]);
    }

    /**
     * Test if the API returns a 400 for not trying to approve
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_approve_request_incorrect_status(): void
    {
        $request = Requests::factory()->create([
            'Status' => 'Pending',
            'Approver_ID' => 151408,
            'Request_ID' => 15,
            'Date_Requested' => '2024-09-27',
            'Request_Batch' => null,
            'Duration'=>'FD'
        ]);

        // Prepare date
        $Request_ID = 15; // Valid request ID from seeder
        $Approver_ID = 151408; // Valid approver ID
        $Status = 'Rejected'; // Valid status
        $Date_Requested = '2024-09-27'; // Valid date
        $Request_Batch = null; // Valid request batch
        $Duration = "FD"; // Valud duration

        // Prepare payload
        $payload = [
            'Request_ID'=>$Request_ID,
            'Approver_ID' => $Approver_ID,
            'Status' => $Status,
            'Date_Requested' => $Date_Requested,
            'Request_Batch' => $Request_Batch,
            'Duration' => $Duration
        ];
    
        // Send a GET request to a valid request
        $response = $this->postJson('/api/approveRequest', $payload);

        // Assert that the response status is 200 (OK) 
        $response->assertStatus(400);
    }

    /**
     * Test if the API returns a 400 for not trying to approve
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_approve_request_request_already_approved(): void
    {
        $request = Requests::factory()->create([
            'Status' => 'Approved',
            'Approver_ID' => 151408,
            'Request_ID' => 15,
            'Date_Requested' => '2024-09-27',
            'Request_Batch' => null,
            'Duration'=>'FD'
        ]);

        $payload = [
            "Request_ID" => 15,
            "Approver_ID" => 151408,
            "Status" => "Approved",
            "Date_Requested" => '2024-09-27',
            "Request_Batch" => null,
            "Duration" => 'FD',
        ];
    
        // Send a GET request to a valid request
        $response = $this->postJson('/api/approveRequest', $payload);

        // Assert that the response status is 400 (Bad Request) 
        $response->assertStatus(400);
    }

    /**
     * Test if the API returns a 400 for not trying to approve
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_approve_request_invalid_date_format(): void
    {
        $request = Requests::factory()->create([
            'Status' => 'Approved',
            'Approver_ID' => 151408,
            'Request_ID' => 15,
            'Date_Requested' => '2024-09-27',
            'Request_Batch' => null,
            'Duration'=>'FD'
        ]);

        $payload = [
            "Request_ID" => 15,
            "Approver_ID" => 151408,
            "Status" => "Approved",
            "Date_Requested" => '2024-27-09',
            "Request_Batch" => null,
            "Duration" => 'FD',
        ];
    
        // Send a GET request to a valid request
        $response = $this->postJson('/api/approveRequest', $payload);

        // Assert that the response status is 400 (Bad Request) 
        $response->assertStatus(400);
    }

    /**
     * Test if the API returns a 400 for not trying to approve
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_approve_request_50_percent_rule(): void
    {
        $request1 = Requests::factory()->create([
            'Status' => 'Approved',
            'Requestor_ID' => 151408,
            'Approver_ID' => 130002,
            'Request_ID' => 15,
            'Date_Requested' => '2024-09-27',
            'Request_Batch' => null,
            'Duration'=>'FD'
        ]);
        $request2 = Requests::factory()->create([
            'Status' => 'Approved',
            'Requestor_ID' => 130002,
            'Approver_ID' => 130002,
            'Request_ID' => 16,
            'Date_Requested' => '2024-09-27',
            'Request_Batch' => null,
            'Duration'=>'FD'
        ]);
        $request3 = Requests::factory()->create([
            'Status' => 'Approved',
            'Requestor_ID' => 160008,
            'Approver_ID' => 130002,
            'Request_ID' => 17,
            'Date_Requested' => '2024-09-27',
            'Request_Batch' => null,
            'Duration'=>'FD'
        ]);
        $request4 = Requests::factory()->create([
            'Status' => 'Approved',
            'Requestor_ID' => 170166,
            'Approver_ID' => 130002,
            'Request_ID' => 18,
            'Date_Requested' => '2024-09-27',
            'Request_Batch' => null,
            'Duration'=>'FD'
        ]);
        $request5 = Requests::factory()->create([
            'Status' => 'Pending',
            'Requestor_ID' => 210001,
            'Approver_ID' => 130002,
            'Request_ID' => 19,
            'Date_Requested' => '2024-09-27',
            'Request_Batch' => null,
            'Duration'=>'FD'
        ]);

        $payload = [
            "Request_ID" => 19,
            "Approver_ID" => 130002,
            "Status" => "Approved",
            "Date_Requested" => '2024-09-27',
            "Request_Batch" => null,
            "Duration" => 'FD',
        ];
    
        // Send a GET request to a valid request
        $response = $this->postJson('/api/approveRequest', $payload);

        // Assert that the response status is 400 (Bad Request) 
        $response->assertStatus(400);
    }

    /**
     * Test if the API returns a 400 for not trying to approve
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_reject_request_wrong_approver_id(): void
    {
        $request = Requests::factory()->create([
            'Status' => 'Pending',
            'Approver_ID' => 140001,
            'Request_ID' => 15,
            'Date_Requested' => '2024-09-27',
            'Request_Batch' => null,
            'Duration'=>'FD'
        ]);

        $payload = [
            "Request_ID" => 15,
            "Approver_ID" => 151408,
            "Status" => "Rejected",
            "Date_Requested" => '2024-09-27',
            "Request_Batch" => null,
            "Duration" => 'FD',
            "Reason" => 'xxx'
        ];
    
        // Send a GET request to a valid request
        $response = $this->postJson('/api/rejectRequest', $payload);

        // Assert that the response status is 400 (Bad Request) 
        $response->assertStatus(400);
    }

    /**
     * Test if the API returns a 400 for not trying to approve
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_reject_request_already_rejected(): void
    {
        $request = Requests::factory()->create([
            'Status' => 'Rejected',
            'Approver_ID' => 140001,
            'Request_ID' => 15,
            'Date_Requested' => '2024-09-27',
            'Request_Batch' => null,
            'Duration'=>'FD'
        ]);

        $payload = [
            "Request_ID" => 15,
            "Approver_ID" => 140001,
            "Status" => "Rejected",
            "Date_Requested" => '2024-09-27',
            "Request_Batch" => null,
            "Duration" => 'FD',
            "Reason" => 'xxx'
        ];
    
        // Send a GET request to a valid request
        $response = $this->postJson('/api/rejectRequest', $payload);

        // Assert that the response status is 400 (Bad Request) 
        $response->assertStatus(400);
    }

    /**
     * Test if the API returns a 400 for not trying to approve
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_reject_request_not_trying_to_reject(): void
    {
        $request = Requests::factory()->create([
            'Status' => 'Pending',
            'Requestor_ID' => 210001,
            'Approver_ID' => 130002,
            'Request_ID' => 15,
            'Date_Requested' => '2024-09-27',
            'Request_Batch' => null,
            'Duration'=>'FD'
        ]);

        $payload = [
            "Request_ID" => 15,
            "Approver_ID" => 130002,
            "Status" => "Approved",
            "Date_Requested" => '2024-09-27',
            "Request_Batch" => null,
            "Duration" => 'FD',
            "Reason" => 'xxx'
        ];
    
        // Send a GET request to a valid request
        $response = $this->postJson('/api/rejectRequest', $payload);

        // Assert that the response status is 400 (Bad Request) 
        $response->assertStatus(400);
    }

    /**
     * Test if the API returns a 400 for not trying to approve
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_reject_request_success(): void
    {
        $request = Requests::factory()->create([
            'Status' => 'Pending',
            'Approver_ID' => 151408,
            'Request_ID' => 15,
            'Date_Requested' => '2024-09-27',
            'Request_Batch' => null,
            'Duration'=>'FD'
        ]);

        $payload = [
            "Request_ID" => 15,
            "Approver_ID" => 151408,
            "Status" => "Rejected",
            "Date_Requested" => '2024-09-27',
            "Request_Batch" => null,
            "Duration" => 'FD',
            "Reason" => 'xxx'
        ];

        $response = $this->postJson('/api/rejectRequest', $payload);

        $response->assertStatus(200);

        $this->assertDatabaseHas('Request', [
            'Request_ID' => 15,
            'Status' => "Rejected"
        ]);
    }

    /**
     * Test if the API returns a 400 for not trying to approve
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_withdraw_request_reject_success(): void
    {
        $request = Requests::factory()->create([
            'Status' => 'Withdraw Pending',
            'Approver_ID' => 151408,
            'Request_ID' => 15,
            'Date_Requested' => '2024-09-27',
            'Request_Batch' => null,
            'Duration'=>'FD'
        ]);

        $payload = [
            "Request_ID" => 15,
            "Approver_ID" => 151408,
            "Status" => "Withdraw Rejected",
            "Date_Requested" => '2024-09-27',
            "Request_Batch" => null,
            "Duration" => 'FD',
            "Reason" => 'xxx'
        ];

        $response = $this->postJson('/api/rejectRequest', $payload);

        $response->assertStatus(200);

        $this->assertDatabaseHas('Request', [
            'Request_ID' => 15,
            'Status' => "Withdraw Rejected"
        ]);
    }

    /**
     * Test if the API returns a 400 for not trying to approve
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_withdraw_request_approve_success(): void
    {
        $request = Requests::factory()->create([
            'Status' => 'Withdraw Pending',
            'Approver_ID' => 151408,
            'Request_ID' => 15,
            'Date_Requested' => '2024-09-27',
            'Request_Batch' => null,
            'Duration'=>'FD'
        ]);

        $payload = [
            "Request_ID" => 15,
            "Approver_ID" => 151408,
            "Status" => "Withdrawn",
            "Date_Requested" => '2024-09-27',
            "Request_Batch" => null,
            "Duration" => 'FD',
            "Reason" => 'xxx'
        ];

        $response = $this->postJson('/api/approveRequest', $payload);

        $response->assertStatus(200);

        $this->assertDatabaseHas('Request', [
            'Request_ID' => 15,
            'Status' => "Withdrawn"
        ]);
    }

    /**
     * Test if the API returns a 400 for not trying to approve
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_withdraw_request_reject_inncorect_state_change(): void
    {
        $request = Requests::factory()->create([
            'Status' => 'Withdraw Pending',
            'Approver_ID' => 151408,
            'Request_ID' => 15,
            'Date_Requested' => '2024-09-27',
            'Request_Batch' => null,
            'Duration'=>'FD'
        ]);

        $payload = [
            "Request_ID" => 15,
            "Approver_ID" => 151408,
            "Status" => "Rejected",
            "Date_Requested" => '2024-09-27',
            "Request_Batch" => null,
            "Duration" => 'FD',
            "Reason" => 'xxx'
        ];

        $response = $this->postJson('/api/rejectRequest', $payload);

        $response->assertStatus(400);
    }

    /**
     * Test if the API returns a 400 for not trying to approve
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_withdraw_request_approve_incorrect_state_change(): void
    {
        $request = Requests::factory()->create([
            'Status' => 'Withdraw Pending',
            'Approver_ID' => 151408,
            'Request_ID' => 15,
            'Date_Requested' => '2024-09-27',
            'Request_Batch' => null,
            'Duration'=>'FD'
        ]);

        $payload = [
            "Request_ID" => 15,
            "Approver_ID" => 151408,
            "Status" => "Approved",
            "Date_Requested" => '2024-09-27',
            "Request_Batch" => null,
            "Duration" => 'FD',
            "Reason" => 'xxx'
        ];

        $response = $this->postJson('/api/approveRequest', $payload);

        $response->assertStatus(400);
    }


    /**
     * Test if the API returns a 400 for wrong approver id
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_recurring_reject_request_wrong_approver_id(): void
    {
        $request1 = Requests::factory()->create([
            'Status' => 'Pending',
            'Approver_ID' => 140001,
            'Request_ID' => 15,
            'Date_Requested' => '2024-09-27',
            'Request_Batch' => 1,
            'Duration'=>'FD'
        ]);

        $request2 = Requests::factory()->create([
            'Status' => 'Pending',
            'Approver_ID' => 140001,
            'Request_ID' => 16,
            'Date_Requested' => '2024-09-27',
            'Request_Batch' => 1,
            'Duration'=>'FD'
        ]);

        $payload = [
                "Request_Batch" => 1,
                "Approver_ID" => 170166,
                "Status" => "Rejected",
                "Reason" => "REASONS"
        ];
    
        // Send a GET request to a valid request
        $response = $this->postJson('/api/rejectRecurringRequest', $payload);

        // Assert that the response status is 400 (Bad Request) 
        $response->assertStatus(400);
    }

    /**
     * Test if the API returns a 400 for request is already rejected
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test__recurring_reject_request_already_rejected(): void
    {
        $request1 = Requests::factory()->create([
            'Status' => 'Rejected',
            'Approver_ID' => 140001,
            'Request_ID' => 15,
            'Date_Requested' => '2024-09-27',
            'Request_Batch' => 1,
            'Duration'=>'FD'
        ]);

        $request2 = Requests::factory()->create([
            'Status' => 'Rejected',
            'Approver_ID' => 140001,
            'Request_ID' => 16,
            'Date_Requested' => '2024-09-27',
            'Request_Batch' => 1,
            'Duration'=>'FD'
        ]);

        $payload = [
            "Request_Batch" => 1,
            "Approver_ID" => 140001,
            "Status" => "Rejected",
            "Reason" => "REASONS"
    ];
    
        // Send a GET request to a valid request
        $response = $this->postJson('/api/rejectRecurringRequest', $payload);

        // Assert that the response status is 400 (Bad Request) 
        $response->assertStatus(400);
    }

    /**
     * Test if the API returns a 400 for not trying to reject
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_recurring_reject_request_not_trying_to_reject(): void
    {
        $request1 = Requests::factory()->create([
            'Status' => 'Pending',
            'Approver_ID' => 140001,
            'Request_ID' => 15,
            'Date_Requested' => '2024-09-27',
            'Request_Batch' => 1,
            'Duration'=>'FD'
        ]);

        $request2 = Requests::factory()->create([
            'Status' => 'Pending',
            'Approver_ID' => 140001,
            'Request_ID' => 16,
            'Date_Requested' => '2024-09-27',
            'Request_Batch' => 1,
            'Duration'=>'FD'
        ]);

        $payload = [
            "Request_Batch" => 1,
            "Approver_ID" => 140001,
            "Status" => "Approved",
            "Reason" => "REASONS"
    ];
    
        // Send a GET request to a valid request
        $response = $this->postJson('/api/rejectRecurringRequest', $payload);

        // Assert that the response status is 400 (Bad Request) 
        $response->assertStatus(400);
    }

    /**
     * Test if the API returns a 400 for not providing reason
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_recurring_reject_reason_not_provided(): void
    {
        $request1 = Requests::factory()->create([
            'Status' => 'Pending',
            'Approver_ID' => 140001,
            'Request_ID' => 15,
            'Date_Requested' => '2024-09-27',
            'Request_Batch' => 1,
            'Duration'=>'FD'
        ]);

        $request2 = Requests::factory()->create([
            'Status' => 'Pending',
            'Approver_ID' => 140001,
            'Request_ID' => 16,
            'Date_Requested' => '2024-09-27',
            'Request_Batch' => 1,
            'Duration'=>'FD'
        ]);

        $payload = [
            "Request_Batch" => 1,
            "Approver_ID" => 140001,
            "Status" => "Rejected",
            "Reason" => ""
    ];
    
        // Send a GET request to a valid request
        $response = $this->postJson('/api/rejectRecurringRequest', $payload);

        // Assert that the response status is 400 (Bad Request) 
        $response->assertStatus(400);
    }

    /**
     * Test if the API returns a 404 for no matching requests
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_recurring_reject_no_matching_requests(): void
    {
        $request1 = Requests::factory()->create([
            'Status' => 'Pending',
            'Approver_ID' => 140001,
            'Request_ID' => 15,
            'Date_Requested' => '2024-09-27',
            'Request_Batch' => 1,
            'Duration'=>'FD'
        ]);

        $request2 = Requests::factory()->create([
            'Status' => 'Pending',
            'Approver_ID' => 140001,
            'Request_ID' => 16,
            'Date_Requested' => '2024-09-27',
            'Request_Batch' => 1,
            'Duration'=>'FD'
        ]);

        $payload = [
            "Request_Batch" => 2,
            "Approver_ID" => 140001,
            "Status" => "Rejected",
            "Reason" => "reaSONS"
    ];
    
        // Send a GET request to a valid request
        $response = $this->postJson('/api/rejectRecurringRequest', $payload);

        // Assert that the response status is 404 (not found) 
        $response->assertStatus(404);
    }

    /**
     * Test if the API returns a 200 for success
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_recurring_reject_request_success(): void
    {
        $request1 = Requests::factory()->create([
            'Status' => 'Pending',
            'Approver_ID' => 140001,
            'Request_ID' => 15,
            'Date_Requested' => '2024-09-27',
            'Request_Batch' => 1,
            'Duration'=>'FD'
        ]);

        $request2 = Requests::factory()->create([
            'Status' => 'Pending',
            'Approver_ID' => 140001,
            'Request_ID' => 16,
            'Date_Requested' => '2024-10-27',
            'Request_Batch' => 1,
            'Duration'=>'FD'
        ]);

        $payload = [
            "Request_Batch" => 1,
            "Approver_ID" => 140001,
            "Status" => "Rejected",
            "Reason" => "REASONS"
    ];
    
        // Send a GET request to a valid request
        $response = $this->postJson('/api/rejectRecurringRequest', $payload);

        // Assert that the response status is 200 (OK) 
        $response->assertStatus(200);
    }
}
