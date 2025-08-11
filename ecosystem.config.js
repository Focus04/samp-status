export default {
  apps: [{
    name: "samp-status",
    script: "index.js",
    instances: "max",
    exec_mode: "cluster",
    autorestart: true,
    restart_delay: 5000,
    max_memory_restart: "1G",
    env: {
      NODE_ENV: "production"
    }
  }]
}