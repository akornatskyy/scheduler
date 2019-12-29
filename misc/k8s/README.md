# K8S

```sh
kubectl apply -f misc/k8s

kubectl port-forward service/scheduler-db 5432
# apply sql scripts
kubectl port-forward service/scheduler 8080
```
