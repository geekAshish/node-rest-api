# Fetching list of post
# Adding a create post API

# Adding server side validation
npm i express-validator

# Setting Up a Post Model
npm i mongoose

const mongoose = require('mongoose');

mongoose.connect('').then(() => {
    app.listen(8080);
}).catch((err) => {
    console.log(err);
})

module/post.js --> create post schema

# Storing post in Database
- importing post model in feed controller

# Static Images
In app.js file

const path = require('path');

app.use('/images', express.static(path.join(__dirname, 'images')));

# Error Handling

# Fetching single post

# Uploading images
npm i multer

app.js file
const multer = require('multer');


# Updating posts

# Deleting posts

# creating user models

# Adding user signUp validation

# Signing user up
- encrypting user password : npm i bcryptjs

# How does Authentication works?

# User login

# Logging in and creating JWT
npm i jsonwebtoken

in auth.js controller
const jwt = require('jsonwebtoken');

const token = jwt.sign({
    email: loadedUser.email,
    userId: loadedUser._id.toString(),
}, 'someSuperSecretSecreteKey', {expiresIn: '1hr'})

# Using & Validating the Token
Creating a middleware folder

# Connecting Posts & Users

# Adding Authorization Checks

# Clearing post-user relation
After deleting post we should also delete post-key which user holds
