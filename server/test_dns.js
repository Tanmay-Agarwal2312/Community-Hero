import mongoose from "mongoose";
import dns from "dns";

// Force Google DNS for Node
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const uri = "mongodb+srv://tanmayagl2006_db_user:tanmay2312@cluster0.3umwn44.mongodb.net/community-hero?retryWrites=true&w=majority";

console.log("Attempting to connect with forced DNS...");
mongoose.connect(uri)
  .then(() => {
    console.log("Connected successfully");
    process.exit(0);
  })
  .catch(err => {
    console.error("Connection failed:", err.message);
    process.exit(1);
  });
