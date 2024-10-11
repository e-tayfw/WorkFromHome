<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Jobs\RejectPendingRequestsOlderThanTwoMonthsJob;
use App\Models\Requests; // Use the correct model name
use Database\Seeders\EmployeeSeeder;
use Carbon\Carbon;
use DB;

class RejectPendingRequestsOlderThanTwoMonthsJobTest extends TestCase
{
    use RefreshDatabase; // This will reset the database for each test

    protected function setUp(): void
    {
        parent::setUp();

        // Seed the Employee data
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
     * Test if the job updates the request status to 'Rejected' for requests pending for more than two months.
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_job_updates_status_from_pending_to_rejected_for_requests_older_than_two_months(): void
    {
        // Step 1: Simulate a request that is already 3 months old
        $oldRequest = Requests::create([
            'Requestor_ID' => 140879,        // Simulated data
            'Approver_ID' => 140001,         // Simulated data
            'Status' => 'Pending',           // Initial status as 'Pending'
            'Date_Requested' => Carbon::now()->subMonths(3), // Request made 3 months ago
            'Date_Of_Request' => Carbon::now()->subMonths(3), // Date of request 3 months ago
            'Duration' => 'FD',              // Some value for duration
            'created_at' => Carbon::now()->subMonths(3),
            'updated_at' => Carbon::now()->subMonths(3),
        ]);

        // Step 2: Dispatch the job for that request
        RejectPendingRequestsOlderThanTwoMonthsJob::dispatch($oldRequest);

        // Step 3: Run the handle method manually to simulate processing the job
        $job = new RejectPendingRequestsOlderThanTwoMonthsJob($oldRequest);
        $job->handle(); // Simulate job execution

        // Step 4: Assert that the status was updated to 'Rejected'
        $this->assertDatabaseHas('Request', [
            'Request_ID' => $oldRequest->Request_ID,
            'Status' => 'Rejected', // Check if the status was updated
        ]);
    }

    /**
     * Test if the job updates the request status for requests exactly two months old.
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_job_updates_status_from_pending_to_rejected_for_requests_exactly_two_months_old(): void
    {
        // Step 1: Simulate a request that is exactly 2 months old
        $exactlyTwoMonthsOldRequest = Requests::create([
            'Requestor_ID' => 140879,
            'Approver_ID' => 140001,
            'Status' => 'Pending',
            'Date_Requested' => Carbon::now()->subMonths(2),
            'Date_Of_Request' => Carbon::now()->subMonths(2),
            'Duration' => 'FD',
            'created_at' => Carbon::now()->subMonths(2),
            'updated_at' => Carbon::now()->subMonths(2),
        ]);

        // Step 2: Dispatch the job for that request
        RejectPendingRequestsOlderThanTwoMonthsJob::dispatch($exactlyTwoMonthsOldRequest);

        // Step 3: Run the handle method manually to simulate processing the job
        $job = new RejectPendingRequestsOlderThanTwoMonthsJob($exactlyTwoMonthsOldRequest);
        $job->handle();

        // Step 4: Assert that the status was updated to 'Rejected'
        $this->assertDatabaseHas('Request', [
            'Request_ID' => $exactlyTwoMonthsOldRequest->Request_ID,
            'Status' => 'Rejected',
        ]);
    }

    /**
     * Test if the job does not update the request status for requests less than two months old.
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_job_does_not_update_status_for_requests_less_than_two_months_old(): void
    {
        // Step 1: Simulate a request that is only 1 month old
        $recentRequest = Requests::create([
            'Requestor_ID' => 140879,
            'Approver_ID' => 140001,
            'Status' => 'Pending',
            'Date_Requested' => Carbon::now()->subMonth(1),
            'Date_Of_Request' => Carbon::now()->subMonth(1),
            'Duration' => 'FD',
            'created_at' => Carbon::now()->subMonth(1),
            'updated_at' => Carbon::now()->subMonth(1),
        ]);

        // Step 2: Dispatch the job for that request
        RejectPendingRequestsOlderThanTwoMonthsJob::dispatch($recentRequest);

        // Step 3: Run the handle method manually to simulate processing the job
        $job = new RejectPendingRequestsOlderThanTwoMonthsJob($recentRequest);
        $job->handle(); // Simulate job execution

        // Step 4: Assert that the status was not updated (should remain 'Pending')
        $this->assertDatabaseHas('Request', [
            'Request_ID' => $recentRequest->Request_ID,
            'Status' => 'Pending', // Status should remain 'Pending'
        ]);
    }

    /**
     * Test if the job is removed when the request status is not 'Pending' after 2 months.
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_job_is_removed_if_request_status_is_not_pending_after_two_months(): void
    {
        // Step 1: Simulate a request that is 3 months old and not pending
        $requestNotPending = Requests::create([
            'Requestor_ID' => 140879, // Simulated data
            'Approver_ID' => 140001,  // Simulated data
            'Status' => 'Approved',    // Status is not 'Pending'
            'Date_Requested' => Carbon::now()->subMonths(3), // Request made 3 months ago
            'Date_Of_Request' => Carbon::now()->subMonths(3), // Date of request 3 months ago
            'Duration' => 'FD',        // Some value for duration
            'created_at' => Carbon::now()->subMonths(3),
            'updated_at' => Carbon::now()->subMonths(3),
        ]);

        // Step 2: Dispatch the job for that request
        RejectPendingRequestsOlderThanTwoMonthsJob::dispatch($requestNotPending);

        // Step 3: Run the handle method manually to simulate processing the job
        $job = new RejectPendingRequestsOlderThanTwoMonthsJob($requestNotPending);
        $job->handle(); // Simulate job execution

        // Step 4: Assert that the job has been removed from the jobs table
        $this->assertDatabaseMissing('jobs', [
            'payload' => json_encode(serialize($job)), // Adapt this to your serialization method if needed
        ]);
    }
}
