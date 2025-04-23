const Pet = require('../models/petsSchema');
const User = require('../models/userSchema');
const Feed =require('../models/feedShema');
const mongoose = require('mongoose');
const {S3Client,DeleteObjectCommand}=require('@aws-sdk/client-s3');

const s3 = new S3Client({
    region: process.env.AWS_DEFAULT_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});


class feedController{
    
    async postFeed(req,res){
        try {
            const {description, userId, petId}= req.body;
            
            const newPost = new Feed({
                description,
                feedImg: req.file.key,
                userId,
                petId
            });

            await newPost.save();

            await User.findByIdAndUpdate(userId,{$push:{yourFeed:newPost._id}});
            await Pet.findByIdAndUpdate(petId,{$push:{yourFeed:newPost._id}});

            res.status(201).send(newPost);

        } catch (error) {
            console.error(error);
        }
    }

    async addComment(req, res) {
        try {
          const { feedId } = req.params;
          const { userId, text } = req.body;
      
          if (!text || !userId) {
            return res.status(400).json({ error: 'Comentário e usuário são obrigatórios.' });
          }
      
          const comment = {
            userId,
            text,
            createdAt: new Date()
          };
      
          const updatedFeed = await Feed.findByIdAndUpdate(
            feedId,
            { $push: { comments: comment } },
            { new: true }
          ).populate('comments.userId', 'username');
      
          res.status(200).json(updatedFeed);
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Erro ao adicionar comentário.' });
        }
      }
      
}

module.exports = {feedController};