/** PM2 process file — keeps ADMIN_PASSWORD literal (avoids Next .env `$` expansion). */
module.exports = {
  apps: [
    {
      name: "swiftmall",
      cwd: "/var/www/sites/swiftmall.co.ke",
      script: "npm",
      args: "start -- -p 3020 --hostname 127.0.0.1",
      env: {
        NODE_ENV: "production",
        ADMIN_EMAIL: "martin@swiftmall.co.ke",
        ADMIN_PASSWORD: "Martin$100",
      },
    },
  ],
};
