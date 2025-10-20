import prisma from '../../utils/prisma.js';

// Save a post
export const savePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, title: true, authorId: true }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user already saved
    const existingSave = await prisma.savedPost.findUnique({
      where: {
        postId_userId: {
          postId: postId,
          userId: userId
        }
      }
    });

    if (existingSave) {
      return res.status(400).json({ error: 'Post already saved' });
    }

    // Add save
    const savedPost = await prisma.savedPost.create({
      data: {
        postId: postId,
        userId: userId
      }
    });

    res.json({
      success: true,
      message: 'Post saved successfully',
      isSaved: true,
      savedPostId: savedPost.id
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      details: error.code || 'Unknown error'
    });
  }
};

// Unsave a post
export const unsavePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;

    // Check if user already saved
    const existingSave = await prisma.savedPost.findUnique({
      where: {
        postId_userId: {
          postId: postId,
          userId: userId
        }
      }
    });

    if (!existingSave) {
      return res.status(400).json({ error: 'Post not saved yet' });
    }

    // Remove save
    await prisma.savedPost.delete({
      where: {
        postId_userId: {
          postId: postId,
          userId: userId
        }
      }
    });

    res.json({
      success: true,
      message: 'Post unsaved successfully',
      isSaved: false
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Check if user saved a post
export const checkSaveStatus = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;

    const savedPost = await prisma.savedPost.findUnique({
      where: {
        postId_userId: {
          postId: postId,
          userId: userId
        }
      }
    });

    res.json({
      success: true,
      isSaved: !!savedPost
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user's saved posts
export const getSavedPosts = async (req, res) => {
  try {
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const [savedPosts, totalCount] = await Promise.all([
      prisma.savedPost.findMany({
        where: { userId: userId },
        include: {
          post: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  avatar: true
                }
              },
              categoryRelation: {
                select: {
                  id: true,
                  name: true,
                  slug: true
                }
              },
              _count: {
                select: { likes: true, comments: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.savedPost.count({
        where: { userId: userId }
      })
    ]);

    res.json({
      success: true,
      data: {
        savedPosts: savedPosts.map(savedPost => ({
          id: savedPost.id,
          savedAt: savedPost.createdAt,
          post: {
            id: savedPost.post.id,
            title: savedPost.post.title,
            slug: savedPost.post.slug,
            description: savedPost.post.description,
            image: savedPost.post.image,
            viewCount: savedPost.post.viewCount,
            likesCount: savedPost.post._count.likes,
            commentsCount: savedPost.post._count.comments,
            createdAt: savedPost.post.createdAt,
            author: savedPost.post.author,
            category: savedPost.post.categoryRelation
          }
        })),
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
