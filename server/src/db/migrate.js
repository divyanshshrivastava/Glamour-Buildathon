import pool from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  const client = await pool.connect();

  try {
    console.log('🔄 Running database migrations...\n');

    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    // Split by semicolon and execute each statement
    const statements = schema.split(';').filter((stmt) => stmt.trim());

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await client.query(statement);
          console.log('✓', statement.substring(0, 50).trim() + '...');
        } catch (error) {
          // Ignore table already exists errors
          if (!error.message.includes('already exists')) {
            throw error;
          }
          console.log('⊘', statement.substring(0, 50).trim() + '... (skipped)');
        }
      }
    }

    console.log('\n✅ Database migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

// Run migrations
runMigrations().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
