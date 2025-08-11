module.exports = {
  apps: [
    {
      name: 'wechat-server',
      script: './server/dist/index.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 3001
      },
      error_file: './logs/server-error.log',
      out_file: './logs/server-out.log',
      log_file: './logs/server-combined.log',
      time: true,
      watch: false,
      max_memory_restart: '500M',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s'
    },
    {
      name: 'wechat-client',
      script: 'npx',
      args: 'serve -s client/build -l 3000',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/client-error.log',
      out_file: './logs/client-out.log',
      log_file: './logs/client-combined.log',
      time: true,
      watch: false,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ],

  deploy: {
    production: {
      user: 'ubuntu',
      host: 'YOUR_SERVER_IP',
      ref: 'origin/main',
      repo: 'YOUR_GIT_REPOSITORY',
      path: '/home/ubuntu/wechat-poc2',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};