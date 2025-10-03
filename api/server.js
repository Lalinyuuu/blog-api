import app from './index.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`\n🚀 Server running!`);
  console.log(`📍 Local:   http://localhost:${PORT}`);
  console.log(`\n📊 API Endpoints:`);
  console.log(`   GET    http://localhost:${PORT}/api`);
  console.log(`   GET    http://localhost:${PORT}/api/health`);
  console.log(`   GET    http://localhost:${PORT}/api/posts`);
  console.log(`   GET    http://localhost:${PORT}/api/posts/:id`);
  console.log(`   POST   http://localhost:${PORT}/api/posts`);
  console.log(`   PUT    http://localhost:${PORT}/api/posts/:id`);
  console.log(`   DELETE http://localhost:${PORT}/api/posts/:id\n`);
});
