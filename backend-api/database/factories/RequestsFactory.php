<?php

namespace Database\Factories;

use App\Models\Requests;
use App\Models\Employee; // Assuming this is the Employee model
use Illuminate\Database\Eloquent\Factories\Factory;

class RequestsFactory extends Factory
{
    protected $model = Requests::class;

    public function definition()
    {
        return [
            'Status' => $this->faker->randomElement(['Approved', 'Pending', 'Rejected', 'Withdrawn', 'Withdraw Rejected', 'Withdraw Pending']),
            'Date_Requested' => $this->faker->dateTimeBetween('+1 week', '+4 weeks'),
            'Requestor_ID' => Employee::inRandomOrder()->first()->Staff_ID, // Get a random employee as the requestor
            'Approver_ID' => Employee::inRandomOrder()->first()->Staff_ID,  // Get another random employee as the approver
            'Duration' => $this->faker->randomElement(['AM', 'PM', 'FD']),
            'Date_Of_Request' => $this->faker->dateTimeThisYear()
        ];
    }
}
