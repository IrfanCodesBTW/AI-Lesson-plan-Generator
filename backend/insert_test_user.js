const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://lesson:lesson@localhost:5433/lesson_dev',
});
client
  .connect()
  .then(() => {
    return client.query(
      "INSERT INTO users (id, name, email, password_hash) VALUES ('22222222-2222-2222-2222-222222222222', 'Test Verification', 'test@verify.com', '') ON CONFLICT (email) DO NOTHING",
    );
  })
  .then(() => {
    console.log('User created');
    process.exit(0);
  })
  .catch(console.error);
