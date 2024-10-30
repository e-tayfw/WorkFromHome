<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request as HttpRequest;
use Tests\TestCase;
use App\Models\Requests;
use App\Models\Employee;
use App\Http\Controllers\RequestController;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;


class ManagerWithdrawApprovedRequestTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
    }

    /**
     * Test to check if the database is the testing database.
     */
    public function test_database_is_test_db(): void
    {
        $dbName = DB::connection()->getDatabaseName();
        $this->assertStringContainsString('test_db', $dbName, 'The database name does not contain "test_db"');
    }

    /**
     * Test withdrawal on February 28 (non-leap year).
     */
    public function test_withdrawal_on_february_28_non_leap_year(): void
    {
        $referenceDate = Carbon::create(2023, 3, 1);  // Non-leap year
        $bookingDate = '2023-02-28';

        echo "\n--------------------------------------------------\n";
        echo "Test Case: Withdrawal on February 28, Non-Leap Year\n";

        $this->performControllerTest($bookingDate, $referenceDate, true);
    }
    /**
     * Test withdrawal within the 1-month back boundary.
     */
    public function test_withdrawal_within_1_month_back_boundary(): void
    {
        $referenceDate = Carbon::create(2024, 10, 25);  // Simulated "today's" date
        $bookingDate = $referenceDate->copy()->addMonth()->subDay(1)->toDateString();  // 2024-11-24

        echo "\n--------------------------------------------------\n";
        echo "Test Case: Within 1 Month Back Boundary\n";
        echo "Reference Date: " . $referenceDate->toDateString() . "\n";
        echo "Booking Date: " . $bookingDate . "\n";

        // Expect withdrawal to succeed since it's on the boundary
        $this->performControllerTest($bookingDate, $referenceDate, true);
    }

    /**
     * Test withdrawal on the 1-month back boundary.
     */
    public function test_withdrawal_on_1_month_back_boundary(): void
    {
        $referenceDate = Carbon::create(2024, 10, 25);  // Simulated "today's" date
        $bookingDate = $referenceDate->copy()->addMonth()->toDateString();  // 2024-11-25

        echo "\n--------------------------------------------------\n";
        echo "Test Case: 1 Month Back Boundary\n";
        echo "Reference Date: " . $referenceDate->toDateString() . "\n";
        echo "Booking Date: " . $bookingDate . "\n";

        // Expect withdrawal to succeed since it's on the boundary
        $this->performControllerTest($bookingDate, $referenceDate, true);
    }

    /**
     * Test withdrawal beyond the 1-month back boundary.
     */
    public function test_withdrawal_beyond_1_month_back(): void
    {
        $referenceDate = Carbon::create(2024, 10, 25);  // Simulated "today's" date
        $bookingDate = $referenceDate->copy()->addMonth()->addDay(1)->toDateString();  // 2024-11-26

        echo "\n--------------------------------------------------\n";
        echo "Test Case: Beyond 1 Month Back\n";
        echo "Reference Date: " . $referenceDate->toDateString() . "\n";
        echo "Booking Date: " . $bookingDate . "\n";

        // Expect withdrawal to fail since it's beyond the 1-month back boundary
        $this->performControllerTest($bookingDate, $referenceDate, false);
    }

    /**
     * Test withdrawal within the 3-month forward boundary.
     */
    public function test_withdrawal_within_3_months_forward_boundary(): void
    {
        $referenceDate = Carbon::create(2024, 10, 25);
        $bookingDate = $referenceDate->copy()->subMonthsNoOverflow(3)->addDay(2)->toDateString();  // 2024-07-27

        echo "\n--------------------------------------------------\n";
        echo "Test Case: Within 3 Months Forward Boundary\n";
        echo "Reference Date (Today): " . $referenceDate->toDateString() . "\n";
        echo "Booking Date: " . $bookingDate . "\n";

        $this->performControllerTest($bookingDate, $referenceDate, true);
    }

    /**
     * Test withdrawal on the 3-month forward boundary.
     */
    public function test_withdrawal_on_3_months_forward_boundary(): void
    {
        $referenceDate = Carbon::create(2024, 10, 25);
        $bookingDate = $referenceDate->copy()->subMonthsNoOverflow(3)->addDay()->toDateString();  // 2024-07-26

        echo "\n--------------------------------------------------\n";
        echo "Test Case: 3 Months Forward Boundary\n";
        echo "Reference Date (Today): " . $referenceDate->toDateString() . "\n";
        echo "Booking Date: " . $bookingDate . "\n";

        $this->performControllerTest($bookingDate, $referenceDate, true);
    }

    /**
     * Test withdrawal beyond the 3-month forward boundary.
     */
    public function test_withdrawal_beyond_3_months_forward(): void
    {
        $referenceDate = Carbon::create(2024, 10, 25);
        $bookingDate = $referenceDate->copy()->subMonthsNoOverflow(3)->toDateString();  // 2024-07-25

        echo "\n--------------------------------------------------\n";
        echo "Test Case: Beyond 3 Months Forward\n";
        echo "Expected Booking Date: " . $bookingDate . "\n";

        $this->performControllerTest($bookingDate, $referenceDate, false);
    }

    /**
     * Test unauthorized manager withdrawal.
     */
    public function test_unauthorized_manager_withdrawal(): void
    {
        $authorizedManager = Employee::factory()->create(['Staff_ID' => 222222, 'Role' => 1]);
        $unauthorizedManager = Employee::factory()->create(['Staff_ID' => 5678, 'Role' => 1]);
        $employee = Employee::factory()->create(['Reporting_Manager' => $authorizedManager->Staff_ID]);

        $request = Requests::factory()->create([
            'Requestor_ID' => $employee->Staff_ID,
            'Status' => 'Approved',
            'Date_Requested' => '2023-03-31'
        ]);

        $httpRequest = new HttpRequest([
            'Manager_ID' => $unauthorizedManager->Staff_ID,
            'Request_ID' => $request->Request_ID,
            'Reason' => 'Testing Reason'
        ]);

        echo "\n--------------------------------------------------\n";
        echo "Test Case: Unauthorized Manager Withdrawal\n";

        $controller = new RequestController();
        $response = $controller->managerWithdrawBooking($httpRequest);

        $this->assertEquals(403, $response->getStatusCode());
    }

    /**
     * Test withdrawal for the same-day request.
     */
    public function test_withdrawal_on_same_day(): void
    {
        $referenceDate = Carbon::create(2023, 3, 31);

        echo "\n--------------------------------------------------\n";
        echo "Test Case: Withdrawal on Same Day\n";

        $this->performControllerTest($referenceDate->toDateString(), $referenceDate, true);
    }

    /**
     * Helper to perform controller tests with real values.
     */
    private function performControllerTest(
        string $bookingDate,
        Carbon $referenceDate,
        bool $expectedSuccess
    ): void {
        $manager = Employee::factory()->create(['Staff_ID' => 222222, 'Role' => 1]);
        $employee = Employee::factory()->create(['Reporting_Manager' => $manager->Staff_ID]);

        $request = Requests::factory()->create([
            'Requestor_ID' => $employee->Staff_ID,
            'Status' => 'Approved',
            'Date_Requested' => $bookingDate
        ]);

        $httpRequest = new HttpRequest([
            'Manager_ID' => $manager->Staff_ID,
            'Request_ID' => $request->Request_ID,
            'Reason' => 'Testing Reason'
        ]);

        $controller = new RequestController();
        $response = $controller->managerWithdrawBooking($httpRequest, $referenceDate);

        $expectedStatusCode = $expectedSuccess ? 200 : 400;

        echo "Expected Status Code: " . $expectedStatusCode . "\n";
        echo "Actual Status Code: " . $response->getStatusCode() . "\n";

        $this->assertEquals($expectedStatusCode, $response->getStatusCode());
    }
}
