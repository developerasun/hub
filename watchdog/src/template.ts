export const payload = {
  alert: {    
    embeds: [{
      title: "🚨 Server Offline Alert",
      color: 15158332, // 빨간색 (Hex: #E74C3C)
      fields: [
        { name: "Server Name", value: "hub_proxy", inline: true },
        { name: "Status", value: "DOWN", inline: true },
        { name: "Last Heartbeat", value: new Date().toLocaleString("ko-KR", {
          timeZone: "Asia/Seoul"
        }), inline: false },
        { name: "Description", value: "The deadman's switch was triggered. No ping received in the last 3 minutes." }
      ],
    }]
  },
  restore: {
    embeds: [{
      title: "✅ Server Restored",
      color: 3066993, // 초록색 (Hex: #2ECC71)
      fields: [
        { name: "Server Name", value: "hub_proxy", inline: true },
        { name: "Status", value: "UP", inline: true },
        { 
          name: "Restored At", 
          value: new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }), 
          inline: false 
        },
        { 
          name: "Description", 
          value: "The server is back online. Connection has been successfully re-established." 
        }
      ],
    }]
  }
}