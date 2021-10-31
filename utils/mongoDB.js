const mongoose = require("mongoose");
const chalk = require('chalk')

async function mongoDB() {

  // const uri = "mongodb+srv://canza:canza@canzacluster.z6h5s.mongodb.net/CanzaCluster?retryWrites=true&w=majority";
  // const uri = "mongodb://localhost:27017/_canzaussd"

  try {
    // Connect to the MongoDB cluster
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true
    });

    console.log(`${chalk.green('✓')} ${chalk.blue('connected to database!')}`)
  } catch (e) {
    console.error(e);
  } finally {
    // await client.close();
  }
}

mongoDB();

