const { MongoMemoryServer } = require('mongodb-memory-server');
const mongod = new MongoMemoryServer();

const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);

// tell mongoose to use ES6 implementation of promises
mongoose.Promise = global.Promise;

async function removeAllCollections() {
  const collections = Object.keys(mongoose.connection.collections);
  for (const collectionName of collections) {
    const collection = mongoose.connection.collections[collectionName];
    await collection.deleteMany();
  }
}

async function dropAllCollections() {
  const collections = Object.keys(mongoose.connection.collections);
  for (const collectionName of collections) {
    const collection = mongoose.connection.collections[collectionName];
    try {
      await collection.drop();
    } catch (error) {
      // Sometimes this error happens, but you can safely ignore it
      if (error.message === 'ns not found') return;
      // This error occurs when you use it.todo. You can
      // safely ignore this error too
      if (error.message.includes('a background operation is currently running'))
        return;
      console.log(error.message);
    }
  }
}

module.exports = {
  setupDB(DB_URL) {
    // connect to mongoose
    beforeAll(async () => {
      const url = await mongod.getConnectionString();
      const opts = {
        useUnifiedTopology: true,
        useNewUrlParser: true
      };
      await mongoose.connect(url, opts);
    });

    // Cleans up database between each test
    afterEach(async () => {
      await removeAllCollections();
    });

    // Disconnect Mongoose
    afterAll(async () => {
      await dropAllCollections();
      await mongoose.connection.close();
      await mongod.stop();
    });
  }
};
