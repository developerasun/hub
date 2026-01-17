export const payload = {
  alert: (time: string) => ({    
    embeds: [{
      title: "🚨 Server Offline Alert",
      color: 15158332, // 빨간색 (Hex: #E74C3C)
      fields: [
        { name: "Server Name", value: "hub_proxy", inline: true },
        { name: "Status", value: "DOWN", inline: true },
        { name: "Last Heartbeat", value: time, inline: false },
        { name: "Description", value: "The deadman's switch was triggered. No ping received in the last 3 minutes." }
      ],
    }]
  }),
  restore: (time: string) => ({
    embeds: [{
      title: "✅ Server Restored",
      color: 3066993, // 초록색 (Hex: #2ECC71)
      fields: [
        { name: "Server Name", value: "hub_proxy", inline: true },
        { name: "Status", value: "UP", inline: true },
        { 
          name: "Restored At", 
          value: time, 
          inline: false 
        },
        { 
          name: "Description", 
          value: "The server is back online. Connection has been successfully re-established." 
        }
      ],
    }]
  })
}