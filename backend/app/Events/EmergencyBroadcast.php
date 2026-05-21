<?php

namespace App\Events;

use App\Models\BloodRequest;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Broadcast a critical blood emergency to all connected clients
 */
class EmergencyBroadcast implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public BloodRequest $request) {}

    public function broadcastOn(): Channel
    {
        return new Channel('emergencies');
    }

    public function broadcastAs(): string
    {
        return 'emergency.new';
    }

    public function broadcastWith(): array
    {
        return [
            '_id'            => (string) $this->request->_id,
            'blood_group'    => $this->request->blood_group,
            'units_needed'   => $this->request->units_needed,
            'urgency'        => $this->request->urgency,
            'hospital_name'  => $this->request->hospital_name,
            'hospital_city'  => $this->request->hospital_city,
            'patient_name'   => $this->request->patient_name,
            'created_at'     => optional($this->request->created_at)->toISOString() ?? now()->toISOString(),
        ];
    }
}
