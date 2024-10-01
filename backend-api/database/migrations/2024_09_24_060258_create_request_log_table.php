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
        Schema::create('RequestLog', function (Blueprint $table) {
            $table->bigIncrements('Log_ID'); // Auto-incrementing ID
            $table->bigInteger('Request_ID')->unsigned(); // Foreign key to Request
            $table->bigInteger('Employee_ID')->unsigned(); // Foreign key to Employee
            $table->enum('Previous_State', ['Pending', 'Approved', 'Rejected', 'Withdrawn', 'Withdraw Pending', 'Withdraw Rejected']); // Enum for previous state
            $table->enum('New_State', ['Pending', 'Approved', 'Rejected', 'Withdrawn', 'Withdraw Pending', 'Withdraw Rejected']); // Enum for new state
            $table->date('Date'); // Date field
            $table->string('Remarks')->nullable(); // Optional remarks

            // Foreign key constraints
            $table->foreign('Request_ID')->references('Request_ID')->on('Request')->onDelete('cascade');
            $table->foreign('Employee_ID')->references('Staff_ID')->on('Employee')->onDelete('cascade');

            // Timestamps
            $table->timestamps();
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
    }
}
