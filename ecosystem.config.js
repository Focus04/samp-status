export default {
  apps: [{
    name: "samp-status",
    script: "./index.js",
    interpreter_args: "--experimental-vm-modules",
    instances: "max",
    exec_mode: "cluster",
    autorestart: true,
    max_memory_restart: "1G",
    env: {
      NODE_ENV: "production",
      NODE_OPTIONS: "--experimental-vm-modules"
    }
  }]
}