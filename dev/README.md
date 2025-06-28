# Kratos Admin UI Development Setup

This Docker Compose setup provides a complete development environment for testing the Kratos Admin UI with Ory Kratos.

## Services

- **kratos-admin-ui**: The Next.js admin interface (port 3000)
- **kratos**: Ory Kratos identity server (ports 4433/4434)
- **kratos-selfservice-ui**: Official Kratos self-service UI (port 4455)
- **mailslurper**: Email testing server (ports 4436/4437)

## Identity Schemas

The setup includes three identity schemas:

1. **default** (`identity.schema.json`): Basic person schema with email, username, first_name, last_name, phone

2. **organizational** (`company-identity.schema.json`): Simplified organizational user schema with:
   - Employee ID, name, department, role
   - Employment status (active, inactive, on_leave)

3. **customer** (`customer.schema.json`): E-commerce customer schema with:
   - Customer ID, contact information, date of birth
   - Shipping address and preferences
   - Loyalty tier and account status

## Quick Start

1. Start all services:
   ```bash
   cd dev
   docker-compose up -d
   ```

2. Create test identities (first time only):
   ```bash
   docker-compose --profile init up init-identities
   ```
   
   This creates 37 test identities:
   - 15 person identities (default schema)
   - 10 organizational identities (employees)
   - 12 customer identities (e-commerce)

3. Access the services:
   - Admin UI: http://localhost:3000
   - Kratos Self-Service UI: http://localhost:4455
   - Kratos Admin API: http://localhost:4434
   - Kratos Public API: http://localhost:4433
   - MailSlurper: http://localhost:4436

4. Stop services:
   ```bash
   docker-compose down
   ```

## Re-creating Test Data

To recreate test identities:
```bash
# Remove existing data
docker-compose down -v

# Start services and create identities
docker-compose up -d
docker-compose --profile init up init-identities
```

## SELinux Systems

For systems with SELinux enabled, use the override file:

```bash
docker-compose -f docker-compose.yml -f docker-compose.override.selinux.yml up -d
```

## Development

The admin UI container mounts the source code as a volume, so changes are reflected immediately without rebuilding the container.

## Environment Variables

The admin UI is configured with:
- `NEXT_PUBLIC_KRATOS_ADMIN_URL=http://localhost:4434`
- `NEXT_PUBLIC_KRATOS_PUBLIC_URL=http://localhost:4433`

## Troubleshooting

- Ensure ports 3000, 4433, 4434, 4455, 4436, and 4437 are not in use
- Check logs: `docker-compose logs [service-name]`
- Rebuild containers: `docker-compose up --build`