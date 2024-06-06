const mongoose =  require("mongoose");

// const user = require("./userSchema");

const postSchema = new mongoose.Schema(
    {
        title:{
            type: String,
            trim:true,
            required:[true,"Title is required"],

            minLength:[4,"Title must be atleast 4 characters long"],
        },

        media:{
            type: String,
            required:[true,"media is required"],

        },
        user:{ type: mongoose.Schema.Types.ObjectId, ref: "user" },

        // likes:[{type: mongoose.Schema.Types.ObjectId,ref:"user"}],

    },
    
    {timestamps: true}
);

const post = mongoose.model("post",postSchema);

module.exports = post;