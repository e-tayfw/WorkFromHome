<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use DB;
use Log;
use Database\Seeders\EmployeeSeeder;

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
        // Get the database name
        $dbName = DB::connection()->getDatabaseName();

        // Log the database name for confirmation
        Log::info('Current database name: ' . $dbName);

        // Assert that it matches your expected testing database name
        $this->assertEquals('test_db', $dbName); 
    }

    /**
     * Test if the Employee table is created and contains the expected employee.
     * 
     * @depends test_database_is_test_db
     */
    public function test_employee_table_contains_jack(): void
    {
        // Check if the Employee table exists
        $this->assertTrue(DB::table('Employee')->exists(), 'Employee table does not exist.');

        // Check if the specific employee exists
        $employeeExists = DB::table('Employee')
            ->where('Email', 'jack.sim@allinone.com.sg')
            ->exists();

        // Assert that the employee exists in the table
        $this->assertTrue($employeeExists, 'Employee with email jack.sim@allinone.com.sg does not exist.');
    }
}
