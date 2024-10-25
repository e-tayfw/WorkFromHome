<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Log;
use Database\Seeders\EmployeeSeeder;
use Illuminate\Support\Facades\DB;

class EmployeeTest extends TestCase
{
    use RefreshDatabase; // Use the RefreshDatabase trait

    protected function setUp(): void
    {
        parent::setUp();

        // Seed the database
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
     * Test if the API returns a 200 for a existing employee ID.
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_get_employee_by_id_returns_200_for_existing_employee_id(): void
    {
        // Make a GET request to the API endpoint with a valid employee ID (130002)
        $response = $this->getJson('/api/employee/id/130002');
    
        // Assert that the response status is 200 (OK)
        $response->assertStatus(200);
    }

    /**
     * Test if the API returns a 404 for a non-existing employee ID.
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_get_employee_by_id_returns_404_for_non_existing_employee_id(): void
    {
        // Send a GET request to a non-existing employee ID
        $response = $this->getJson('/api/employee/id/999999');

        // Assert that the response status is 404 (Not Found)
        $response->assertStatus(404);
    }

    /**
     * Test if the API returns a validation error for an invalid employee ID.
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_get_employee_by_id_returns_422_for_invalid_id(): void
    {
        // Send a GET request with an invalid ID (e.g., a string instead of an integer)
        $response = $this->getJson('/api/employee/id/hello');

        // Assert that the response status is 422 (Unprocessable Entity) due to validation
        $response->assertStatus(422);
    }

    /**
     * Test if the API returns 200 for an existing employee email.
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_get_employee_by_email_returns_200_for_existing_email(): void
    {
        // Check if the Employee table exists
        $this->assertTrue(DB::table('Employee')->exists(), 'Employee table does not exist.');

        // Check if the specific employee exists
        $employeeExists = DB::table('Employee')
            ->where('Email', 'jack.sim@allinone.com.sg')
            ->exists();

        // Assert that the employee exists in the table
        $this->assertTrue($employeeExists, 'Employee with email jack.sim@allinone.com.sg does exist.');

        // Send a GET request to the API endpoint with a valid email
        $response = $this->getJson('/api/employee/email/jack.sim@allinone.com.sg');

        // Assert that the response status is 200 (OK)
        $response->assertStatus(200);
    }

    /**
     * Test if the API returns a 404 for a non-existing employee email.
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_get_employee_by_email_returns_404_for_non_existing_email(): void
    {
        // Send a GET request to a non-existing email
        $response = $this->getJson('/api/employee/email/nonexistent@allinone.com.sg');

        // Assert that the response status is 404 (Not Found)
        $response->assertStatus(404);
    }


    /**
     * Test if the API returns a validation error for an invalid email format.
     * 
     * #[Depends('test_database_is_test_db')]
     */
    public function test_get_employee_by_email_returns_422_for_invalid_email_format(): void
    {
        // Send a GET request with an invalid email format
        $response = $this->getJson('/api/employee/email/invalid-email-1234');

        // Assert that the response status is 422 (Unprocessable Entity) due to validation
        $response->assertStatus(422);
    }
}
