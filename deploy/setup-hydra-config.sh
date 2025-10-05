#!/bin/bash

# Script to generate Hydra configuration with proper values

set -e

echo "🔧 Configuring Hydra with domain-specific values..."
echo "   Domain: $DOMAIN"

# Generate configuration file with proper substitutions
cat > /tmp/hydra.yml << EOF
serve:
  cookies:
    same_site_mode: Lax

urls:
  self:
    issuer: https://hydra.${DOMAIN}
  consent: https://consent.${DOMAIN}/consent
  login: https://consent.${DOMAIN}/login
  logout: https://consent.${DOMAIN}/logout

secrets:
  system:
    - ${HYDRA_SYSTEM_SECRET}

oidc:
  subject_identifiers:
    supported_types:
      - pairwise
      - public
    pairwise:
      salt: ${HYDRA_OIDC_SALT}
EOF

# Move the generated config to the proper location
mv /tmp/hydra.yml ./config/hydra/hydra.yml

echo "✅ Hydra configuration updated with domain: ${DOMAIN}"
