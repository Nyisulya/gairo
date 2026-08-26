module.exports = {
  apps: [
    {
      name: "gairo-shulelink",
      script: "server.js",
      instances: 1,
      exec_mode: "fork",
      watch: false,
      max_memory_restart: "800M",
      env: {
        NODE_ENV: "production",
        PORT: process.env.PORT || 8018
      }
    }
  ]
};
