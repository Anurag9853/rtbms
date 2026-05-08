FROM php:8.3-cli

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git curl zip unzip libssl-dev pkg-config \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP MongoDB extension
RUN pecl install mongodb && docker-php-ext-enable mongodb

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /app

# Copy composer files first (layer caching)
COPY composer.json composer.lock ./

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader --no-scripts --no-interaction

# Copy the rest of the application
COPY . .

# Run post-install scripts
RUN composer run-script post-autoload-dump

# Create necessary directories and set permissions
RUN mkdir -p storage/logs storage/framework/cache storage/framework/sessions \
    storage/framework/views bootstrap/cache && \
    chmod -R 775 storage bootstrap/cache

# Cache Laravel configuration
RUN php artisan config:cache && \
    php artisan route:cache && \
    php artisan event:cache

# Expose port (Render sets $PORT dynamically)
EXPOSE 8000

# Start command - Render will set PORT env var
CMD php artisan serve --host=0.0.0.0 --port=${PORT:-8000}
