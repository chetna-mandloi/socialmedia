const mongoose = require("mongoose");

mongoose
  .connect("mongodb://127.0.0.1:27017/socialmedia09")
  .then(() => console.log("db connected!"))
  .catch((err) => console.log(err.message));

// const mongoose = require("mongoose")

// mongoose.connect("mongodb://0.0.0.0/socialmedia9").then(()=>console.log("connect"))
