<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class RequestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Path to your SQL file
        $path = database_path('seeders/sql_data/Request.sql');

        // Check if the file exists
        if (File::exists($path)) {
            // Read the file and execute the SQL statements
            $sql = File::get($path);
            DB::unprepared($sql);
        }
    }
}
