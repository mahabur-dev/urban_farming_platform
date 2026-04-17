import { Prisma } from '@prisma/client';
import AppError from '../../error/appError';
import prisma from '../../db/prisma';
import pagination, { IOption } from '../../helper/pagenation';
import { ICreateCommunityPost, IUpdateCommunityPost, ICommunityPostFilter } from './communityPost.interface';

const createPost = async (userId: string, payload: ICreateCommunityPost) => {
  return prisma.communityPost.create({
    data: { userId, ...payload },
    include: { user: { select: { id: true, name: true, profileImage: true } } },
  });
};

const getAllPosts = async (params: ICommunityPostFilter, options: IOption) => {
  const { page, limit, skip, sortBy, sortOrder } = pagination(options);
  const { searchTerm } = params;

  const whereCondition: Prisma.CommunityPostWhereInput = searchTerm
    ? { postContent: { contains: searchTerm, mode: 'insensitive' } }
    : {};

  const [data, total] = await Promise.all([
    prisma.communityPost.findMany({
      where: whereCondition,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: { user: { select: { id: true, name: true, profileImage: true } } },
    }),
    prisma.communityPost.count({ where: whereCondition }),
  ]);

  return { data, meta: { total, page, limit } };
};

const getPostById = async (id: string) => {
  const post = await prisma.communityPost.findUnique({
    where: { id },
    include: { user: { select: { id: true, name: true, profileImage: true } } },
  });
  if (!post) throw new AppError(404, 'Post not found');
  return post;
};

const updatePost = async (id: string, userId: string, payload: IUpdateCommunityPost) => {
  const post = await prisma.communityPost.findUnique({ where: { id } });
  if (!post) throw new AppError(404, 'Post not found');
  if (post.userId !== userId) throw new AppError(403, 'Unauthorized');
  return prisma.communityPost.update({ where: { id }, data: payload });
};

const deletePost = async (id: string, userId: string, userRole: string) => {
  const post = await prisma.communityPost.findUnique({ where: { id } });
  if (!post) throw new AppError(404, 'Post not found');
  if (userRole !== 'admin' && post.userId !== userId) throw new AppError(403, 'Unauthorized');
  return prisma.communityPost.delete({ where: { id } });
};

export const communityPostService = {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
};
