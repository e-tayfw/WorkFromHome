<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;

class TestScheduleController extends Controller
{
    public function getSchedule(): JsonResponse
    {
        // Hardcoded JSON data
        $schedule = [
        "schedule" => [
            // Two months back from 180924
            "180724" => 1,
            "190724" => 3,
            "200724" => 2,
            "210724" => 0,
            "220724" => 3,
            "230724" => 1,
            "240724" => 2,
            "250724" => 0,
            "260724" => 1,
            "270724" => 3,
            "280724" => 2,
            "290724" => 1,
            "300724" => 0,
            "310724" => 2,
            "010824" => 3,
            "020824" => 1,
            "030824" => 0,
            "040824" => 2,
            "050824" => 1,
            "060824" => 3,
            "070824" => 0,
            "080824" => 2,
            "090824" => 1,
            "100824" => 3,
            "110824" => 0,
            "120824" => 2,
            "130824" => 1,
            "140824" => 3,
            "150824" => 0,
            "160824" => 2,
            "170824" => 1,

            // From 180924 onward (starting date)
            "180924" => 3,
            "190924" => 0,
            "200924" => 2,
            "210924" => 1,
            "220924" => 3,
            "230924" => 2,
            "240924" => 0,
            "250924" => 1,
            "260924" => 2,
            "270924" => 3,
            "280924" => 1,
            "290924" => 0,
            "300924" => 2,

            // October 2024
            "011024" => 1,
            "021024" => 0,
            "031024" => 3,
            "041024" => 2,
            "051024" => 1,
            "061024" => 0,
            "071024" => 3,
            "081024" => 2,
            "091024" => 1,
            "101024" => 0,
            "111024" => 3,
            "121024" => 2,
            "131024" => 1,
            "141024" => 0,
            "151024" => 3,
            "161024" => 2,
            "171024" => 1,
            "181024" => 0,
            "191024" => 3,
            "201024" => 2,
            "211024" => 1,
            "221024" => 0,
            "231024" => 3,
            "241024" => 2,
            "251024" => 1,
            "261024" => 0,
            "271024" => 3,
            "281024" => 2,
            "291024" => 1,
            "301024" => 0,

            // November 2024
            "011124" => 3,
            "021124" => 2,
            "031124" => 1,
            "041124" => 0,
            "051124" => 3,
            "061124" => 2,
            "071124" => 1,
            "081124" => 0,
            "091124" => 3,
            "101124" => 2,
            "111124" => 1,
            "121124" => 0,
            "131124" => 3,
            "141124" => 2,
            "151124" => 1,
            "161124" => 0,
            "171124" => 3,
            "181124" => 2,
            "191124" => 1,
            "201124" => 0,
            "211124" => 3,
            "221124" => 2,
            "231124" => 1,
            "241124" => 0,
            "251124" => 3,
            "261124" => 2,
            "271124" => 1,
            "281124" => 0,
            "291124" => 3,
            "301124" => 2,

            // December 2024 (until 181224)
            "011224" => 1,
            "021224" => 0,
            "031224" => 3,
            "041224" => 2,
            "051224" => 1,
            "061224" => 0,
            "071224" => 3,
            "081224" => 2,
            "091224" => 1,
            "101224" => 0,
            "111224" => 3,
            "121224" => 2,
            "131224" => 1,
            "141224" => 0,
            "151224" => 3,
            "161224" => 2,
            "171224" => 1,
            "181224" => 0,
        ]
    ];


        return response()->json($schedule);
    }
}
