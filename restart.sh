git pull
ID=$(docker ps | grep hub_proxy | awk '{print $1}')
docker exec -i ${ID} sh <<EOF
cd /config
caddy reload -c ./Caddyfile
cat ./Caddyfile
EOF