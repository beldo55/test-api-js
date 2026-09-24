const { prisma } = require("../db");
const { sendSuccess } = require("../utils/api-response");
const { HttpError } = require("../utils/http-error");

async function listCommentsForPost(req, res, next) {
  try {
    const post = await prisma.post.findUnique({ where: { id: req.params.postId } });
    if (!post) throw HttpError.notFound("Post not found", "POST_NOT_FOUND");

    const comments = await prisma.comment.findMany({
      where: { postId: req.params.postId },
      orderBy: { createdAt: "asc" },
      include: { author: { select: { id: true, name: true } } },
    });

    return sendSuccess(res, {
      message: comments.length ? "Comments retrieved successfully" : "No comments yet — be the first to comment",
      data: comments,
    });
  } catch (err) {
    return next(err);
  }
}

async function createCommentForPost(req, res, next) {
  try {
    const post = await prisma.post.findUnique({ where: { id: req.params.postId } });
    if (!post) throw HttpError.notFound("Post not found", "POST_NOT_FOUND");

    const comment = await prisma.comment.create({
      data: {
        content: req.body.content,
        postId: req.params.postId,
        authorId: req.user.sub,
      },
      include: { author: { select: { id: true, name: true } } },
    });

    return sendSuccess(res, { statusCode: 201, message: "Comment added successfully", data: comment });
  } catch (err) {
    return next(err);
  }
}

module.exports = { listCommentsForPost, createCommentForPost };
