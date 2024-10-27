<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Employee>
 */
class EmployeeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            //'Staff_ID' => $this->faker->unique()->numberBetween(130000, 150000), // Unique ID in range
            'Staff_FName' => $this->faker->firstName, // Random first name
            'Staff_LName' => $this->faker->lastName, // Random last name
            'Dept' => $this->faker->randomElement(['Sales', 'HR', 'IT', 'Finance']), // Random department
            'Position' => $this->faker->randomElement(['Account Manager', 'Director', 'Sales Manager', 'MD', 'Developer']), // Random position
            'Country' => 'Singapore', // Static value based on screenshot
            'Email' => $this->faker->unique()->email, // Unique email
            'Reporting_Manager' => $this->faker->randomElement([130002, 140001, 140894]), // Manager IDs from data
            'Role' => $this->faker->numberBetween(1, 3), // Random role between 1 and 3
            'created_at' => now(), // Current timestamp
            'updated_at' => now(), // Current timestamp
        ];
    }
}
