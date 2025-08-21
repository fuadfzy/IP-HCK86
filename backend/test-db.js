const { Sequelize } = require('sequelize');
require('dotenv').config();

// Create connection based on environment
let sequelize;

if (process.env.DATABASE_URL) {
  // Production with DATABASE_URL (Supabase)
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: console.log
  });
} else {
  // Development with individual variables
  sequelize = new Sequelize({
    database: process.env.DB_NAME || 'restaurant_ordering',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || '',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: console.log
  });
}

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    console.log('📍 Environment:', process.env.NODE_ENV || 'development');
    
    if (process.env.DATABASE_URL) {
      console.log('🌐 Using DATABASE_URL');
    } else {
      console.log(`🏠 Using individual variables: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
    }
    
    await sequelize.authenticate();
    console.log('✅ Database connection successful!');
    
    // Test query
    const result = await sequelize.query('SELECT NOW() as current_time, VERSION() as version');
    console.log('✅ Current time:', result[0][0].current_time);
    console.log('✅ PostgreSQL version:', result[0][0].version.split(' ')[0]);
    
    // Test tables existence
    try {
      const tables = await sequelize.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `);
      
      if (tables[0].length > 0) {
        console.log('📋 Existing tables:');
        tables[0].forEach(table => {
          console.log(`   - ${table.table_name}`);
        });
      } else {
        console.log('📋 No tables found - run migrations first');
      }
    } catch (tableError) {
      console.log('⚠️  Could not check tables:', tableError.message);
    }
    
    await sequelize.close();
    console.log('🔌 Connection closed');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('   Error:', error.message);
    
    if (error.message.includes('ENOTFOUND')) {
      console.error('   💡 Tip: Check your DB_HOST setting');
    } else if (error.message.includes('authentication failed')) {
      console.error('   💡 Tip: Check your DB_USER and DB_PASS settings');
    } else if (error.message.includes('database') && error.message.includes('does not exist')) {
      console.error('   💡 Tip: Check your DB_NAME setting');
    } else if (error.message.includes('ssl')) {
      console.error('   💡 Tip: SSL issue - make sure Supabase SSL is configured correctly');
    }
    
    process.exit(1);
  }
}

testConnection();
