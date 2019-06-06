# wordpress-load-tests

Load tests for Wordpress 🧪

#### Local testing
The recomended way of testing is to run the containers dedicated for storage and visualization (grafana & influx) via
docker-compose and to test with your local machine (since via docker you can have some limitations, like ulimits).

```
docker-compose up -d influxdb grafana
SCENARIO_URL=https://test.loadimpact.com/ SCENARIO_VUS=1000 SCENARIO_DURATION=300s k6 run --out influxdb=http://localhost:8086/k6 tests/main.js
```

If you want to run the tests via docker:
```
docker-compose run k6
```
