import mongoose from "mongoose";

const uri = "mongodb://tanmayagl2006_db_user:tanmay2312@ac-45flojt-shard-00-00.3umwn44.mongodb.net:27017,ac-45flojt-shard-00-01.3umwn44.mongodb.net:27017,ac-45flojt-shard-00-02.3umwn44.mongodb.net:27017/community-hero?ssl=true&replicaSet=atlas-45flojt-shard-0&authSource=admin&retryWrites=true&w=majority";

mongoose.connect(uri)
  .then(() => {
    console.log("Connected successfully");
    process.exit(0);
  })
  .catch(err => {
    console.error("Connection failed:", err.message);
    process.exit(1);
  });
