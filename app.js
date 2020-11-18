const express = require("express");
const app = express();
const bodyParser = require("body-parser");

const path = require("path");
const crypto = require("crypto");
const mongoose = require("mongoose");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const methodOverride = require("method-override");

//Middleware
app.use(bodyParser.json());
app.use(methodOverride("_method"));
app.set("view engine", "ejs");

//Mongo uri
const mongoURI =
  "mongodb+srv://harshal:harshal7797@test-cluster.1swf7.mongodb.net/demo?retryWrites=true&w=majority";

//create connection
const conn = mongoose.createConnection(mongoURI);

//init gfs
let gfs;
conn.once("open", () => {
  //init stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("uploads");
});

//create storage engine
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString("hex") + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: "uploads"
        };
        resolve(fileInfo);
      });
    });
  }
});
const upload = multer({ storage });
// @route GET /
// @desc Loads form
app.get("/", (req, res) => {
  gfs.files.find().toArray((err, files) => {
    // Check if files
    if (!files || files.length === 0) {
      res.render("index", { files: false });
    } else {
      files.map(file => {
        if (
          file.contentType === "image/jpeg" ||
          file.contentType === "image/png"
        ) {
          file.isImage = true;
        } else {
          file.isImage = false;
        }
      });
      res.render("index", { files: files });
    }
  });
});

// @route POST /upload
// @desc  Uploads file to DB
app.post("/upload", upload.single("file"), (req, res) => {
  //res.json({ file: req.file });
  res.redirect("/");
});

//@Route get all files
app.get("/files", (req, res) => {
  gfs.files.find().toArray((err, files) => {
    //check files
    if (!files || files.length === 0) {
      return res.status(404).json({ err: "no files exist" });
    }
    // Files exist
    return res.json(files);
  });
});

//delete
app.delete("/files/:id", (req, res) => {
  gfs.remove({ _id: req.params.id, root: "uploads" }, (err, gridStore) => {
    if (err) {
      res.status(404).json({ err: err });
    }
    res.redirect("/");
  });
});
// @route GET /files/:filename
// @desc  Display single file object
app.get("/files/:filename", (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    // Check if file
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: "No file exists"
      });
    }
    // File exists
    return res.json(file);
  });
});
// @route GET image
// @desc  Display single image
app.get("/image/:filename", (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    // Check if file
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: "No file exists"
      });
    }
    // check if image exists
    if (file.contentType === "image/jpeg" || file.contentType === "image/png") {
      //read outpto brow
      var readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
    } else {
      res.status(404).json({ err: "not an image" });
    }
  });
});

app.get("/", (req, res) => {
  res.render("index");
});

const port = 3000;
app.listen(port, () => {
  console.log(`server started on ${port}  successfully`);
});
