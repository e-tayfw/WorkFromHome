<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Requests;
use Carbon\Carbon;
use Database\Seeders\EmployeeSeeder;
use DB;
use Log;

class StaffWithdrawRequestTest extends TestCase
{
    use RefreshDatabase; // Ensures the database is reset between tests

    /**
     * Seed the database before each test.
     */
    protected function setUp(): void
    {
        parent::setUp();
        // Seed the Request data
        $this->seed(EmployeeSeeder::class);
    }

    /**
     * Test to ensure the test is using the correct database.
     */
    public function test_database_is_test_db(): void
    {
        $dbName = DB::connection()->getDatabaseName();
        $this->assertStringContainsString('test_db', $dbName, 'The database name does not contain "test_db"');
    }

    /**
     * Test that returns a 400 status when the request is not found.
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_request_id_not_found_returns_400(): void
    {
        // Prepare payload with non-existent Request_ID
        $payload = [
            "Request_ID" => 999999,  // Non-existent ID
            "Employee_ID" => 171009,
            "Reason" => "Personal"
        ];

        // Try to withdraw a non-existent request id
        $response = $this->postJson('/api/request/withdraw', $payload);
        $response->assertStatus(400);
    }

    /**
     * Test that returns a 400 status when the request is not found.
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_employee_id_not_found_returns_400(): void
    {
        // Prepare payload with non-existent Request_ID
        $payload = [
            "Request_ID" => 171009,  // Non-existent ID
            "Employee_ID" => 999999,
            "Reason" => "Personal"
        ];

        // Try to withdraw a non-existent request id
        $response = $this->postJson('/api/request/withdraw', $payload);
        $response->assertStatus(400);
    }

    /**
     * Test that allows withdrawal if the status is 'Approved' and the date is within 2 weeks from the WFH date.
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_withdraw_pending_for_approved_status_within_2_weeks(): void
    {
        // Create a request with 'Approved' status and a WFH date within 2 weeks
        $request = Requests::factory()->create([
            'Status' => 'Approved',
            'Date_Requested' => Carbon::now()->addDays(10), // Within 2 weeks
        ]);

        $payload = [
            "Request_ID" => $request->Request_ID, 
            "Employee_ID" => $request->Requestor_ID,
            "Reason" => "Personal"
        ];

        // Withdraw the request and check the response
        $response = $this->postJson("/api/request/withdraw", $payload);
        $response->assertStatus(200);

        // Assert that the request status is now 'Withdraw Pending'
        $this->assertDatabaseHas('Request', [
            'Request_ID' => $request->Request_ID,
            'Status' => 'Withdraw Pending'
        ]);
    }

    /**
     * Test that rejects withdrawal if the status is 'Approved' but the date is more than 2 weeks away.
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_withdraw_rejected_if_approved_status_but_not_within_2_weeks(): void
    {
        // Create a request with 'Approved' status but with a WFH date more than 2 weeks away
        $request = Requests::factory()->create([
            'Status' => 'Approved',
            'Date_Requested' => Carbon::now()->addDays(20), // More than 2 weeks away
        ]);

        $payload = [
            "Request_ID" => $request->Request_ID, 
            "Employee_ID" => $request->Requestor_ID,
            "Reason" => "Personal"
        ];

        // Attempt to withdraw and check for a rejection
        $response = $this->postJson("/api/request/withdraw", $payload);
        $response->assertStatus(400);

        // Assert that the request status is still 'Approved'
        $this->assertDatabaseHas('Request', [
            'Request_ID' => $request->Request_ID,
            'Status' => 'Approved'
        ]);
    }

    /**
     * Test that withdraws successfully if the status is 'Pending'.
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_request_withdrawn_for_pending_status(): void
    {
        // Create a request with 'Pending' status
        $request = Requests::factory()->create([
            'Status' => 'Pending',
        ]);

        $payload = [
            "Request_ID" => $request->Request_ID, 
            "Employee_ID" => $request->Requestor_ID,
            "Reason" => "Personal"
        ];

        // Attempt to withdraw and check the response
        $response = $this->postJson("/api/request/withdraw", $payload);
        $response->assertStatus(200);

        // Assert that the status is now 'Withdrawn'
        $this->assertDatabaseHas('Request', [
            'Request_ID' => $request->Request_ID,
            'Status' => 'Withdrawn'
        ]);
    }

    /**
     * Test that returns a rejection message when the status is 'Rejected'.
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_request_rejected_for_wfh_rejected_status(): void
    {
        // Create a request with 'Rejected' status
        $request = Requests::factory()->create([
            'Status' => 'Rejected',
        ]);

        $payload = [
            "Request_ID" => $request->Request_ID, 
            "Employee_ID" => $request->Requestor_ID,
            "Reason" => "Personal"
        ];

        // Attempt to withdraw and check the response
        $response = $this->postJson("/api/request/withdraw", $payload);
        $response->assertStatus(200);

        // Assert that the status is still 'Rejected'
        $this->assertDatabaseHas('Request', [
            'Request_ID' => $request->Request_ID,
            'Status' => 'Rejected'
        ]);
    }

    /**
     * Test that allows resubmission for withdrawal when the status is 'Withdraw Rejected'.
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_request_resubmitted_for_withdraw_rejected_status(): void
    {
        // Create a request with 'Withdraw Rejected' status
        $request = Requests::factory()->create([
            'Status' => 'Withdraw Rejected',
        ]);

        $payload = [
            "Request_ID" => $request->Request_ID, 
            "Employee_ID" => $request->Requestor_ID,
            "Reason" => "Personal"
        ];

        // Attempt to resubmit for withdrawal and check the response
        $response = $this->postJson("/api/request/withdraw", $payload);
        $response->assertStatus(200);

        // Assert that the status is now 'Withdraw Pending'
        $this->assertDatabaseHas('Request', [
            'Request_ID' => $request->Request_ID,
            'Status' => 'Withdraw Pending'
        ]);
    }

    /**
     * Test that does nothing when the status is 'Withdraw Pending'.
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_withdraw_pending_status_does_nothing(): void
    {
        // Create a request with 'Withdraw Pending' status
        $request = Requests::factory()->create([
            'Status' => 'Withdraw Pending',
        ]);

        $payload = [
            "Request_ID" => $request->Request_ID, 
            "Employee_ID" => $request->Requestor_ID,
            "Reason" => "Personal"
        ];

        // Attempt to withdraw and check the response
        $response = $this->postJson("/api/request/withdraw", $payload);
        $response->assertStatus(200);

        // Assert that the status is now 'Withdraw Pending'
        $this->assertDatabaseHas('Request', [
            'Request_ID' => $request->Request_ID,
            'Status' => 'Withdraw Pending'
        ]);
    }

    /**
     * Test that does nothing when the status is 'Withdrawn'.
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_withdrawn_status_does_nothing(): void
    {
        // Create a request with 'Withdrawn' status
        $request = Requests::factory()->create([
            'Status' => 'Withdrawn',
        ]);

        $payload = [
            "Request_ID" => $request->Request_ID, 
            "Employee_ID" => $request->Requestor_ID,
            "Reason" => "Personal"
        ];
        
        // Attempt to withdraw and check the response
        $response = $this->postJson("/api/request/withdraw", $payload);
        $response->assertStatus(200);

        // Assert that the status is still 'Withdrawn'
        $this->assertDatabaseHas('Request', [
            'Request_ID' => $request->Request_ID,
            'Status' => 'Withdrawn'
        ]);
    }
}
