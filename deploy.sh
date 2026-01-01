docker build -t keydian-backend:latest .
docker service rm keydian_backend
docker stack up -c ./service.yaml keydian
docker service ls