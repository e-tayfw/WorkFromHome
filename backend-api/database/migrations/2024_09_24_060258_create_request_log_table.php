<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CreateRequestLogTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Drop the enum type if it exists
        DB::statement("DROP TYPE IF EXISTS status");

        // Create the enum type for status
        DB::statement("CREATE TYPE status AS ENUM ('Pending', 'Approved', 'Rejected', 'Withdrawn', 'Withdraw Pending', 'Withdraw Rejected')");

        Schema::create('RequestLog', function (Blueprint $table) {
            $table->bigIncrements('Log_ID'); // Auto-incrementing ID
            $table->bigInteger('Request_ID')->unsigned(); // Foreign key to Request
            $table->enum('Previous_State', ['Pending', 'Approved', 'Rejected', 'Withdrawn', 'Withdraw Pending', 'Withdraw Rejected']); // Enum for previous state
            $table->enum('New_State', ['Pending', 'Approved', 'Rejected', 'Withdrawn', 'Withdraw Pending', 'Withdraw Rejected']); // Enum for new state
            $table->bigInteger('Employee_ID')->unsigned(); // Foreign key to Employee
            $table->date('Date'); // Date field
            $table->string('Remarks')->nullable(); // Optional remarks

            // Foreign key constraints
            $table->foreign('Request_ID')->references('Request_ID')->on('Request')->onDelete('cascade');
            $table->foreign('Employee_ID')->references('Staff_ID')->on('Employee')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('RequestLog');
        DB::statement("DROP TYPE IF EXISTS status");
    }
}
