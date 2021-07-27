
### Features

- MQTT receiver for water pump
- DB/file records
- HTTP control

### Run

    npm run dev

### Postgresql

    export PGHOST=postgresql
    export PGUSER=postgresql
    export PGPASSWORD=$(k get secret postgresql -o json | jq -r '.data["postgresql-password"]' | base64 -d)
    psql -h $PGHOST -u $PGUSER

