docker build -t keydian-backend:latest .
docker service rm keydian_backend
docker stack up -c ./test.yaml keydian
docker service ls