<?php

namespace App\Events;

use App\Models\BloodRequest;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RequestStatusChanged implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public BloodRequest $request) {}

    public function broadcastOn(): PrivateChannel
    {
        return new PrivateChannel("user.{$this->request->requester_id}");
    }

    public function broadcastAs(): string
    {
        return 'request.status_changed';
    }

    public function broadcastWith(): array
    {
        return [
            'request_id' => (string) $this->request->_id,
            'status'     => $this->request->status,
            'updated_at' => optional($this->request->updated_at)->toISOString() ?? now()->toISOString(),
        ];
    }
}
