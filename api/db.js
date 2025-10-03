import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

// Initialize database tables
export async function initDatabase() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS posts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        author VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Database initialized');
  } catch (error) {
    console.error('❌ Database init error:', error.message);
  }
}

// Get all posts
export async function getAllPosts() {
  return await sql`
    SELECT * FROM posts 
    ORDER BY created_at DESC
  `;
}

// Get post by ID
export async function getPostById(id) {
  const posts = await sql`
    SELECT * FROM posts 
    WHERE id = ${id}
  `;
  return posts[0];
}

// Create new post
export async function createPost({ title, content, author }) {
  const posts = await sql`
    INSERT INTO posts (title, content, author)
    VALUES (${title}, ${content}, ${author})
    RETURNING *
  `;
  return posts[0];
}

// Update post
export async function updatePost(id, { title, content, author }) {
  const posts = await sql`
    UPDATE posts 
    SET title = ${title}, content = ${content}, author = ${author}
    WHERE id = ${id}
    RETURNING *
  `;
  return posts[0];
}

// Delete post
export async function deletePost(id) {
  const posts = await sql`
    DELETE FROM posts 
    WHERE id = ${id}
    RETURNING *
  `;
  return posts[0];
}
