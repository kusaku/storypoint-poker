const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Story Point Poker (Frontend + Backend)...\n');

// Start backend (Socket.io server) on port 3001
const backend = spawn('npm', ['run', 'start:backend'], {
  cwd: path.join(__dirname, 'server'),
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    PORT: '3001' // Socket.io on internal port 3001
  }
});

// Wait a bit for backend to start, then start frontend
setTimeout(() => {
  // Start frontend (Next.js) on Railway's PORT
  const frontend = spawn('npm', ['run', 'start:frontend'], {
    stdio: 'inherit',
    shell: true
  });

  frontend.on('exit', (code) => {
    console.log(`\n❌ Frontend exited with code ${code}`);
    if (code !== 0) {
      process.exit(code);
    }
  });
}, 2000);

// Handle process termination
process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down...');
  backend.kill();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  backend.kill();
  process.exit(0);
});

// Log if backend exits
backend.on('exit', (code) => {
  console.log(`\n❌ Backend exited with code ${code}`);
  if (code !== 0) {
    process.exit(code);
  }
});

