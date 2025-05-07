const Pet = require('../models/petsSchema');
const User = require('../models/userSchema');
const Feed = require('../models/feedShema');
const mongoose = require('mongoose');
const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
    region: process.env.AWS_DEFAULT_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

class feedController {
    
    async postFeed(req, res) {
        try {
            const { description, userId, petId } = req.body;

            const newPost = new Feed({
                description,
                feedImg: req.file?.key,
                userId,
                petId
            });

            await newPost.save();

            await User.findByIdAndUpdate(userId, { $push: { yourFeed: newPost._id } });
            await Pet.findByIdAndUpdate(petId, { $push: { yourFeed: newPost._id } });

            res.status(201).json(newPost);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao criar o feed.' });
        }
    }

    
    async getAllFeeds(req, res) {
      try {
          const feeds = await Feed.find()
              .populate('userId', 'username')
              .populate('petId', 'name')
              .populate('comments.userId', 'username');
  
          // Mapear os feeds para incluir o contador de likes
          const feedsWithLikeCount = feeds.map(feed => ({
              ...feed.toObject(),
              likeCount: feed.likes.length
          }));
  
          res.status(200).json(feedsWithLikeCount);
      } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Erro ao buscar os feeds.' });
      }
  }
  

    
    async getFeedById(req, res) {
      try {
          const { id } = req.params;
          const feed = await Feed.findById(id)
              .populate('userId', 'username')
              .populate('petId', 'name')
              .populate('comments.userId', 'username');

          if (!feed) return res.status(404).json({ error: 'Feed não encontrado.' });

          const feedWithLikeCount = {
              ...feed.toObject(),
              likeCount: feed.likes.length
          };

          res.status(200).json(feedWithLikeCount);
      } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Erro ao buscar o feed.' });
      }
  }


  
    async updateFeed(req, res) {
        try {
            const { id } = req.params;
            const { description } = req.body;

            const updatedFeed = await Feed.findByIdAndUpdate(
                id,
                { description },
                { new: true }
            );

            if (!updatedFeed) return res.status(404).json({ error: 'Feed não encontrado.' });

            res.status(200).json(updatedFeed);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao atualizar o feed.' });
        }
    }

    // DELETE
    async deleteFeed(req, res) {
        try {
            const { id } = req.params;
            const feed = await Feed.findById(id);
            if (!feed) return res.status(404).json({ error: 'Feed não encontrado.' });

            // Remove imagem do S3
            if (feed.feedImg) {
                const deleteParams = {
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: feed.feedImg,
                };

                await s3.send(new DeleteObjectCommand(deleteParams));
            }

            await Feed.findByIdAndDelete(id);

            // Remove do usuário e do pet
            await User.findByIdAndUpdate(feed.userId, { $pull: { yourFeed: feed._id } });
            await Pet.findByIdAndUpdate(feed.petId, { $pull: { yourFeed: feed._id } });

            res.status(200).json({ message: 'Feed deletado com sucesso.' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao deletar o feed.' });
        }
    }

    async toggleLike(req, res) {
      try {
          const { id } = req.params; 
          const { userId } = req.body;
  
          const feed = await Feed.findById(id);
          if (!feed) return res.status(404).json({ error: 'Post não encontrado.' });
  
          const alreadyLiked = feed.likes.includes(userId);
  
          if (alreadyLiked) {
              // Descurtir
              feed.likes.pull(userId);
          } else {
              // Curtir
              feed.likes.push(userId);
          }
  
          await feed.save();
  
          res.status(200).json({
              message: alreadyLiked ? 'Descurtido com sucesso.' : 'Curtido com sucesso.',
              totalLikes: feed.likes.length,
              likes: feed.likes
          });
      } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Erro ao processar like.' });
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
