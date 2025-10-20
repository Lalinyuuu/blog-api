import prisma from '../../utils/prisma.js';

// Share a post
export const sharePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { platform, message } = req.body;
    const userId = req.user.userId;

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, title: true, authorId: true }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Create share record
    const share = await prisma.share.create({
      data: {
        postId: postId,
        userId: userId,
        platform: platform || 'general',
        message: message || null
      }
    });

    // Create notification for post author (if not self)
    if (post.authorId !== userId) {
      try {
        await prisma.notification.create({
          data: {
            userId: post.authorId,
            type: 'share',
            postId: postId,
            fromUserId: userId,
            message: `${req.user.name} shared your post "${post.title}"`
          }
        });
      } catch (notificationError) {
        // Notification creation failed, but share was successful
      }
    }

    res.json({
      success: true,
      message: 'Post shared successfully',
      shareId: share.id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get share links for a post
export const getShareLinks = async (req, res) => {
  try {
    const { postId } = req.params;

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, title: true, slug: true }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Create share URL
    const shareUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/posts/${post.slug}`;
    
    const shareLinks = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${post.title} ${shareUrl}`)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`,
      line: `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}`
    };

    res.json({
      success: true,
      data: {
        shareUrl,
        shareLinks
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get shares for a post
export const getPostShares = async (req, res) => {
  try {
    const { postId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const [shares, totalCount] = await Promise.all([
      prisma.share.findMany({
        where: { postId: postId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.share.count({
        where: { postId: postId }
      })
    ]);

    res.json({
      success: true,
      data: {
        shares: shares.map(share => ({
          id: share.id,
          platform: share.platform,
          message: share.message,
          user: share.user,
          sharedAt: share.createdAt
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

// Get user's shared posts
export const getUserShares = async (req, res) => {
  try {
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const [shares, totalCount] = await Promise.all([
      prisma.share.findMany({
        where: { userId: userId },
        include: {
          post: {
            select: {
              id: true,
              title: true,
              slug: true,
              description: true,
              image: true,
              author: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  avatar: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.share.count({
        where: { userId: userId }
      })
    ]);

    res.json({
      success: true,
      data: {
        shares: shares.map(share => ({
          id: share.id,
          platform: share.platform,
          message: share.message,
          sharedAt: share.createdAt,
          post: share.post
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
