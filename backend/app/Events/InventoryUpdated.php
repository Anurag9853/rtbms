<?php

namespace App\Events;

use App\Models\BloodInventory;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Broadcast when blood inventory changes — triggers live UI updates
 */
class InventoryUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public BloodInventory $inventory) {}

    public function broadcastOn(): Channel
    {
        return new Channel('inventory');
    }

    public function broadcastAs(): string
    {
        return 'inventory.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'blood_group'      => $this->inventory->blood_group,
            'units_available'  => $this->inventory->units_available,
            'status'           => $this->inventory->status,
            'blood_bank_id'    => $this->inventory->blood_bank_id,
            'last_updated_at'  => $this->inventory->updated_at?->toISOString(),
        ];
    }
}
