import bcrypt from "bcryptjs";
import { query } from "./src/config/database.js";

const email = "abhishekmodi051@gmail.com";
const newPassword = "MedNexus@2026";

const passwordHash = await bcrypt.hash(newPassword, 12);

console.log("Generated hash:");
console.log(passwordHash);
console.log("Hash length:", passwordHash.length);

await query(
  `
  UPDATE users
  SET password_hash = $1
  WHERE LOWER(email) = LOWER($2)
  `,
  [passwordHash, email]
);

console.log("✅ Password updated successfully");

const result = await query(
  `
  SELECT
    email,
    password_hash,
    LENGTH(password_hash) AS hash_length
  FROM users
  WHERE LOWER(email) = LOWER($1)
  `,
  [email]
);

const user = result.rows[0];

console.log("EMAIL:", user.email);
console.log("HASH LENGTH:", user.hash_length);
console.log("HASH PREFIX:", user.password_hash.substring(0, 4));

const matches = await bcrypt.compare(
  newPassword,
  user.password_hash
);

console.log("PASSWORD MATCH:", matches);

process.exit(0);