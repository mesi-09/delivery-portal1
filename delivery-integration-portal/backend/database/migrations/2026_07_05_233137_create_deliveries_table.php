<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('deliveries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('partner_id')->constrained()->onDelete('cascade');
            $table->foreignId('driver_id')->nullable()->constrained()->onDelete('set null');

            $table->string('pickup_contact_name');
            $table->string('pickup_contact_number');
            $table->string('pickup_address');
            $table->decimal('pickup_latitude', 10, 7);
            $table->decimal('pickup_longitude', 10, 7);

            $table->string('dropoff_contact_name');
            $table->string('dropoff_contact_number');
            $table->string('dropoff_address');
            $table->decimal('dropoff_latitude', 10, 7);
            $table->decimal('dropoff_longitude', 10, 7);

            $table->unsignedBigInteger('parcel_category_id')->nullable();
            $table->enum('charge_payer', ['sender', 'receiver'])->default('sender');
            $table->decimal('delivery_charge', 10, 2)->default(0);

            $table->string('tracking_number')->unique();
            $table->string('third_party_reference_id')->nullable();
            $table->enum('status', ['pending', 'accepted', 'assigned', 'picked_up', 'delivered', 'cancelled'])->default('pending');
            $table->boolean('is_sandbox')->default(false);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deliveries');
    }
};
