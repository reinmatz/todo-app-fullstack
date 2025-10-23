#!/bin/bash

# Initialize Let's Encrypt SSL Certificates
# This script sets up SSL certificates for the first time using certbot

set -e

# Load environment variables
if [ -f .env.production ]; then
    export $(cat .env.production | grep -v '^#' | xargs)
else
    echo "Error: .env.production file not found!"
    echo "Please create .env.production from .env.production.example"
    exit 1
fi

# Check required variables
if [ -z "$DOMAIN" ] || [ -z "$LETSENCRYPT_EMAIL" ]; then
    echo "Error: DOMAIN and LETSENCRYPT_EMAIL must be set in .env.production"
    exit 1
fi

echo "========================================="
echo "Let's Encrypt SSL Certificate Setup"
echo "========================================="
echo "Domain: $DOMAIN"
echo "Email: $LETSENCRYPT_EMAIL"
echo ""

# Ask for confirmation
read -p "Is this correct? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
fi

# Create necessary directories
echo "Creating directories..."
mkdir -p nginx/ssl
mkdir -p certbot/conf
mkdir -p certbot/www

# Download recommended TLS parameters
if [ ! -f "nginx/ssl/options-ssl-nginx.conf" ]; then
    echo "Downloading recommended TLS parameters..."
    curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > nginx/ssl/options-ssl-nginx.conf
fi

if [ ! -f "nginx/ssl/ssl-dhparams.pem" ]; then
    echo "Downloading DH parameters..."
    curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > nginx/ssl/ssl-dhparams.pem
fi

# Create dummy certificate for nginx to start
echo "Creating dummy certificate for $DOMAIN..."
mkdir -p "certbot/conf/live/$DOMAIN"

docker compose -f docker-compose.prod.yml run --rm --entrypoint "\
  openssl req -x509 -nodes -newkey rsa:4096 -days 1 \
    -keyout '/etc/letsencrypt/live/$DOMAIN/privkey.pem' \
    -out '/etc/letsencrypt/live/$DOMAIN/fullchain.pem' \
    -subj '/CN=localhost'" certbot

echo "Starting nginx..."
docker compose -f docker-compose.prod.yml up --force-recreate -d nginx

# Delete dummy certificate
echo "Deleting dummy certificate for $DOMAIN..."
docker compose -f docker-compose.prod.yml run --rm --entrypoint "\
  rm -Rf /etc/letsencrypt/live/$DOMAIN && \
  rm -Rf /etc/letsencrypt/archive/$DOMAIN && \
  rm -Rf /etc/letsencrypt/renewal/$DOMAIN.conf" certbot

# Request Let's Encrypt certificate
echo "Requesting Let's Encrypt certificate for $DOMAIN..."

# Use staging environment for testing (remove --staging for production)
# Uncomment the line below for testing:
# STAGING_ARG="--staging"

docker compose -f docker-compose.prod.yml run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    $STAGING_ARG \
    --email $LETSENCRYPT_EMAIL \
    -d $DOMAIN \
    -d www.$DOMAIN \
    --rsa-key-size 4096 \
    --agree-tos \
    --force-renewal \
    --non-interactive" certbot

# Reload nginx to load the real certificates
echo "Reloading nginx..."
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload

echo ""
echo "========================================="
echo "SSL Certificate Setup Complete!"
echo "========================================="
echo "Your site should now be accessible at:"
echo "https://$DOMAIN"
echo ""
echo "Certificates will auto-renew every 12 hours."
echo "========================================="
