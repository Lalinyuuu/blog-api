import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function seed() {
  try {
    console.log('🌱 Seeding database...\n');
    
    // Insert sample posts
    const posts = await sql`
      INSERT INTO posts (title, content, author) VALUES
      ('Getting Started with React', 'React is a powerful JavaScript library for building user interfaces. It allows developers to create reusable components...', 'John Doe'),
      ('Node.js Best Practices', 'When building Node.js applications, there are several best practices to follow for optimal performance and maintainability...', 'Jane Smith'),
      ('Understanding PostgreSQL', 'PostgreSQL is a powerful open-source relational database. It offers advanced features like JSONB support, full-text search...', 'Mike Johnson'),
      ('Deploying to Vercel', 'Vercel makes it easy to deploy modern web applications. With zero-configuration deployments and automatic HTTPS...', 'Sarah Wilson'),
      ('API Design Principles', 'Good API design is crucial for building scalable applications. RESTful principles, proper error handling, and clear documentation...', 'David Brown')
      RETURNING *
    `;
    
    console.log(`✅ Seeded ${posts.length} posts:\n`);
    posts.forEach((post, i) => {
      console.log(`   ${i + 1}. ${post.title} - by ${post.author}`);
    });
    console.log('\n🎉 Database seeded successfully!\n');
    
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  }
  process.exit(0);
}

seed();
