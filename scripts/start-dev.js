#!/usr/bin/env node

const { spawn } = require('child_process');
const os = require('os');

// Get local IP address
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return null;
}

const localIP = getLocalIP();

if (!localIP) {
  console.log('⚠️  No local network interface found. Using tunnel mode...');
  console.log('📱 This will work on any network but may be slower.');
  console.log('');
  
  // Start with tunnel mode
  const tunnelProcess = spawn('npx', ['expo', 'start', '--tunnel'], {
    stdio: 'inherit',
    shell: true
  });
  
  tunnelProcess.on('error', (error) => {
    console.error('❌ Failed to start tunnel mode:', error.message);
    process.exit(1);
  });
} else {
  console.log(`🌐 Local IP found: ${localIP}`);
  console.log('📱 QR code should work on your local network');
  console.log('');
  
  // Start with LAN mode
  const lanProcess = spawn('npx', ['expo', 'start', '--lan'], {
    stdio: 'inherit',
    shell: true
  });
  
  lanProcess.on('error', (error) => {
    console.error('❌ Failed to start LAN mode:', error.message);
    console.log('🔄 Falling back to tunnel mode...');
    
    const tunnelProcess = spawn('npx', ['expo', 'start', '--tunnel'], {
      stdio: 'inherit',
      shell: true
    });
  });
} 