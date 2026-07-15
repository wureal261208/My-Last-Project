import mongoose from 'mongoose';

const uri =
  'mongodb://PhuNgo:Wureal261208%3A%29@ac-rnriwbn-shard-00-00.aumpr8e.mongodb.net:27017,ac-rnriwbn-shard-00-01.aumpr8e.mongodb.net:27017,ac-rnriwbn-shard-00-02.aumpr8e.mongodb.net:27017/?replicaSet=atlas-nij648-shard-0&authSource=admin&ssl=true';

mongoose.connect(uri, {
  serverSelectionTimeoutMS: 15000,
})
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => console.error('Could not connect to MongoDB', err));