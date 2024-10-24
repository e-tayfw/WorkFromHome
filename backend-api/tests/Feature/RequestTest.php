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
use Illuminate\Support\Facades\Queue;
use App\Jobs\RejectPendingRequestsOlderThanTwoMonthsJob;
use Carbon\Carbon;

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
     * Test creating a valid request for an employee with valid date.
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_create_recurring_request_successful()
    {
        // Prepare data with a non-existent staff ID
        $staffId = '140879'; // Assuming this staff ID exist
        $startDate = '2024-10-06'; // Valid date
        $endDate = '2024-11-13'; // Valid date
        $arrangement = 'FD'; // Valid arrangement
        $reason = 'Personal'; // Valid reason
        $dayReason = 3;

        // Prepare the payload
        $payload = [
            'staffId' => $staffId,
            'startDate' => $startDate,
            'endDate' => $endDate,
            'arrangement' => $arrangement,
            'reason' => $reason,
            'dayReason' => $dayReason
        ];

        // Send POST request to create request
        $response = $this->postJson('/api/recurringRequest', $payload);

        // Assert that the response status is 400 (Bad Request)
        $response->assertStatus(200);
    }

    /**
     * Test overlapping pending requests date.
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_duplicate_pending_request_detection()
    {
        // Assuming a request with the same dates already exists
        $existingRequest = Requests::factory()->create([
            'Requestor_ID'   => '140879',
            'Approver_ID'    => '151408', // Example approver
            'Status'         => 'Pending',
            'Date_Requested' => '2024-10-09', // Date that will clash
            'Request_Batch'  => 15,
            'Duration'       => 'FD',
        ]);

        
        // Prepare a payload with the same date as the existing request
        $payload = [
            'staffId'     => '140879',
            'startDate'   => '2024-10-06',
            'endDate'     => '2024-11-13',
            'arrangement' => 'FD',
            'reason'      => 'Personal',
            'dayChosen'   => 3,
        ];

        // Send POST request
        $response = $this->postJson('/api/recurringRequest', $payload);

        // Assert that the response status is 409 (Conflict)
        $response->assertStatus(409);

        // Assert that the response contains the correct error message
        $response->assertJson([
            'message' => 'Duplicate request on Full Day arrangement.',
        ]);
    }

    /**
     * Test overlapping approved requests date.
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_duplicate_approved_request_detection()
    {
        // Assuming a request with the same dates already exists
        $existingRequest = Requests::factory()->create([
            'Requestor_ID'   => '140879',
            'Approver_ID'    => '151408', // Example approver
            'Status'         => 'Approved',
            'Date_Requested' => '2024-10-09', // Date that will clash
            'Request_Batch'  => 15,
            'Duration'       => 'FD',
        ]);

        
        // Prepare a payload with the same date as the existing request
        $payload = [
            'staffId'     => '140879',
            'startDate'   => '2024-10-06',
            'endDate'     => '2024-11-13',
            'arrangement' => 'FD',
            'reason'      => 'Personal',
            'dayChosen'   => 3,
        ];

        // Send POST request
        $response = $this->postJson('/api/recurringRequest', $payload);

        // Assert that the response status is 409 (Conflict)
        $response->assertStatus(409);

        // Assert that the response contains the correct error message
        $response->assertJson([
            'message' => 'Duplicate request on Full Day arrangement.',
        ]);
    }

    /**
     * Test overlapping withdraw rejected request dates.
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_duplicate_withdraw_rejected_request_detection()
    {
        // Assuming a request with the same dates already exists
        $existingRequest = Requests::factory()->create([
            'Requestor_ID'   => '140879',
            'Approver_ID'    => '151408', // Example approver
            'Status'         => 'Withdraw Rejected',
            'Date_Requested' => '2024-10-09', // Date that will clash
            'Request_Batch'  => 15,
            'Duration'       => 'FD',
        ]);

        
        // Prepare a payload with the same date as the existing request
        $payload = [
            'staffId'     => '140879',
            'startDate'   => '2024-10-06',
            'endDate'     => '2024-11-13',
            'arrangement' => 'FD',
            'reason'      => 'Personal',
            'dayChosen'   => 3,
        ];

        // Send POST request
        $response = $this->postJson('/api/recurringRequest', $payload);

        // Assert that the response status is 409 (Conflict)
        $response->assertStatus(409);

        // Assert that the response contains the correct error message
        $response->assertJson([
            'message' => 'Duplicate request on Full Day arrangement.',
        ]);
    }

    /**
     * Test overlapping withdraw pending request dates.
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_duplicate_withdraw_pending_request_detection()
    {
        // Assuming a request with the same dates already exists
        $existingRequest = Requests::factory()->create([
            'Requestor_ID'   => '140879',
            'Approver_ID'    => '151408', // Example approver
            'Status'         => 'Withdraw Pending',
            'Date_Requested' => '2024-10-09', // Date that will clash
            'Request_Batch'  => 15,
            'Duration'       => 'FD',
        ]);

        
        // Prepare a payload with the same date as the existing request
        $payload = [
            'staffId'     => '140879',
            'startDate'   => '2024-10-06',
            'endDate'     => '2024-11-13',
            'arrangement' => 'FD',
            'reason'      => 'Personal',
            'dayChosen'   => 3,
        ];

        // Send POST request
        $response = $this->postJson('/api/recurringRequest', $payload);

        // Assert that the response status is 409 (Conflict)
        $response->assertStatus(409);

        // Assert that the response contains the correct error message
        $response->assertJson([
            'message' => 'Duplicate request on Full Day arrangement.',
        ]);
    }

    /**
     * Test duplicate requests with different half day arrangements.
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_double_requests_for_seperate_half_day_arrangement(): void
    {
        // Assuming a request with the same dates already exists
        $existingRequest = Requests::factory()->create([
            'Requestor_ID'   => '140879',
            'Approver_ID'    => '151408', // Example approver
            'Status'         => 'Withdraw Pending',
            'Date_Requested' => '2024-10-09', // Date that will clash
            'Request_Batch'  => 15,
            'Duration'       => 'AM',
        ]);

        $payload = [
            'staffId'     => '140879',
            'startDate'   => '2024-10-06',
            'endDate'     => '2024-11-13',
            'arrangement' => 'PM',
            'reason'      => 'Personal',
            'dayChosen'   => 3,
        ];

        $response = $this->postJson('/api/recurringRequest', $payload);

        $response->assertStatus(200);
    }

    /**
     * Test duplicate requests with same half day arrangements.
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_double_requests_for_same_half_day_arrangement(): void
    {
        // Assuming a request with the same dates already exists
        $existingRequest = Requests::factory()->create([
            'Requestor_ID'   => '140879',
            'Approver_ID'    => '151408', // Example approver
            'Status'         => 'Withdraw Pending',
            'Date_Requested' => '2024-10-09', // Date that will clash
            'Request_Batch'  => 15,
            'Duration'       => 'PM',
        ]);

        $payload = [
            'staffId'     => '140879',
            'startDate'   => '2024-10-06',
            'endDate'     => '2024-11-13',
            'arrangement' => 'PM',
            'reason'      => 'Personal',
            'dayChosen'   => 3,
        ];

        $response = $this->postJson('/api/recurringRequest', $payload);

        $response->assertStatus(409);

        $response->assertJson([
            'message' => 'Duplicate requests for same half day arrangement.',
        ]);

    }

    /*
    * Test if start date and end date gap is larger than 3 months.
    * 
    * #[Depends('test_database_is_test_db')]
    */
    public function test_date_range_more_than_three_months_apart()
    {
        // Prepare data with a start date and an end date more than 3 months apart
        $staffId = '140879'; // Assuming this staff ID exists
        $startDate = '2024-01-01'; // January 1st, 2024
        $endDate = '2024-05-01'; // May 1st, 2024 (more than 3 months apart)
        $arrangement = 'FD'; // Valid arrangement (Full Day)
        $reason = 'Extended leave';
        $dayChosen = 2; // Choosing a day (Tuesday, for example)

        // Prepare the payload
        $payload = [
            'staffId'     => $staffId,
            'startDate'   => $startDate,
            'endDate'     => $endDate,
            'arrangement' => $arrangement,
            'reason'      => $reason,
            'dayChosen'   => $dayChosen,
        ];

        // Send POST request to create request
        $response = $this->postJson('/api/recurringRequest', $payload);

        // Assert that the response status is 400 (Bad Request)
        $response->assertStatus(400);

        // Assert that the response contains the correct error message
        $response->assertJson([
            'message' => 'The date range must be within 3 months apart',
        ]);
    }

    /**
     * Test end date exceeds three months forward from the current date
     * 
     * #[Depends('test_database_is_test_db')]
     */
     public function end_date_exceeds_three_months_forward()
    {
        // Prepare data
        $staffId = '140879'; // Assuming this staff ID exists
        $startDate = Carbon::now()->addMonths(2)->format('Y-m-d');
        $endDate = Carbon::now()->addMonths(4)->format('Y-m-d'); // More than 3 months forward
        $arrangement = 'FD';
        $reason = 'Holiday';
        $dayChosen = 3;

        // Prepare payload
        $payload = [
            'staffId'     => $staffId,
            'startDate'   => $startDate,
            'endDate'     => $endDate,
            'arrangement' => $arrangement,
            'reason'      => $reason,
            'dayChosen'   => $dayChosen,
        ];

        // Send POST request
        $response = $this->postJson('/api/recurringRequest', $payload);

        // Assert response status is 400 (Bad Request)
        $response->assertStatus(400);

        // Assert the response contains the correct message
        $response->assertJson([
            'message' => 'The date range must be within 2 months back and 3 months forward from the current date',
        ]);
    }

    /**
     * Test start date exceeds two months back from the current date
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function start_date_exceeds_two_months_back()
    {
        // Prepare data
        $staffId = '140879'; // Assuming this staff ID exists
        $startDate = Carbon::now()->subMonths(3)->format('Y-m-d'); // More than 2 months back
        $endDate = Carbon::now()->format('Y-m-d');
        $arrangement = 'FD';
        $reason = 'Late request';
        $dayChosen = 3;

        // Prepare payload
        $payload = [
            'staffId'     => $staffId,
            'startDate'   => $startDate,
            'endDate'     => $endDate,
            'arrangement' => $arrangement,
            'reason'      => $reason,
            'dayChosen'   => $dayChosen,
        ];

        // Send POST request
        $response = $this->postJson('/api/recurringRequest', $payload);

        // Assert response status is 400 (Bad Request)
        $response->assertStatus(400);

        // Assert the response contains the correct message
        $response->assertJson([
            'message' => 'The date range must be within 2 months back and 3 months forward from the current date',
        ]);
    }

    /**
     * Test start date behind the current date
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_start_date_behind_current_date()
    {
        // Prepare data
        $staffId = '140878'; // Assuming this staff ID exists
        $startDate = Carbon::now()->subMonths(1)->format('Y-m-d'); // Behind current date
        $endDate = Carbon::now()->addMonths(1)->format('Y-m-d');
        $arrangement = 'AM';
        $reason = 'Late request';
        $dayChosen = 3;

        // Prepare payload
        $payload = [
            'staffId'     => $staffId,
            'startDate'   => $startDate,
            'endDate'     => $endDate,
            'arrangement' => $arrangement,
            'reason'      => $reason,
            'dayChosen'   => $dayChosen,
        ];

        // Send POST request
        $response = $this->postJson('/api/recurringRequest', $payload);

        // Assert response status is 200
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

    /**
     * Test if the API returns a 400 for not trying to approve
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_recurring_approve_not_trying_to_approve(): void
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
            "Reason" => "REASONS",
            "Duration" => "FD"
    ];
    
        // Send a GET request to a valid request
        $response = $this->postJson('/api/approveRecurringRequest', $payload);

        // Assert that the response status is 400 (Bad Request) 
        $response->assertStatus(400);
    }

    /**
     * Test if the API returns a 400 as request is already approved
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_recurring_approve_already_approved(): void
    {
        $request1 = Requests::factory()->create([
            'Status' => 'Approved',
            'Approver_ID' => 140001,
            'Request_ID' => 15,
            'Date_Requested' => '2024-09-27',
            'Request_Batch' => 1,
            'Duration'=>'FD'
        ]);

        $request2 = Requests::factory()->create([
            'Status' => 'Approved',
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
            "Reason" => "REASONS",
            "Duration" => "FD"
    ];
    
        // Send a GET request to a valid request
        $response = $this->postJson('/api/approveRecurringRequest', $payload);

        // Assert that the response status is 400 (Bad Request) 
        $response->assertStatus(400);
    }

     /**
     * Test if the API returns a 200 for success
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_recurring_approve_with_withdrawn_request(): void
    {
        $request1 = Requests::factory()->create([
            'Status' => 'Withdrawn',
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
            "Reason" => "REASONS",
            "Duration" => "FD"
    ];
    
        // Send a GET request to a valid request
        $response = $this->postJson('/api/approveRecurringRequest', $payload);

        // Assert that the response status is 200 (OK) 
        $response->assertStatus(200);

        $this->assertDatabaseHas('Request', [
            'Request_ID' => 15,
            'Status' => 'Withdrawn'
        ]);

        $this->assertDatabaseHas('Request', [
            'Request_ID' => 16,
            'Status' => 'Approved'
        ]);
    }

    /**
     * Test if the API returns a 200 for success
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_recurring_approve_with_incorrect_approver_id(): void
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
            "Approver_ID" => 140002,
            "Status" => "Approved",
            "Reason" => "REASONS",
            "Duration" => "FD"
    ];
    
        // Send a GET request to a valid request
        $response = $this->postJson('/api/approveRecurringRequest', $payload);

        // Assert that the response status is 200 (OK) 
        $response->assertStatus(400);
    }
}
