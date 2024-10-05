<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('Request', function (Blueprint $table) {
            $table->bigIncrements('Request_ID'); // Primary key
            $table->unsignedBigInteger('Requestor_ID'); // Foreign key for Requestor
            $table->unsignedBigInteger('Approver_ID'); // Foreign key for Approver
            // $table->string('Status'); // Status (consider using an enum or a separate table if necessary)
            $table->enum('Status', ['Pending', 'Approved', 'Rejected', 'Withdrawn', 'Withdraw Pending', 'Withdraw Rejected']); // Enum for new state
            $table->date('Date_Requested'); // Date Requested
            $table->unsignedBigInteger('Request_Batch')->nullable(); // Batch ID (nullable)
            $table->date('Date_Of_Request'); // Date of Request
            $table->string('Duration'); // Duration (consider the appropriate data type)

            // Foreign key constraints
            $table->foreign('Requestor_ID')->references('Staff_ID')->on('Employee');
            $table->foreign('Approver_ID')->references('Staff_ID')->on('Employee');

            // Timestamps
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('Request');
    }
};
