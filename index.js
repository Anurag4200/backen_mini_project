const express = require("express");
const app = express();
const path = require("path");
const User = require("./models/user");
const Post = require("./models/post");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const upload=require("./config/multer");



const port = 3000;

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.render("home");
});
app.post("/register", (req, res) => {
  const { name, email, password, age } = req.body;
  bcrypt.genSalt(10, function (err, salt) {
    bcrypt.hash(password, salt, async function (err, hash) {
      const newUser = await new User({
        name,
        email,
        password: hash,
        age,
      });
      var token = jwt.sign({ email: email, userId: newUser._id }, "shhhhh");
      res.cookie("token", token);
      await newUser.save();
      res.send(newUser);
    });
  });
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const userExist = await User.findOne({ email: email });
  if (!userExist) return res.send("something went wrong");
  bcrypt.compare(password, userExist.password, function (err, result) {
    if (result) {
      var token = jwt.sign({ email: email, userId: userExist._id }, "shhhhh");
      res.cookie("token", token);
      res.redirect("profile");
    } else {
      res.send("something went wrong");
    }
  });
});

app.get("/logout", (req, res) => {
  res.cookie("token", "");
  res.redirect("/login");
});

app.get("/profile", isLoggedIn, async (req, res) => {
  const user = await User.findOne({ _id: req.user.userId });
  const post = await Post.find({ user: user._id });
  // console.log(post);
  res.render("profile", { user, post });
});

app.post("/post/create", isLoggedIn, async (req, res) => {
  const { content } = req.body;
  const user = await User.findOne({ email: req.user.email });
  const newPost = await new Post({
    postData: content,
    user: user._id,
  });
  user.post.push(newPost._id);
  await newPost.save();
  await user.save();
  res.redirect("/profile");
});

app.get("/delete/:id", isLoggedIn, async (req, res) => {
  const deleatedPost = await Post.findOneAndDelete({ _id: req.params.id });
  const user = await User.findOne({ _id: req.user.userId });
  user.post.splice(user.post.indexOf(user._id), 1);
  await user.save();
  // console.log(deleatedPost);
  res.redirect("/profile");
});
app.get("/edit/:id", isLoggedIn, async (req, res) => {
  const editPost = await Post.findOne({ _id: req.params.id });
  // console.log(editPost)
  res.render("edit", { editPost });
});

app.post("/update/:id", async (req, res) => {
  const { content } = req.body;
  const updatedPost = await Post.findOneAndUpdate(
    { _id: req.params.id },
    { postData: content },
    { new: true }
  );
  res.redirect("/profile");
});
app.get("/like/:id", isLoggedIn, async (req, res) => {
  const post = await Post.findOne({ _id: req.params.id });
  if (post.likes.indexOf(post.user) === -1) {
    post.likes.push(post.user);
  } else {
    post.likes.splice(post.likes.indexOf(post.user), 1);
  }
  await post.save();
  res.redirect("/profile");
});
app.get("/upload",(req,res)=>{
  res.render("uploads");
})
app.post("/upload", isLoggedIn,upload.single("image"),async (req, res) => {
  const user=await User.findOne({_id:req.user.userId});
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  user.profile=req.file.filename;
  await user.save();
  res.redirect("/profile");
});

function isLoggedIn(req, res, next) {
  const token = req.cookies.token;
  if (token === "") return res.send("you need to login ");
  jwt.verify(token, "shhhhh", (err, data) => {
    if (err) return res.send("you need to login ");
    req.user = data;
    next();
  });
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
