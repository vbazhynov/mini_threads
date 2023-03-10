/* eslint-disable operator-linebreak */
/* eslint-disable function-paren-newline */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable no-confusing-arrow */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { ActionType } from './common.js';

const loadPosts = createAsyncThunk(ActionType.SET_ALL_POSTS, async (filters, { extra: { services } }) => {
  const posts = await services.post.getAllPosts(filters);
  return { posts };
});

const loadMorePosts = createAsyncThunk(
  ActionType.LOAD_MORE_POSTS,
  async (filters, { getState, extra: { services } }) => {
    const {
      posts: { posts }
    } = getState();
    const loadedPosts = await services.post.getAllPosts(filters);
    const filteredPosts = loadedPosts.filter(post => !(posts && posts.some(loadedPost => post.id === loadedPost.id)));

    return { posts: filteredPosts };
  }
);

const applyPost = createAsyncThunk(
  ActionType.ADD_POST,
  async ({ id: postId, userId }, { getState, extra: { services } }) => {
    const {
      profile: { user }
    } = getState();
    if (userId === user.id) {
      return { post: null };
    }

    const post = await services.post.getPost(postId);
    return { post };
  }
);

const updatePost = createAsyncThunk(ActionType.UPDATE_POST, async (postPayload, { getState, extra: { services } }) => {
  const { id } = await services.post.updatePost(postPayload);
  const updatedPost = await services.post.getPost(id);
  const {
    posts: { posts, expandedPost }
  } = getState();

  const updatedPosts = posts.map(post => (post.id !== id ? post : updatedPost));
  const updatedExpandedPost = expandedPost?.id === id ? updatedPost : undefined;
  return { posts: updatedPosts, expandedPost: updatedExpandedPost };
});

const createPost = createAsyncThunk(ActionType.ADD_POST, async (post, { extra: { services } }) => {
  const { id } = await services.post.addPost(post);
  const newPost = await services.post.getPost(id);

  return { post: newPost };
});

const deletePost = createAsyncThunk(ActionType.DELETE_POST, async (id, { getState, extra: { services } }) => {
  const {
    posts: { posts, expandedPost }
  } = getState();
  const isPostDeleted = await services.post.deletePost(id);
  if (isPostDeleted) {
    const updated = posts.filter(post => post.id !== id);
    const updatedExpandedPost = expandedPost && undefined;
    return { posts: updated, expandedPost: updatedExpandedPost };
  }
  return { posts, expandedPost };
});

const toggleExpandedPost = createAsyncThunk(ActionType.SET_EXPANDED_POST, async (postId, { extra: { services } }) => {
  const post = postId ? await services.post.getPost(postId) : undefined;
  return { post };
});

const togglePostToEdit = createAsyncThunk(ActionType.SET_POST_TO_EDIT, async (postId, { extra: { services } }) => {
  const post = postId ? await services.post.getPost(postId) : undefined;
  return { post };
});

const reactPost = createAsyncThunk(ActionType.REACT, async (data, { getState, extra: { services } }) => {
  const { postId, isLike } = data;
  const { likeCount, dislikeCount } = isLike
    ? await services.post.likePost(postId)
    : await services.post.dislikePost(postId);
  const mapLikes = post => ({
    ...post,
    likeCount,
    dislikeCount
  });

  const {
    posts: { posts, expandedPost }
  } = getState();
  const updated = posts.map(post => (post.id !== postId ? post : mapLikes(post)));
  const updatedExpandedPost = expandedPost?.id === postId ? mapLikes(expandedPost) : undefined;

  return { posts: updated, expandedPost: updatedExpandedPost };
});

const updateReactions = createAsyncThunk(
  ActionType.UPDATE_REACTIONS,
  async ({ likeCount, dislikeCount, postId }, { getState }) => {
    const mapLikes = post => ({
      ...post,
      likeCount,
      dislikeCount
    });
    const {
      posts: { posts, expandedPost }
    } = getState();
    const updated = posts.map(post => (post.id !== postId ? post : mapLikes(post)));
    const updatedExpandedPost = expandedPost?.id === postId ? mapLikes(expandedPost) : undefined;
    return { posts: updated, expandedPost: updatedExpandedPost };
  }
);

const addComment = createAsyncThunk(ActionType.COMMENT, async (request, { getState, extra: { services } }) => {
  const { id } = await services.comment.addComment(request);
  const comment = await services.comment.getComment(id);

  const mapComments = post => ({
    ...post,
    commentCount: Number(post.commentCount) + 1,
    comments: [...(post.comments || []), comment] // comment is taken from the current closure
  });

  const {
    posts: { posts, expandedPost }
  } = getState();
  const updated = posts.map(post => (post.id !== comment.postId ? post : mapComments(post)));

  const updatedExpandedPost = expandedPost?.id === comment.postId ? mapComments(expandedPost) : undefined;

  return { posts: updated, expandedPost: updatedExpandedPost };
});

export {
  loadPosts,
  loadMorePosts,
  applyPost,
  updatePost,
  createPost,
  deletePost,
  toggleExpandedPost,
  togglePostToEdit,
  reactPost,
  updateReactions,
  addComment
};
