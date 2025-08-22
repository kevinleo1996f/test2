const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting PowerGrid Marketplace Server...\n');

// First, seed the database
console.log('📊 Seeding database with sample data...');
const seedProcess = spawn('node', ['server/seed/seed-data.js'], {
  stdio: 'inherit',
  cwd: __dirname
});

seedProcess.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ Database seeded successfully!');
    console.log('\n🌐 Starting server...');
    
    // Then start the server
    const serverProcess = spawn('node', ['server/index.js'], {
      stdio: 'inherit',
      cwd: __dirname
    });
    
    serverProcess.on('close', (code) => {
      console.log(`\n🔌 Server stopped with code ${code}`);
    });
    
    // Handle process termination
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down server...');
      serverProcess.kill('SIGINT');
    });
    
  } else {
    console.log(`\n❌ Database seeding failed with code ${code}`);
    process.exit(1);
  }
});

seedProcess.on('error', (error) => {
  console.error('❌ Error seeding database:', error);
  process.exit(1);
}); 