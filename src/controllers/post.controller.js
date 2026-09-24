const { prisma } = require("../db");
const { sendSuccess } = require("../utils/api-response");
const { HttpError } = require("../utils/http-error");

const authorSelect = { select: { id: true, name: true } };

async function listPosts(req, res, next) {
  try {
    const { page, limit, search, authorId } = req.query;

    const where = {
      published: true,
      AND: [
        search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { content: { contains: search, mode: "insensitive" } },
              ],
            }
          : {},
        authorId ? { authorId } : {},
      ],
    };

    const [items, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: { author: authorSelect, _count: { select: { comments: true } } },
      }),
      prisma.post.count({ where }),
    ]);

    return sendSuccess(res, {
      message: items.length ? "Posts retrieved successfully" : "No posts found",
      data: items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function getPost(req, res, next) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: req.params.id },
      include: { author: authorSelect, _count: { select: { comments: true } } },
    });

    if (!post) throw HttpError.notFound("Post not found", "POST_NOT_FOUND");

    return sendSuccess(res, { message: "Post retrieved successfully", data: post });
  } catch (err) {
    return next(err);
  }
}

async function createPost(req, res, next) {
  try {
    const post = await prisma.post.create({
      data: { ...req.body, authorId: req.user.sub },
      include: { author: authorSelect },
    });

    return sendSuccess(res, { statusCode: 201, message: "Post created successfully", data: post });
  } catch (err) {
    return next(err);
  }
}

async function updatePost(req, res, next) {
  try {
    const existing = await prisma.post.findUnique({ where: { id: req.params.id } });
    if (!existing) throw HttpError.notFound("Post not found", "POST_NOT_FOUND");

    if (existing.authorId !== req.user.sub && req.user.role !== "ADMIN") {
      throw HttpError.forbidden("You can only edit your own posts");
    }

    const post = await prisma.post.update({
      where: { id: req.params.id },
      data: req.body,
      include: { author: authorSelect },
    });

    return sendSuccess(res, { message: "Post updated successfully", data: post });
  } catch (err) {
    return next(err);
  }
}

async function deletePost(req, res, next) {
  try {
    const existing = await prisma.post.findUnique({ where: { id: req.params.id } });
    if (!existing) throw HttpError.notFound("Post not found", "POST_NOT_FOUND");

    if (existing.authorId !== req.user.sub && req.user.role !== "ADMIN") {
      throw HttpError.forbidden("You can only delete your own posts");
    }

    await prisma.post.delete({ where: { id: req.params.id } });

    return sendSuccess(res, { message: "Post deleted successfully" });
  } catch (err) {
    return next(err);
  }
}

module.exports = { listPosts, getPost, createPost, updatePost, deletePost };
