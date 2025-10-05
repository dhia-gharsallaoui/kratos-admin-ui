#!/bin/bash

# Production deployment script for Kratos Admin UI

set -e

echo "🚀 Kratos Admin UI Production Deployment"
echo "========================================"

# Navigate to deploy directory
cd "$(dirname "$0")"

# Check if .env.prod exists
if [ ! -f ".env.prod" ]; then
    echo "❌ .env.prod file not found!"
    echo "Please copy .env.prod.example to .env.prod and configure it."
    exit 1
fi

# Load environment variables (initial load)
export $(cat .env.prod | grep -v '^#' | xargs)

echo "✅ Environment loaded"

# Create external network if it doesn't exist
if ! docker network ls | grep -q "web"; then
    echo "🌐 Creating external network 'web'..."
    docker network create web
else
    echo "✅ Network 'web' already exists"
fi

# Generate basic auth hashes if not provided
if [ -z "$TRAEFIK_BASIC_AUTH" ] || [ "$TRAEFIK_BASIC_AUTH" = "admin:\$apr1\$hash\$here" ]; then
    echo "🔐 Generating basic auth for admin interfaces..."
    echo "Please enter username for admin dashboards:"
    read -r ADMIN_USER
    echo "Please enter password for admin dashboards:"
    read -s ADMIN_PASS
    BASIC_AUTH=$(htpasswd -nb "$ADMIN_USER" "$ADMIN_PASS")
    sed -i "s|TRAEFIK_BASIC_AUTH=.*|TRAEFIK_BASIC_AUTH=$BASIC_AUTH|" .env.prod
    sed -i "s|SMTP_BASIC_AUTH=.*|SMTP_BASIC_AUTH=$BASIC_AUTH|" .env.prod
fi

# Set hardcoded Kratos secrets for demo (exactly 32 characters)
echo "🔑 Setting Kratos secrets..."
KRATOS_COOKIE_SECRET="abcdef1234567890abcdef1234567890"
KRATOS_CIPHER_SECRET="fedcba0987654321fedcba0987654321"

# Update the env file
sed -i "s/KRATOS_COOKIE_SECRET=.*/KRATOS_COOKIE_SECRET=$KRATOS_COOKIE_SECRET/" .env.prod
sed -i "s/KRATOS_CIPHER_SECRET=.*/KRATOS_CIPHER_SECRET=$KRATOS_CIPHER_SECRET/" .env.prod

echo "✅ Kratos secrets configured"

# Set hardcoded Hydra secrets for demo (exactly 32 characters)
echo "🔑 Setting Hydra secrets..."
HYDRA_SYSTEM_SECRET="hydrasystem1234567890abcdefghijk"
HYDRA_OIDC_SALT="hydraoidcsalt1234567890abcdefgh"

# Update the env file
sed -i "s/HYDRA_SYSTEM_SECRET=.*/HYDRA_SYSTEM_SECRET=$HYDRA_SYSTEM_SECRET/" .env.prod
sed -i "s/HYDRA_OIDC_SALT=.*/HYDRA_OIDC_SALT=$HYDRA_OIDC_SALT/" .env.prod

echo "✅ Hydra secrets configured"

# Reload environment variables after secret generation
echo "🔄 Reloading environment variables..."
export $(cat .env.prod | grep -v '^#' | xargs)

# Create .env file for Docker Compose
echo "📝 Creating .env file for Docker Compose..."
cp .env.prod .env

# Configuration is already set with hardcoded values
echo "🔧 Using pre-configured Kratos settings..."

# Setup Hydra configuration
echo "🔧 Setting up Hydra configuration..."
./setup-hydra-config.sh

# Pull latest images
echo "📦 Pulling latest images..."
docker compose pull

# Start services
echo "🚀 Starting services..."
docker compose up -d

# Initialize demo identities
echo "🎭 Initializing demo identities..."
docker compose --profile init up init-identities

# Initialize OAuth 2.0 clients
echo "🔐 Initializing OAuth 2.0 clients..."
docker compose --profile init up init-clients

echo ""
echo "🎉 Deployment completed!"
echo ""
echo "Your services are now running at:"
echo "  Admin UI:        https://admin.$DOMAIN"
echo "  Kratos Public:   https://kratos.$DOMAIN"
echo "  Kratos Admin:    http://kratos:4434 (internal only)"
echo "  Hydra Public:    https://hydra.$DOMAIN"
echo "  Hydra Admin:     http://hydra:4445 (internal only)"
echo "  Hydra Consent:   https://consent.$DOMAIN"
echo "  Mail:            https://mail.$DOMAIN"
echo ""
echo "🎭 Demo accounts created:"
echo "  Admin:    admin@$DOMAIN / admin123!"
echo "  Customer: customer@example.com / customer123!"
echo "  User:     user@example.com / user123!"
echo ""
echo "🔐 OAuth 2.0 Clients created:"
echo "  web-app-client (secret: web-app-secret)"
echo "  kratos-admin-ui (secret: kratos-admin-ui-secret)"
echo "  test-client (secret: test-client-secret)"
echo "  + 5 more clients (see init-clients.sh for details)"
echo ""
echo "📋 Next steps:"
echo "1. Configure your DNS to point to this server"
echo "2. Wait for Let's Encrypt certificates to be issued"
echo "3. Access the admin UI and start managing identities"
echo ""
echo "📊 Monitor deployment:"
echo "  docker compose logs -f"
