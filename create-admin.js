const { Client } = require('pg');
const bcrypt = require('bcrypt');

const EMAIL = 'superadmin@sorsu.edu.ph';
const PASSWORD = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
const FIRST = 'Super';
const LAST = 'Admin';

(async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  const hash = await bcrypt.hash(PASSWORD, 12);

  // upsert: if the email already exists, update it to admin + new password
  const res = await client.query(
    `INSERT INTO users (student_id, first_name, last_name, email, password_hash, role, is_active)
     VALUES (NULL, $1, $2, $3, $4, 'admin', true)
     ON CONFLICT (email) DO UPDATE
       SET password_hash = EXCLUDED.password_hash,
           role = 'admin',
           is_active = true
     RETURNING id, email, role;`,
    [FIRST, LAST, EMAIL, hash],
  );

  console.log('Superadmin ready:', res.rows[0]);
  console.log('Login email:', EMAIL);
  console.log('Login password:', PASSWORD);
  await client.end();
})().catch((e) => {
  console.error('Failed:', e.message);
  process.exit(1);
});
