#!/bin/sh

# Check if clients already exist to avoid duplicates
check_existing_clients() {
  response=$(curl -s "http://hydra:4445/admin/clients?page_size=1" 2>/dev/null)
  count=$(echo "$response" | grep -o '"client_id"' | wc -l)
  if [ "$count" -gt 0 ]; then
    echo "⚠️  OAuth 2.0 clients already exist in Hydra. Skipping creation to avoid duplicates."
    echo "   To recreate clients, delete the Hydra database volume first."
    exit 0
  fi
}

# Wait for Hydra to be ready
echo "Waiting for Hydra to be ready..."
until curl -s http://hydra:4445/health/ready >/dev/null 2>&1; do
  echo "Hydra not ready yet, waiting..."
  sleep 2
done
echo "Hydra is ready!"

# Check for existing clients
check_existing_clients

HYDRA_ADMIN_URL="http://hydra:4445"

echo "Creating OAuth 2.0 clients..."

# 1. Web Application (Authorization Code Flow)
echo "Creating web application client..."
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "web-app-client",
    "client_name": "Web Application",
    "client_secret": "web-app-secret",
    "grant_types": ["authorization_code", "refresh_token"],
    "response_types": ["code"],
    "redirect_uris": ["http://localhost:3000/callback", "http://localhost:3000/auth/callback"],
    "post_logout_redirect_uris": ["http://localhost:3000/logout"],
    "scope": "openid offline_access profile email",
    "token_endpoint_auth_method": "client_secret_post",
    "skip_consent": false
  }' \
  "${HYDRA_ADMIN_URL}/admin/clients" > /dev/null

echo "✅ Created: web-app-client"

# 2. Single Page Application (PKCE)
echo "Creating SPA client..."
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "spa-client",
    "client_name": "Single Page Application",
    "grant_types": ["authorization_code", "refresh_token"],
    "response_types": ["code"],
    "redirect_uris": ["http://localhost:4455/callback", "http://localhost:4455/auth/callback"],
    "post_logout_redirect_uris": ["http://localhost:4455/"],
    "scope": "openid offline_access profile email",
    "token_endpoint_auth_method": "none",
    "skip_consent": false
  }' \
  "${HYDRA_ADMIN_URL}/admin/clients" > /dev/null

echo "✅ Created: spa-client (public, PKCE required)"

# 3. Mobile Application
echo "Creating mobile app client..."
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "mobile-app-client",
    "client_name": "Mobile Application",
    "grant_types": ["authorization_code", "refresh_token"],
    "response_types": ["code"],
    "redirect_uris": ["myapp://callback", "com.example.app://oauth/callback"],
    "scope": "openid offline_access profile email",
    "token_endpoint_auth_method": "none",
    "skip_consent": false
  }' \
  "${HYDRA_ADMIN_URL}/admin/clients" > /dev/null

echo "✅ Created: mobile-app-client (public, PKCE required)"

# 4. Backend Service (Client Credentials)
echo "Creating backend service client..."
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "backend-service",
    "client_name": "Backend Service",
    "client_secret": "backend-service-secret",
    "grant_types": ["client_credentials"],
    "response_types": [],
    "scope": "api.read api.write",
    "token_endpoint_auth_method": "client_secret_basic",
    "skip_consent": true
  }' \
  "${HYDRA_ADMIN_URL}/admin/clients" > /dev/null

echo "✅ Created: backend-service (machine-to-machine)"

# 5. Admin UI Client (for this admin UI)
echo "Creating Kratos Admin UI client..."
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "kratos-admin-ui",
    "client_name": "Kratos Admin UI",
    "client_secret": "kratos-admin-ui-secret",
    "grant_types": ["authorization_code", "refresh_token"],
    "response_types": ["code"],
    "redirect_uris": ["http://localhost:3000/api/auth/callback", "http://localhost:3000/auth/callback"],
    "post_logout_redirect_uris": ["http://localhost:3000/"],
    "scope": "openid offline_access profile email",
    "token_endpoint_auth_method": "client_secret_post",
    "skip_consent": false
  }' \
  "${HYDRA_ADMIN_URL}/admin/clients" > /dev/null

echo "✅ Created: kratos-admin-ui"

# 6. Device Flow Client
echo "Creating device flow client..."
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "device-client",
    "client_name": "Smart TV / IoT Device",
    "grant_types": ["urn:ietf:params:oauth:grant-type:device_code", "refresh_token"],
    "response_types": [],
    "scope": "openid offline_access profile",
    "token_endpoint_auth_method": "none",
    "skip_consent": false
  }' \
  "${HYDRA_ADMIN_URL}/admin/clients" > /dev/null

echo "✅ Created: device-client (device flow)"

# 7. Testing Client (skip consent for easier testing)
echo "Creating test client..."
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "test-client",
    "client_name": "Test Client (Skip Consent)",
    "client_secret": "test-client-secret",
    "grant_types": ["authorization_code", "refresh_token", "client_credentials"],
    "response_types": ["code", "token", "id_token"],
    "redirect_uris": ["http://localhost:5555/callback", "http://127.0.0.1:5555/callback"],
    "post_logout_redirect_uris": ["http://localhost:5555/"],
    "scope": "openid offline_access profile email",
    "token_endpoint_auth_method": "client_secret_post",
    "skip_consent": true
  }' \
  "${HYDRA_ADMIN_URL}/admin/clients" > /dev/null

echo "✅ Created: test-client (consent skipped)"

# 8. Public API Client
echo "Creating public API client..."
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "public-api-client",
    "client_name": "Public API Client",
    "client_secret": "public-api-secret",
    "grant_types": ["authorization_code", "refresh_token"],
    "response_types": ["code"],
    "redirect_uris": ["http://localhost:8080/callback"],
    "scope": "openid profile email api.read",
    "token_endpoint_auth_method": "client_secret_basic",
    "skip_consent": false
  }' \
  "${HYDRA_ADMIN_URL}/admin/clients" > /dev/null

echo "✅ Created: public-api-client"

echo ""
echo "✅ OAuth 2.0 client creation complete!"
echo ""
echo "📋 Created Clients Summary:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Web Applications:"
echo "   • web-app-client (secret: web-app-secret)"
echo "   • kratos-admin-ui (secret: kratos-admin-ui-secret)"
echo ""
echo "📱 Public Clients (PKCE required):"
echo "   • spa-client (Single Page App)"
echo "   • mobile-app-client (Mobile App)"
echo "   • device-client (Device Flow)"
echo ""
echo "⚙️  Backend Services:"
echo "   • backend-service (secret: backend-service-secret)"
echo "   • public-api-client (secret: public-api-secret)"
echo ""
echo "🧪 Testing:"
echo "   • test-client (secret: test-client-secret, consent skipped)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 Quick Start:"
echo "   Hydra Admin API: http://localhost:4445"
echo "   Hydra Public API: http://localhost:4444"
echo "   Login/Consent UI: http://localhost:3000"
echo ""
echo "🔐 Test the flow with hydra token user:"
echo "   hydra token user --client-id test-client --client-secret test-client-secret \\"
echo "     --endpoint http://127.0.0.1:4444 --scope openid,offline_access"
echo ""

# Create marker file to indicate completion
touch /tmp/init-clients-complete
echo "🏁 Init clients script completed successfully"
