const express = require("express");
const app = express();

const path = require("path");
const crypto = require("crypto");
const mongoose = require("mongoose");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const methodOverride = require("method-override");
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index");
});

const port = 3000;
app.listen(port, () => {
  console.log(`server started on ${port}  successfully`);
});
