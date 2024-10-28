<?php

namespace Database\Factories;

use App\Models\Employee;
use Illuminate\Database\Eloquent\Factories\Factory;

class EmployeeFactory extends Factory
{
    protected $model = Employee::class;

    public function definition()
    {
        return [
            'Staff_ID' => $this->faker->unique()->numberBetween(1000, 9999), // Unique staff ID
            'Staff_FName' => $this->faker->firstName, // First name
            'Staff_LName' => $this->faker->lastName,  // Last name
            'Dept' => $this->faker->word, // Non-nullable department name
            'Position' => $this->faker->jobTitle, // Non-nullable job position
            'Country' => $this->faker->country, // Non-nullable country
            'Email' => $this->faker->unique()->safeEmail, // Non-nullable email
            'Reporting_Manager' => 222222, // Will be assigned dynamically in tests
            'Role' => $this->faker->randomElement([1, 2, 3]),
        ];
    }
}