// PM2 ecosystem config for the Clinikauto mail worker daemon
// Usage: pm2 start ecosystem.config.cjs
//        pm2 save           (persist across reboots)
//        pm2 startup        (generate OS startup command)

module.exports = {
  apps: [
    {
      name: 'clinikauto-mail-worker',
      script: 'src/services/mailWorker.ts',
      interpreter: 'node',
      interpreter_args:
        '--require ts-node/register --require tsconfig-paths/register',
      env: {
        TS_NODE_PROJECT: './tsconfig.worker.json',
        NODE_ENV: 'production',
      },
      watch: false,
      autorestart: true,
      restart_delay: 5000,
      max_restarts: 10,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: 'logs/mail-worker-error.log',
      out_file: 'logs/mail-worker-out.log',
      merge_logs: true,
    },
  ],
}
