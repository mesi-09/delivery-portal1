<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('drivers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('vehicle_type')->nullable();
            $table->string('license_plate')->nullable();
            $table->string('license_number')->nullable();
            $table->enum('status', ['available', 'busy', 'offline'])->default('offline');
            $table->decimal('rating', 3, 2)->default(5.00);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('drivers');
    }
};