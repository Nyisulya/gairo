module.exports = {
  apps: [
    {
      name: "gairo-shulelink",
      script: "server.js",
      instances: "max", // au 1 kwa VPS ndogo (1GB RAM)
      exec_mode: "cluster",
      watch: false,
      max_memory_restart: "800M",
      env: {
        NODE_ENV: "production",
        PORT: 5000
      }
    }
  ]
};
