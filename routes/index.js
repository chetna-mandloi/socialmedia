var express = require("express")
var router = express.Router();

// const upload = require("../utils/multer").single("profilepic");
const upload = require("../utils/multer");
const fs = require("fs");
const path = require("path");

// in index.js use strategy //

const post = require("../models/postSchema");

const User = require("../models/userSchema");

const passport = require("passport");

const LocalStrategy = require("passport-local");

// nodemailer //
const sendmail = require("../utils/mail");
const { log } = require("console");

passport.use(new LocalStrategy(User.authenticate()));



/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { user: req.user });
});

router.get("/register", function (req, res, next) {
  res.render("register", { user: req.user });
});

router.post("/register-user", async function (req, res, next) {
  try {
    // const newUser = new User(req.body);
    //  await newUser.save();

    const { username, email, name, password } = req.body;
    await User.register({ name, username, email }, password),
  
      res.redirect("/login");
  
  } catch (error) {
    res.send(error);
  }
});
router.get("/login", function (req, res, next) {
  res.render("login", { user: req.user });
});

router.post(
  "/login-user",
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/login",
  }),

  function (req, res, next) {}
);

router.get("/about", function (req, res, next) {
  res.render("about", { user: req.user });
});

// router.get("/profile", isLoggedIn, function (req, res, next) {
//   console.log(req.user);
//   res.render("profile",{ user: req.user});
// });

router.get("/profile", isLoggedIn, async function (req, res, next) {
  try {
    const posts = await post.find().populate("User");
    res.render("profile", { User: req.user, posts });
} catch (error) {
    res.send(error);
}
});



router.get("/timeline", isLoggedIn, async function(req,res,next){
  try{
    // const u = await req.user.populate("posts")
    // console.log(u);
    res.render("timeline",{user: await req.user.populate("posts") });
  } catch(error) {
    res.send(error)
  }
});




router.get("/update-user/:id", isLoggedIn, function (req, res, next) {
  res.render("userupdate", { user:req.user });
});

router.get("/reset-password/:id", isLoggedIn, function (req, res, next) {
  res.render("resetpassword", { user: req.user });
});

router.post("/reset-password/:id", isLoggedIn, async function (req, res, next) {
  try {
    await req.user.changePassword(req.body.oldpassword, req.body.newpassword);
    req.user.save();
    res.redirect(`/userupdater/${req.user._id}`);
  } catch (error) {
    res.send(error);
  }
});

// router.post("/image/:id", isLoggedIn, upload, async function (req, res, next) {
//   try {
//     if (req.user.profilepic !== "default.jpeg") {
//       fs.unlinkSync(
//         path.join(
// __dirname,
// "..",
//   "public",
//    "images",
//    req.user.profilepic)
//       );
//     }
// console.log("ggdgdg");

router.post("/image/:id",isLoggedIn,upload.single("profilepic"),async function (req, res, next) {

    try {

      if (req.user.profilepic !== "default.jpeg") {

        fs.unlinkSync(

          path.join(__dirname, "..", "public", "images", req.user.profilepic

          )
        );
      }
      req.user.profilepic = req.file.filename;
      await req.user.save();
      res.redirect(`/update-user/${req.params.id}`);
    } catch (error) {
      res.send(err);
    }
  }
);

// like post //

router.get("/like/:postid", isLoggedIn, async function(req,res,next){
  try{
    const post = await post.findById(req.params.postid);
    if(post.likes.includes(req.user._id)) {
      post.likes = post.likes.filter((uid) => uid != req.user.id);

    } else {
      post.likes.push(req.user._id)
    }
    await post.save();
    res.redirect("/profile");
  } catch(error){
    res.send(error)
  }
});




// delete //

router.get("/delete-user/:id", isLoggedIn, async function (req, res, next) {
  try {
    const deleteduser = await User.findByIdAndDelete(req.params.id);

    if(deleteduser.profilepic !== "default.jpeg"){
      fs.unlinkSync(
        path.join(
          __dirname,
          "..",
          "public",
          "images",
          deleteduser.profilepic)

    );
    }


    deleteduser.posts.forEach(async (postid) => {
      const deletepost = await post.findByIdAndDelete(postid);
      console.log(deletepost);
      fs.unlinkSync(path.join(__dirname,"..","public","images",deletepost.media

      )
    );
    });

    res.redirect("/login");
  } catch (error) {
    res.send(error);
  }
});

// nodemail //

    //  if (deleteduser.profilepic !== "default.jpeg") {
    //   fs.unlinkSync(
    //     path.join(__dirname, "..", "public", "imagse", deleteduser.profilepic)
    //   );
    // }

router.get("/post-create/", isLoggedIn, function(req,res,next){
  res.render("postcreate",{user: req.user});
});

router.post("/post-create/", isLoggedIn, upload.single("media"), async function(req,res,next){
  try {
    const newpost = new post ({
      title: req.body.title, 
      media: req.file.filename,
      user:  req.user._id,
    });

    // const user = await User.findOne({
    //   _id:req.user._id
    // })
    
    req.user.posts.push(newpost._id);

    await newpost.save();
    await req.user.save()

    res.redirect("/profile");

  } catch (error) {
    // console.log(error);
    res.send(error);
  }
}
);

router.get("/delete-post/:id", isLoggedIn, async function(req,res,next){
  try{
    const deletepost = await post.findByIdAndDelete(req.params.id);

    fs.unlinkSync(
      path.join(
        __dirname,
        "..",
        "public",
        "images",
         deletepost.media)
  );
  res.redirect("/timeline");

  } catch (error){
    res.send(error);
  }
});

router.get("/logout-user/:id", isLoggedIn, function (req, res, next) {
  req.logout(() => {
    res.redirect("/login");
  });
});

router.get("/forget-email", function (req, res, next) {
  res.render("userforgetemail", { user: req.user });
});

router.post("/forget-email", async function (req, res, next) {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {

       const url = `${req.protocol}://${req.get("host")}/forget-password/${
         user._id
       }`;

      // nodemail

      // sendmail(res, req.body.email, user);
      sendmail(req,user,url);

      // res.redirect(`forget-password`);
    } else {
      res.redirect("forget-email");
    }
  } catch (error) {
    res.send(error);
  }
});

router.get("/forget-password/:id", function (req, res, next) {
  res.render("userforgetpassword", { user: req.user, id: req.params.id });
});

router.post("/forget-password/:id", async function (req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    // await user.setPassword(req.body.password);
    // await user.save();

    // nodemail

    if (user.resetPasswordToken === 1) {
      await user.setpassword(req.body.password);
      user.resetpasswordToken = 0;

      await user.save();

      res.redirect("/login");
    } else {
      res.send("Link Expired Try Again!");
    }
  } catch (error) {
    res.send(error);
  }
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect("/login");
  }
}

module.exports = router;
