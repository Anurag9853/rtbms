<?php

namespace Database\Seeders;

use App\Models\BloodBank;
use App\Models\BloodInventory;
use App\Models\BloodRequest;
use App\Models\Campaign;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * DemoSeeder — Creates a complete set of realistic demo data for RTBMS.
 *
 * Run with: php artisan db:seed --class=DemoSeeder
 * Or reset + seed: php artisan migrate:fresh --seed
 */
class DemoSeeder extends Seeder
{
    private array $bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

    public function run(): void
    {
        $this->command->info('🩸 Seeding RTBMS demo data...');

        $this->seedUsers();
        $this->seedBloodBanks();
        $this->seedInventory();
        $this->seedRequests();
        $this->seedCampaigns();

        $this->command->info('✅ Demo data seeded successfully!');
    }

    // ── Users ────────────────────────────────────────────────────────────────

    private function seedUsers(): void
    {
        $this->command->info('  → Seeding users...');

        $users = [
            [
                'name'        => 'RTBMS Admin',
                'email'       => 'admin@rtbms.in',
                'password'    => Hash::make('password'),
                'role'        => 'admin',
                'phone'       => '+91-11-0000-0000',
                'city'        => 'Delhi',
                'is_available'=> true,
            ],
            [
                'name'        => 'Dr. Priya Sharma',
                'email'       => 'priya@aiims.edu',
                'password'    => Hash::make('password'),
                'role'        => 'hospital',
                'phone'       => '+91-11-2658-8500',
                'city'        => 'Delhi',
                'is_available'=> true,
            ],
            [
                'name'        => 'Rahul Sharma',
                'email'       => 'rahul@donor.in',
                'password'    => Hash::make('password'),
                'role'        => 'donor',
                'phone'       => '+91-98765-43210',
                'city'        => 'Delhi',
                'blood_group' => 'O+',
                'is_available'=> true,
            ],
            [
                'name'        => 'Ananya Gupta',
                'email'       => 'ananya@donor.in',
                'password'    => Hash::make('password'),
                'role'        => 'donor',
                'phone'       => '+91-99887-76655',
                'city'        => 'Mumbai',
                'blood_group' => 'A-',
                'is_available'=> false,
            ],
            [
                'name'        => 'Vikram Singh',
                'email'       => 'vikram@donor.in',
                'password'    => Hash::make('password'),
                'role'        => 'donor',
                'phone'       => '+91-88776-65544',
                'city'        => 'Bangalore',
                'blood_group' => 'B+',
                'is_available'=> true,
            ],
            [
                'name'        => 'Fortis Hospital Admin',
                'email'       => 'admin@fortis.com',
                'password'    => Hash::make('password'),
                'role'        => 'hospital',
                'phone'       => '+91-11-4277-6222',
                'city'        => 'Gurgaon',
                'is_available'=> true,
            ],
            [
                'name'        => 'AIIMS Blood Bank Admin',
                'email'       => 'blood@aiims.edu',
                'password'    => Hash::make('password'),
                'role'        => 'blood_bank',
                'phone'       => '+91-11-2658-8700',
                'city'        => 'Delhi',
                'is_available'=> true,
            ],
        ];

        foreach ($users as $userData) {
            $user = User::firstOrCreate(['email' => $userData['email']], $userData);
            try {
                $user->assignRole($userData['role']);
            } catch (\Exception) {
                // Spatie roles may not be set up — skip
            }
        }

        $this->command->line("    Created " . count($users) . " users");
    }

    // ── Blood Banks ──────────────────────────────────────────────────────────

    private function seedBloodBanks(): void
    {
        $this->command->info('  → Seeding blood banks...');

        $banks = [
            [
                'name'            => 'AIIMS Blood Bank',
                'city'            => 'Delhi',
                'state'           => 'Delhi',
                'address'         => 'Ansari Nagar East, New Delhi, Delhi 110029',
                'contact_phone'   => '+91-11-2658-8700',
                'contact_email'   => 'blood@aiims.edu',
                'is_active'       => true,
                'hours'           => ['is_24hr' => true],
                'location'        => ['type' => 'Point', 'coordinates' => [77.2090, 28.5672]],
            ],
            [
                'name'            => 'Sir Ganga Ram Hospital Blood Bank',
                'city'            => 'Delhi',
                'state'           => 'Delhi',
                'address'         => 'Rajinder Nagar, New Delhi, Delhi 110060',
                'contact_phone'   => '+91-11-2575-0000',
                'contact_email'   => 'blood@sgrh.com',
                'is_active'       => true,
                'hours'           => ['is_24hr' => true],
                'location'        => ['type' => 'Point', 'coordinates' => [77.1853, 28.6435]],
            ],
            [
                'name'            => 'Fortis Vasant Kunj Blood Bank',
                'city'            => 'Delhi',
                'state'           => 'Delhi',
                'address'         => 'Sector B, Pocket 1, Aruna Asaf Ali Marg, New Delhi',
                'contact_phone'   => '+91-11-4277-6222',
                'contact_email'   => 'blood@fortis.com',
                'is_active'       => true,
                'hours'           => ['is_24hr' => false, 'open' => '8am', 'close' => '8pm'],
                'location'        => ['type' => 'Point', 'coordinates' => [77.1581, 28.5216]],
            ],
            [
                'name'            => 'Max Super Specialty Hospital Blood Bank',
                'city'            => 'Delhi',
                'state'           => 'Delhi',
                'address'         => '1, Press Enclave Marg, Saket, New Delhi',
                'contact_phone'   => '+91-11-2651-5050',
                'contact_email'   => 'blood@maxhealthcare.in',
                'is_active'       => true,
                'hours'           => ['is_24hr' => true],
                'location'        => ['type' => 'Point', 'coordinates' => [77.2190, 28.5275]],
            ],
        ];

        foreach ($banks as $bankData) {
            BloodBank::firstOrCreate(['name' => $bankData['name']], $bankData);
        }

        $this->command->line("    Created " . count($banks) . " blood banks");
    }

    // ── Blood Inventory ──────────────────────────────────────────────────────

    private function seedInventory(): void
    {
        $this->command->info('  → Seeding inventory...');

        $banks = BloodBank::all();
        $count = 0;

        foreach ($banks as $bank) {
            foreach ($this->bloodGroups as $group) {
                // Simulate realistic inventory distribution
                $base = match ($group) {
                    'O+'  => rand(30, 55),
                    'A+'  => rand(20, 35),
                    'B+'  => rand(15, 30),
                    'AB+' => rand(8, 18),
                    'O-'  => rand(2, 8),   // universally rare
                    'A-'  => rand(4, 10),
                    'B-'  => rand(2, 7),
                    'AB-' => rand(1, 4),
                    default => rand(5, 20),
                };

                BloodInventory::firstOrCreate(
                    ['blood_bank_id' => $bank->_id ?? $bank->id, 'blood_group' => $group],
                    [
                        'blood_bank_id'     => $bank->_id ?? $bank->id,
                        'blood_group'       => $group,
                        'units_available'   => $base,
                        'units_reserved'    => 0,
                        'minimum_threshold' => 10,
                        'last_updated_at'   => now(),
                    ]
                );
                $count++;
            }
        }

        $this->command->line("    Created {$count} inventory records");
    }

    // ── Blood Requests ───────────────────────────────────────────────────────

    private function seedRequests(): void
    {
        $this->command->info('  → Seeding blood requests...');

        $hospitalUser = User::where('role', 'hospital')->first();
        if (!$hospitalUser) return;

        $requests = [
            [
                'patient_name'  => 'ICU Patient #4',
                'blood_group'   => 'O-',
                'units_needed'  => 3,
                'urgency'       => 'critical',
                'status'        => 'submitted',
                'hospital_name' => 'Max Hospital',
                'hospital_city' => 'Delhi',
                'requester_id'  => $hospitalUser->_id ?? $hospitalUser->id,
                'requester_role'=> 'hospital',
                'notes'         => 'ICU patient post-surgery. Urgent.',
            ],
            [
                'patient_name'  => 'Trauma Case — RTA',
                'blood_group'   => 'AB-',
                'units_needed'  => 2,
                'urgency'       => 'critical',
                'status'        => 'reviewing',
                'hospital_name' => 'AIIMS',
                'hospital_city' => 'Delhi',
                'requester_id'  => $hospitalUser->_id ?? $hospitalUser->id,
                'requester_role'=> 'hospital',
            ],
            [
                'patient_name'  => 'Scheduled Surgery',
                'blood_group'   => 'A+',
                'units_needed'  => 4,
                'urgency'       => 'high',
                'status'        => 'matched',
                'hospital_name' => 'Fortis Hospital',
                'hospital_city' => 'Gurgaon',
                'requester_id'  => $hospitalUser->_id ?? $hospitalUser->id,
                'requester_role'=> 'hospital',
            ],
            [
                'patient_name'  => 'Raj Patel',
                'blood_group'   => 'B+',
                'units_needed'  => 1,
                'urgency'       => 'routine',
                'status'        => 'fulfilled',
                'hospital_name' => 'Safdarjung Hospital',
                'hospital_city' => 'Delhi',
                'requester_id'  => $hospitalUser->_id ?? $hospitalUser->id,
                'requester_role'=> 'hospital',
            ],
            [
                'patient_name'  => 'Emergency A- case',
                'blood_group'   => 'A-',
                'units_needed'  => 2,
                'urgency'       => 'high',
                'status'        => 'submitted',
                'hospital_name' => 'Apollo Hospital',
                'hospital_city' => 'Delhi',
                'requester_id'  => $hospitalUser->_id ?? $hospitalUser->id,
                'requester_role'=> 'hospital',
            ],
        ];

        foreach ($requests as $reqData) {
            BloodRequest::create($reqData);
        }

        $this->command->line("    Created " . count($requests) . " blood requests");
    }

    // ── Campaigns ────────────────────────────────────────────────────────────

    private function seedCampaigns(): void
    {
        $this->command->info('  → Seeding campaigns...');

        $bankUser = User::where('role', 'blood_bank')->first();

        $campaigns = [
            [
                'name'          => 'World Blood Donor Day Drive',
                'description'   => 'Join us for the annual World Blood Donor Day drive. All blood groups needed. Free health check-up included.',
                'organizer_id'  => $bankUser?->_id ?? $bankUser?->id,
                'city'          => 'Delhi',
                'venue'         => 'AIIMS Auditorium, New Delhi',
                'starts_at'     => now()->addDays(7),
                'ends_at'       => now()->addDays(7)->addHours(8),
                'max_slots'     => 100,
                'rsvp_count'    => 34,
                'is_active'     => true,
                'blood_groups_needed' => ['O-', 'AB-', 'B-'],
            ],
            [
                'name'          => 'Fortis Community Blood Drive',
                'description'   => 'Fortis Hospital Gurgaon hosts a community blood donation camp. All are welcome.',
                'organizer_id'  => $bankUser?->_id ?? $bankUser?->id,
                'city'          => 'Gurgaon',
                'venue'         => 'Fortis Hospital, Sector 44, Gurgaon',
                'starts_at'     => now()->addDays(14),
                'ends_at'       => now()->addDays(14)->addHours(6),
                'max_slots'     => 60,
                'rsvp_count'    => 18,
                'is_active'     => true,
                'blood_groups_needed' => ['A-', 'O-', 'AB+'],
            ],
            [
                'name'          => 'Max Health Mega Donation Camp',
                'description'   => 'Max Super Specialty Hospital presents a mega blood donation camp with free health screenings.',
                'organizer_id'  => $bankUser?->_id ?? $bankUser?->id,
                'city'          => 'Delhi',
                'venue'         => 'Max Hospital Saket, New Delhi',
                'starts_at'     => now()->addDays(21),
                'ends_at'       => now()->addDays(21)->addHours(10),
                'max_slots'     => 200,
                'rsvp_count'    => 67,
                'is_active'     => true,
                'blood_groups_needed' => $this->bloodGroups,
            ],
        ];

        foreach ($campaigns as $campaignData) {
            Campaign::create($campaignData);
        }

        $this->command->line("    Created " . count($campaigns) . " campaigns");
    }
}
