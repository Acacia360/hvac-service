docker build --no-cache -t acaciagreentechnologies/hvac-service:1.0 . ; if ($?) {
docker push acaciagreentechnologies/hvac-service:1.0 ; if ($?) {
kubectl rollout restart deployment/acacia360-app-acacia360-app-chart-hvac -n acacia360
kubectl rollout status deployment/acacia360-app-acacia360-app-chart-hvac -n acacia360 } }