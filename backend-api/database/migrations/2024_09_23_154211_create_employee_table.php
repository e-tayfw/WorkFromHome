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
        Schema::create('Employee', function (Blueprint $table) {
            $table->bigIncrements('Staff_ID'); // Primary key
            $table->string('Staff_FName'); // First Name
            $table->string('Staff_LName'); // Last Name
            $table->string('Dept'); // Department
            $table->string('Position'); // Position
            $table->string('Country'); // Country
            $table->string('Email')->unique(); // Email
            $table->unsignedBigInteger('Reporting_Manager'); // Foreign key
            $table->integer('Role'); // Role

            // Foreign key constraint
            $table->foreign('Reporting_Manager')->references('Staff_ID')->on('Employee');

            // Timestamps
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('Employee');
    }
};
