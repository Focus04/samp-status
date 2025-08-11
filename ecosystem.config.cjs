module.exports = {
  apps: [{
    name: "samp-status",
    script: "./index.js",
    instances: "max",
    exec_mode: "cluster",
    autorestart: true,
    max_memory_restart: "1G",
    env: {
      NODE_ENV: "production",
      NODE_OPTIONS: "--experimental-vm-modules"
    },
    node_args: "--experimental-vm-modules"
  }]
}