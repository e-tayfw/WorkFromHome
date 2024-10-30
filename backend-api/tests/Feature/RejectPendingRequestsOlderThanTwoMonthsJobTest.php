<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Jobs\RejectPendingRequestsOlderThanTwoMonthsJob;
use App\Models\Requests; // Use the correct model name
use App\Models\RequestLog;
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
     */
    public function test_job_updates_status_from_pending_to_rejected_and_request_log_created(): void
    {
        // Step 1: Simulate a request created on 2023-03-01 (more than 2 months ago from 2023-06-01)
        $oldRequest = Requests::create([
            'Requestor_ID' => 140879,
            'Approver_ID' => 140001,
            'Status' => 'Pending',
            'Date_Requested' => '2023-03-01',
            'Date_Of_Request' => '2023-03-01',
            'Duration' => 'FD',
            'created_at' => '2023-03-01',
            'updated_at' => '2023-03-01',
        ]);

        // Step 2: Dispatch and manually process the job
        $job = new RejectPendingRequestsOlderThanTwoMonthsJob($oldRequest);
        $job->handle(); // Simulate job execution

        // Step 3: Assert that the status was updated to 'Rejected'
        $this->assertDatabaseHas('Request', [
            'Request_ID' => $oldRequest->Request_ID,
            'Status' => 'Rejected',
        ]);

        // Step 4: Get the most recent log entry and verify its attributes
        $recentLog = RequestLog::latest()->first();
        // Step 5: Assert that the log entry is for the correct request and has the correct employee ID
        $this->assertNotNull($recentLog); 
        $this->assertEquals($oldRequest->Request_ID, $recentLog->Request_ID);
        $this->assertEquals('000000', $recentLog->Employee_ID); 
        $this->assertEquals('Pending', $recentLog->Previous_State); 
        $this->assertEquals('Rejected', $recentLog->New_State); 
    }
}
