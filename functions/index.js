//index.js

const functions = require('firebase-functions');
const app = require('express')();
const auth = require('./util/auth');

const {
    getAllProduce,
    postOneProduce,
    getOneProduce,
    deleteProduce,
    editProduce,
} = require('./APIs/produce')

exports.api = functions.https.onRequest(app);
app.get('/produce', auth, getAllProduce);
app.get('/produce/:produceId', auth, getOneProduce);
app.post('/produce', auth, postOneProduce);
app.delete('/produce/:produceId', auth, deleteProduce);
app.put('/produce/:produceId', auth, editProduce);

const {
    loginUser,
    signUpUser,
    uploadProfilePhoto,
    getUserDetail,
    updateUserDetails
} = require('./APIs/users')

// Users
app.post('/login', loginUser);
app.post('/signup', signUpUser);
app.post('/user/image', auth, uploadProfilePhoto);
app.get('/user', auth, getUserDetail);
app.post('/user', auth, updateUserDetails);

