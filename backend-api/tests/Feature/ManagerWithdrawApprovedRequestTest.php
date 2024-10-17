<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request as HttpRequest;
use Tests\TestCase;
use App\Models\Requests;
use App\Models\Employee;
use App\Http\Controllers\RequestController;
use Carbon\Carbon;
use DB;

class ManagerWithdrawApprovedRequestTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(); // Seed necessary data for the tests
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
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_withdrawal_on_february_28_non_leap_year(): void
    {
        $referenceDate = Carbon::create(2024, 3, 1);
        echo "\n--------------------------------------------------\n";
        echo "Test Case: Withdrawal on February 28, Non-Leap Year\n";

        $this->performControllerTest('2024-02-28', $referenceDate, true);
    }

    /**
     * Test withdrawal on the 1-month back boundary.
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_withdrawal_on_1_month_back_boundary(): void
    {
        $referenceDate = Carbon::create(2024, 3, 31);
        $bookingDate = $referenceDate->copy()->subMonthNoOverflow();

        echo "\n--------------------------------------------------\n";
        echo "Test Case: 1 Month Back Boundary\n";
        echo "Expected Booking Date: " . $bookingDate->toDateString() . "\n";

        $this->performControllerTest($bookingDate->toDateString(), $referenceDate, true);
    }

    /**
     * Test withdrawal beyond the 1-month back boundary.
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_withdrawal_beyond_1_month_back(): void
    {
        $referenceDate = Carbon::now();
        $bookingDate = $referenceDate->copy()->subMonthNoOverflow()->subDay();

        echo "\n--------------------------------------------------\n";
        echo "Test Case: Beyond 1 Month Back\n";
        echo "Expected Booking Date: " . $bookingDate->toDateString() . "\n";

        $this->performControllerTest($bookingDate->toDateString(), $referenceDate, false);
    }

    /**
     * Test withdrawal on the 3-month forward boundary.
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_withdrawal_on_3_months_forward_boundary(): void
    {
        $referenceDate = Carbon::now();
        $bookingDate = $referenceDate->copy()->addMonthsNoOverflow(3)->subDay();

        echo "\n--------------------------------------------------\n";
        echo "Test Case: 3 Months Forward Boundary\n";
        echo "Expected Booking Date: " . $bookingDate->toDateString() . "\n";

        $this->performControllerTest($bookingDate->toDateString(), $referenceDate, true);
    }

    /**
     * Test withdrawal beyond the 3-month forward boundary.
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_withdrawal_beyond_3_months_forward(): void
    {
        $referenceDate = Carbon::now();
        $bookingDate = $referenceDate->copy()->addMonthsNoOverflow(3);

        echo "\n--------------------------------------------------\n";
        echo "Test Case: Beyond 3 Months Forward\n";
        echo "Expected Booking Date: " . $bookingDate->toDateString() . "\n";

        $this->performControllerTest($bookingDate->toDateString(), $referenceDate, false);
    }

    /**
     * Test unauthorized manager withdrawal.
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_unauthorized_manager_withdrawal(): void
    {
        $authorizedManager = Employee::factory()->create(['Staff_ID' => 222222, 'Role' => 1]);
        $unauthorizedManager = Employee::factory()->create(['Staff_ID' => 5678, 'Role' => 1]);
        $employee = Employee::factory()->create(['Reporting_Manager' => $authorizedManager->Staff_ID]);

        $request = Requests::factory()->create([
            'Requestor_ID' => $employee->Staff_ID,
            'Status' => 'Approved',
            'Date_Requested' => Carbon::now()->format('Y-m-d')
        ]);

        $httpRequest = new HttpRequest([
            'Manager_ID' => $unauthorizedManager->Staff_ID,
            'Request_ID' => $request->Request_ID
        ]);

        echo "\n--------------------------------------------------\n";
        echo "Test Case: Unauthorized Manager Withdrawal\n";

        $controller = new RequestController();
        $response = $controller->managerWithdrawBooking($httpRequest);

        $this->assertEquals(403, $response->getStatusCode());
    }

    /**
     * Test withdrawal for same-day request.
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_withdrawal_on_same_day(): void
    {
        $referenceDate = Carbon::now();
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
            'Request_ID' => $request->Request_ID
        ]);

        $controller = new RequestController();
        $response = $controller->managerWithdrawBooking($httpRequest, $referenceDate);

        $expectedStatusCode = $expectedSuccess ? 200 : 400;

        echo "Booking Date: " . $bookingDate . "\n";
        echo "Reference Date: " . $referenceDate->toDateString() . "\n";
        echo "Expected Status Code: " . $expectedStatusCode . "\n";
        echo "Actual Status Code: " . $response->getStatusCode() . "\n";

        $this->assertEquals($expectedStatusCode, $response->getStatusCode());
    }
}
