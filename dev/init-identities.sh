#!/bin/sh

# Check if identities already exist to avoid duplicates
check_existing_identities() {
  response=$(curl -s "http://kratos:4434/admin/identities?page_size=1" 2>/dev/null)
  count=$(echo "$response" | grep -o '"id"' | wc -l)
  if [ "$count" -gt 0 ]; then
    echo "⚠️  Identities already exist in Kratos. Skipping creation to avoid duplicates."
    echo "   To recreate identities, delete the Kratos database volume first."
    exit 0
  fi
}

# Wait for Kratos to be ready
echo "Waiting for Kratos to be ready..."
until curl -s http://kratos:4434/health/ready >/dev/null 2>&1; do
  echo "Kratos not ready yet, waiting..."
  sleep 2
done
echo "Kratos is ready!"

# Check for existing identities
check_existing_identities

KRATOS_ADMIN_URL="http://kratos:4434"

# Simple random using /dev/urandom with fallback
get_random() {
  if [ -r /dev/urandom ]; then
    od -An -N2 -tu2 < /dev/urandom 2>/dev/null | tr -d ' '
  else
    # Fallback using date and process ID
    timestamp=$(date +%s)
    echo $((timestamp % 32768))
  fi
}

# Generate random data with unique values
generate_email() {
  echo "user$(get_random | awk '{print $1 % 1000}')_$(date +%s | tail -c 4)@example.org"
}

generate_employee_id() {
  echo "EMP-$(get_random | awk '{print $1 % 9000 + 1000}')"
}

generate_customer_id() {
  echo "CUST-$(get_random | awk '{print $1 % 90000 + 10000}')"
}

# Determine if email should be verified (70% chance)
should_verify_email() {
  random_val=$(get_random | awk '{print $1 % 10}')
  [ "$random_val" -lt 7 ]
}

# Get random element from space-separated list
get_random_element() {
  list="$1"
  count=$(echo "$list" | wc -w)
  index=$(get_random | awk -v c="$count" '{print $1 % c + 1}')
  echo "$list" | awk -v i="$index" '{print $i}'
}

# Data lists (space-separated)
first_names="John Jane Michael Sarah David Emily Robert Lisa James Anna William Emma Christopher Olivia Daniel Sophia"
last_names="Smith Johnson Williams Brown Jones Garcia Miller Davis Rodriguez Martinez Hernandez Lopez Gonzalez Wilson Anderson Thomas"
departments="Engineering Product Marketing Sales Operations Finance HR"
roles="admin manager senior junior intern"
loyalty_tiers="bronze silver gold platinum diamond"
statuses="active inactive on_leave"
customer_statuses="active suspended closed"

echo "Creating 15 default (person) identities..."
i=1
while [ $i -le 15 ]; do
  EMAIL=$(generate_email)
  FIRST_NAME=$(get_random_element "$first_names")
  LAST_NAME=$(get_random_element "$last_names")
  USERNAME=$(echo "${FIRST_NAME}${LAST_NAME}" | tr '[:upper:]' '[:lower:]')$(get_random | awk '{print $1 % 100}')
  PHONE=$(printf "+1555%07d" $(get_random | awk '{print $1 % 10000000}'))
  
  # Check if email should be verified
  if should_verify_email; then
    VERIFIED="true"
    VERIFICATION_STATUS="completed"
  else
    VERIFIED="false"
    VERIFICATION_STATUS="pending"
  fi
  
  curl -s -X POST \
    -H "Content-Type: application/json" \
    -d '{
      "schema_id": "default",
      "state": "active",
      "traits": {
        "email": "'"${EMAIL}"'",
        "username": "'"${USERNAME}"'",
        "first_name": "'"${FIRST_NAME}"'",
        "last_name": "'"${LAST_NAME}"'",
        "phone": "'"${PHONE}"'"
      },
      "verifiable_addresses": [
        {
          "value": "'"${EMAIL}"'",
          "verified": '"${VERIFIED}"',
          "via": "email",
          "status": "'"${VERIFICATION_STATUS}"'"
        }
      ],
      "metadata_public": {
        "source": "admin_import"
      },
      "metadata_admin": {
        "created_via": "init_script",
        "batch_id": "'"$(date +%Y%m%d)"'"
      }
    }' \
    "${KRATOS_ADMIN_URL}/admin/identities"
  
  echo "Created person: ${FIRST_NAME} ${LAST_NAME} (${EMAIL})"
  i=$((i + 1))
  sleep 0.1
done

echo "Creating 10 organizational identities..."
i=1
while [ $i -le 10 ]; do
  EMAIL=$(generate_email)
  EMPLOYEE_ID=$(generate_employee_id)
  FIRST_NAME=$(get_random_element "$first_names")
  LAST_NAME=$(get_random_element "$last_names")
  DEPARTMENT=$(get_random_element "$departments")
  ROLE=$(get_random_element "$roles")
  STATUS=$(get_random_element "$statuses")
  
  # Check if email should be verified (80% for employees)
  random_val=$(get_random | awk '{print $1 % 10}')
  if [ "$random_val" -lt 8 ]; then
    VERIFIED="true"
    VERIFICATION_STATUS="completed"
  else
    VERIFIED="false"
    VERIFICATION_STATUS="pending"
  fi
  
  curl -s -X POST \
    -H "Content-Type: application/json" \
    -d '{
      "schema_id": "organizational",
      "state": "active",
      "traits": {
        "email": "'"${EMAIL}"'",
        "employee_id": "'"${EMPLOYEE_ID}"'",
        "first_name": "'"${FIRST_NAME}"'",
        "last_name": "'"${LAST_NAME}"'",
        "department": "'"${DEPARTMENT}"'",
        "role": "'"${ROLE}"'",
        "status": "'"${STATUS}"'"
      },
      "verifiable_addresses": [
        {
          "value": "'"${EMAIL}"'",
          "verified": '"${VERIFIED}"',
          "via": "email",
          "status": "'"${VERIFICATION_STATUS}"'"
        }
      ],
      "metadata_public": {
        "employee_type": "organizational"
      },
      "metadata_admin": {
        "created_via": "init_script",
        "department": "'"${DEPARTMENT}"'",
        "role": "'"${ROLE}"'",
        "batch_id": "'"$(date +%Y%m%d)"'"
      }
    }' \
    "${KRATOS_ADMIN_URL}/admin/identities" > /dev/null
  
  echo "Created employee: ${FIRST_NAME} ${LAST_NAME} (${EMPLOYEE_ID}) - ${DEPARTMENT}/${ROLE}"
  i=$((i + 1))
  sleep 0.1
done

echo "Creating 12 customer identities..."
i=1
while [ $i -le 12 ]; do
  EMAIL=$(generate_email)
  CUSTOMER_ID=$(generate_customer_id)
  FIRST_NAME=$(get_random_element "$first_names")
  LAST_NAME=$(get_random_element "$last_names")
  LOYALTY_TIER=$(get_random_element "$loyalty_tiers")
  ACCOUNT_STATUS=$(get_random_element "$customer_statuses")
  
  # Generate random date of birth (18-80 years old)
  CURRENT_YEAR=$(date +%Y)
  BIRTH_YEAR=$((CURRENT_YEAR - $(get_random | awk '{print $1 % 62 + 18}')))
  BIRTH_MONTH=$(printf "%02d" $(get_random | awk '{print $1 % 12 + 1}'))
  BIRTH_DAY=$(printf "%02d" $(get_random | awk '{print $1 % 28 + 1}'))
  DATE_OF_BIRTH="${BIRTH_YEAR}-${BIRTH_MONTH}-${BIRTH_DAY}"
  
  PHONE=$(printf "+1555%07d" $(get_random | awk '{print $1 % 10000000}'))
  STREET_NUM=$(get_random | awk '{print $1 % 9999 + 1}')
  POSTAL_CODE=$(printf "%05d" $(get_random | awk '{print $1 % 99999}'))
  NEWSLETTER=$(get_random | awk '{if($1 % 2 == 1) print "true"; else print "false"}')
  MARKETING=$(get_random | awk '{if($1 % 2 == 1) print "true"; else print "false"}')
  
  # Check if email should be verified (60% for customers)
  random_val=$(get_random | awk '{print $1 % 10}')
  if [ "$random_val" -lt 6 ]; then
    VERIFIED="true"
    VERIFICATION_STATUS="completed"
  else
    VERIFIED="false"
    VERIFICATION_STATUS="pending"
  fi
  
  curl -s -X POST \
    -H "Content-Type: application/json" \
    -d '{
      "schema_id": "customer",
      "state": "active",
      "traits": {
        "email": "'"${EMAIL}"'",
        "customer_id": "'"${CUSTOMER_ID}"'",
        "first_name": "'"${FIRST_NAME}"'",
        "last_name": "'"${LAST_NAME}"'",
        "phone": "'"${PHONE}"'",
        "date_of_birth": "'"${DATE_OF_BIRTH}"'",
        "shipping_address": {
          "street": "'"${STREET_NUM} Main St"'",
          "city": "Springfield",
          "state": "CA",
          "postal_code": "'"${POSTAL_CODE}"'",
          "country": "USA"
        },
        "preferences": {
          "newsletter": '"${NEWSLETTER}"',
          "marketing_emails": '"${MARKETING}"',
          "preferred_language": "en",
          "currency": "USD"
        },
        "loyalty_tier": "'"${LOYALTY_TIER}"'",
        "account_status": "'"${ACCOUNT_STATUS}"'"
      },
      "verifiable_addresses": [
        {
          "value": "'"${EMAIL}"'",
          "verified": '"${VERIFIED}"',
          "via": "email",
          "status": "'"${VERIFICATION_STATUS}"'"
        }
      ],
      "metadata_public": {
        "customer_type": "retail",
        "loyalty_tier": "'"${LOYALTY_TIER}"'"
      },
      "metadata_admin": {
        "created_via": "init_script",
        "account_status": "'"${ACCOUNT_STATUS}"'",
        "batch_id": "'"$(date +%Y%m%d)"'"
      }
    }' \
    "${KRATOS_ADMIN_URL}/admin/identities" > /dev/null
  
  echo "Created customer: ${FIRST_NAME} ${LAST_NAME} (${CUSTOMER_ID}) - ${LOYALTY_TIER} tier"
  i=$((i + 1))
  sleep 0.1
done

echo "✅ Identity generation complete!"
echo "   📊 15 person identities (70% verified)"
echo "   👥 10 organizational identities (80% verified)" 
echo "   🛒 12 customer identities (60% verified)"
echo "   🎯 Total: 37 test identities created"

# Create marker file to indicate completion
touch /tmp/init-complete
echo "🏁 Init script completed successfully"
