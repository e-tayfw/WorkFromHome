<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Carbon\Carbon;
use App\Models\Requests;
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
        $twoMonthsAgo = Carbon::now()->subMonths(2)->startOfDay();
        // Check if the request is still 'Pending' and older than or exactly 2 months
        if ($this->requests->Status === 'Pending' && $this->requests->Date_Of_Request <= $twoMonthsAgo) {
            $this->requests->update(['Status' => 'Rejected']);
        } else {
            // Remove the job from the queue if it's not 'Pending' status after 2 months
            $this->delete();
        }
    }
    
}
