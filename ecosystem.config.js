module.exports = {
  apps : [{
    name: 'MES_INT',
    script: 'index.js',
    
    // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
    args: '',
    instances: 2,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    log_date_format: 'YYYY-MM-DD HH:mm:ss.SSS',
    out_file:'logs/pm2_mesint-out.log',
    error_file: 'logs/pm2_mesint-err.log',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }]
};
