<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use App\Models\Requests;
use App\Models\RequestLog;
use Exception;
use Log;

class RejectPendingRequestsOlderThanTwoMonthsJob implements ShouldQueue
{
    use Queueable;

    public $requests;

    /**
     * Create a new job instance.
     */
    public function __construct(Requests $request)
    {
        $this->requests = $request;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {   
        try {
            // If the request is still 'Pending', reject it
            if ($this->requests->Status === 'Pending') {
                $this->requests->update(['Status' => 'Rejected']);

                // Log the status change in RequestLog
                RequestLog::create([
                    'Request_ID' => $this->requests->Request_ID,
                    'Previous_State' => 'Pending',
                    'New_State' => 'Rejected',
                    'Employee_ID' => '000000', 
                    'Date' => now(),
                    'Remarks' => 'Automatic Rejection',
                ]);
            }
        } catch (Exception $e) {
            // Log any exceptions for debugging purposes
            Log::error('Failed to reject request: ' . $e->getMessage());
        }
    }
}
