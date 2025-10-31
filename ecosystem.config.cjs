module.exports = {
  apps: [
    {
      name: 'material-ui-react-router-dev',
      script: 'server.js',
      instances: 1,
      autorestart: true,
      watch: ['app/**/*', 'server/**/*', 'vite.config.ts', 'tsconfig.json', 'react-router.config.ts'],
      ignore_watch: ['node_modules', 'build', '.git'],
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      time: true,
      max_memory_restart: '1G',
        error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      merge_logs: true
    }
  ]
};