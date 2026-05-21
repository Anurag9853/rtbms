<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Services\AIService;
use App\Models\User;

$user = User::where('email', 'admin@rtbms.in')->first();
$ai = app(AIService::class);
$generator = $ai->streamResponse("Hello, I am the admin. Please list the current active campaigns.", "test_session", $user);

foreach ($generator as $chunk) {
    echo $chunk;
}
