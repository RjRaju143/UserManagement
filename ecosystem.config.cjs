module.exports = {
    apps: [{
        name: 'api',
        script: './bin/server.js',
        instances: maxInstances,
        autorestart: true,
        watch: false,
        max_memory_restart: maxMemory,
        env: {
            NODE_ENV: 'production'
        },
        exec_mode: 'cluster',
    }]
}
