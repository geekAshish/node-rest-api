const fs = require('fs');
const path = require('path');
const {validationResult} = require('express-validator/check');

const Post = require('../models/post');
const User = require('../models/user')

exports.getPosts = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const size = req.query.size || 10;
  let totalItems;

  try {
    const totalItems = await Post.find().countDocuments()
    const posts = await Post.find().populate('creator').skip((currentPage - 1) * perPage).limit(size);

    res.status(200).json({message: 'Post Fetched successfully', posts: posts, totalItems: totalItems});
  } catch(error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.createPost = async (req, res, next) => {
  const error = validationResult(req); // it will detect ant validation error on req

  // checking error
  if (!error.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    throw error; // we don't need to use next(error) because it's syncrounus code and it'll automatically reaches error handling middleware
  }
  // checking image
  if(!req.file) {
    const error = new Error('No image provided.');
    error.statusCode = 422;
    throw error;
  }

  const imageUrl = req.file.path;
  const title = req.body.title;
  const content = req.body.content;
  let creator;
  const post = new Post({
    title: title,
    imageUrl: imageUrl,
    content: content,
    creator: req.userId,// userId is stored in our req in isAuth Middleware
  });
  // saving post object into database, it will return a promise
  try {
    const savePost = await post.save()
    const user = await User.findById(req.userId);

    creator = user;
    user.posts.push(post)
    await user.save();
    
    res.status(201).json({
      message: 'Post created successfully!',
      post: post,
      creator: { _id: creator._id, name: creator.name }
    })
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error); // we use next(error) because it's a async code, and will reaches error handling middleware
  }
};

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      if (!post) { // if post is not found
        const error = new Error('Could not find post')
        error.statusCode = 404;
        throw error; // we're in then block which is async and we are just throwing error because it'll caught by catch block where we're using next(error) and after it'll reach error middleware handler
      }
      res.status(200).json({message: 'Post messaged successfully!', post: post})
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    })
}

exports.updatePost = (req, res, next) => {
  const postId = req.params.postId;

  // checking error
  if (!error.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    throw error;
  }

  const title = req.body.title;
  const content = req.body.content;
  let imageUrl = req.body.image;
  if (req.file) {
    imageUrl = req.file.path;
  }
  if(!imageUrl) {
    const error = new Error('Please pick an image!');
    error.statusCode = 422;
    throw error;
  }

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error('Could not find post')
        error.statusCode = 404;
        throw error;
      }
      if(post.creator.toString() !== req.userId) {
        const error = new Error('Not Authorize')
        error.statusCode = 403; // authorization issue 403
        throw error;
      }
      if(imageUrl !== post.imageUrl) {
        clearImage(post.imageUrl);
      }
      post.title = title;
      post.content = content;
      post.imageUrl = imageUrl;
      return post.save();
    })
    .then((result) => {
      res.status(200).json({message: 'Post updated successfully!', post: result})
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    })
}

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error('Could not find post')
        error.statusCode = 404;
        throw error;
      }
      if(post.creator.toString() !== req.userId) {
        const error = new Error('Not Authorize')
        error.statusCode = 403; // authorization issue 403
        throw error;
      }
      // checked login user
      clearImage(post.imageUrl); // removing image from the local
      return Post.findByIdAndDelete(postId);
    })
    .then(() => {
      return User.findById(req.userId);
    })
    .then((user) => {
      user.posts.pull(postId) // we already deleted the image, but imageId will be stored
      return user.save();
    })
    .then(() => {
      res.status(200).json({message: 'Post Deleted successfully'});
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    })
}

const clearImage = filePath => {
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, error => console.log(error));
}
