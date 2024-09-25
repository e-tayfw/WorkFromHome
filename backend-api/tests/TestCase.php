<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    use CreatesApplication;

    protected function setUp(): void
    {
        parent::setUp();

        // Check for .env.testing file
        if (!file_exists(base_path('.env.testing'))) {
            throw new \RuntimeException('The .env.testing file is missing! Create it to run tests safely and avoid affecting production data.');
        }
    }
}
