echo "----------------------------------------"
echo "[HOST CPU: $(date '+%Y-%m-%d %H:%M:%S')]"
echo "----------------------------------------"
echo "OS: $(cat /etc/os-release | grep PRETTY_NAME | cut -d "=" -f 2 | tr -d '"')"
echo "Kernal: $(uname -r)"
echo "Threads: $(nproc)"
echo "Architecture: $(arch)"
echo

echo "----------------------------------------"
echo "[HOST GPU: $(date '+%Y-%m-%d %H:%M:%S')]"
echo "----------------------------------------"
lspci | grep -i VGA
echo "----------------------------------------"
echo

echo "----------------------------------------"
echo "[HOST RAM: $(date '+%Y-%m-%d %H:%M:%S')]"
echo "----------------------------------------"
free -h
echo

echo "----------------------------------------"
echo "[HOST HDD(free): $(date '+%Y-%m-%d %H:%M:%S')]"
echo "----------------------------------------"
df -h
echo

echo "----------------------------------------"
echo "[HOST HDD(usage): $(date '+%Y-%m-%d %H:%M:%S')]"
echo "----------------------------------------"
du -sh /var/log/syslog /var/log/kern.log
echo
