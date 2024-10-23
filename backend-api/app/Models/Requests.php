<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Requests extends Model
{
    use HasFactory;

    protected $table = 'Request';

    protected $primaryKey = 'Request_ID';

    public $incrementing = true; // Indicates that the primary key is auto-incrementing

    protected $guarded = [];

}
