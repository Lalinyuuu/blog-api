import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // Clear existing data
  await prisma.post.deleteMany();
  await prisma.author.deleteMany();

  // Create authors
  const authors = await Promise.all([
    prisma.author.create({
      data: {
        name: 'John Doe',
        email: 'john@example.com',
        bio: 'Full-stack developer and tech enthusiast'
      }
    }),
    prisma.author.create({
      data: {
        name: 'Jane Smith',
        email: 'jane@example.com',
        bio: 'Backend specialist with focus on Node.js'
      }
    })
  ]);

  console.log(`✅ Created ${authors.length} authors\n`);

  // Create posts
  const posts = await Promise.all([
    prisma.post.create({
      data: {
        title: 'Getting Started with Prisma',
        content: 'Prisma is a next-generation ORM that makes database access easy and type-safe. It provides a clean API for working with databases.',
        author: 'John Doe',
        published: true
      }
    }),
    prisma.post.create({
      data: {
        title: 'Building REST APIs with Express',
        content: 'Express.js is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.',
        author: 'Jane Smith',
        published: true
      }
    }),
    prisma.post.create({
      data: {
        title: 'PostgreSQL Best Practices',
        content: 'PostgreSQL is a powerful, open-source relational database system with a strong reputation for reliability and performance.',
        author: 'John Doe',
        published: false
      }
    }),
    prisma.post.create({
      data: {
        title: 'Deploying to Vercel',
        content: 'Vercel makes it incredibly easy to deploy modern web applications with zero configuration and automatic HTTPS.',
        author: 'Jane Smith',
        published: true
      }
    }),
    prisma.post.create({
      data: {
        title: 'TypeScript for Beginners',
        content: 'TypeScript adds static typing to JavaScript, making code more robust and easier to maintain in large applications.',
        author: 'John Doe',
        published: true
      }
    })
  ]);

  console.log(`✅ Created ${posts.length} posts\n`);

  posts.forEach((post, i) => {
    console.log(`   ${i + 1}. ${post.title} - by ${post.author} ${post.published ? '📗' : '📕'}`);
  });

  console.log('\n🎉 Database seeded successfully!\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
