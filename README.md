# wordpress-load-tests

Load tests for Wordpress 🧪

#### K8s deployment
If you don't want to hammer your local machine, or you want to have tests as reproductible as possible, you can use Kubernetes.

```
cd chart
helm install --name storage storage/
helm install --name k6 k6/
```

This will deploy influxdb and grafana. In order to access grafana, you will need the admin password from the `storage-grafana`
secret.
```
kubectl get secret storage-grafana -o yaml
```

Next, just forward grafana's 3000 port
```
kubectl port-forward $(kubectl get pod | grep grafana | awk '{print $1}') 3000:3000
```

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
