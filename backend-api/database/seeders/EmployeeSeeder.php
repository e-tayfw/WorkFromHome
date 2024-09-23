<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class EmployeeSeeder extends Seeder
{
    public function run()
    {
        // Path to your SQL file
        $path = database_path('seeders/sql_data/Employee.sql');

        // Check if the file exists
        if (File::exists($path)) {
            // Read the file and execute the SQL statements
            $sql = File::get($path);
            DB::unprepared($sql);
        }
    }
}
