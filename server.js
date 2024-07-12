if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const expressLayout = require("express-ejs-layouts");
const indexRouter = require("./routes/index");
const authorsRouter = require("./routes/authors");
const bookRouter = require("./routes/books");
const bodyParser = require("body-parser");

const app = express();
mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
});
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("connected db"));

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.set("layout", "layouts/layout");

app.use(expressLayout);
app.use(methodOverride("_method"));
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/authors", authorsRouter);
app.use("/books", bookRouter);

app.listen(3000, () => {
  console.log("Shop is open on port 3000");
});
