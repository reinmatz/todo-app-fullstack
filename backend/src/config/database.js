import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'tododb',
  username: process.env.DB_USER || 'todouser',
  password: process.env.DB_PASSWORD || 'todopass',
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Test database connection
export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully');

    // Database schema is managed by init.sql
    // Sync is disabled to prevent accidental schema changes
    // Only validate that tables exist without altering them
    console.log('Database connection ready (schema managed by migrations)');
  } catch (error) {
    console.error('Unable to connect to database:', error);
    process.exit(1);
  }
};

export default sequelize;
