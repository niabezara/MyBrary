const express = require("express");

const Book = require("../models/book");
const Author = require("../models/author");
const imageMimeTypes = ["image/jpeg", "image/png", "image/gif"];
const router = express.Router();

// all books Route
router.get("/", async (req, res) => {
  let query = Book.find();
  if (req.query.title != null && req.query.title != "") {
    query = query.regex("title", new RegExp(req.query.title, "i"));
  }
  if (req.query.publishedBefore != null && req.query.publishedBefore != "") {
    query = query.lte("publishedDate", req.query.publishedBefore);
  }
  if (req.query.publishedAfter != null && req.query.publishedAfter != "") {
    query = query.gte("publishedDate", req.query.publishedAfter);
  }
  try {
    const books = await query.exec();
    res.render("books/index", {
      books: books,
      searchOptions: req.query,
    });
  } catch {
    res.redirect("/");
  }
});

// new book route
router.get("/new", async (req, res) => {
  renderNewPage(res, new Book());
});

// create book route
router.post("/", async (req, res) => {
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    publishedDate: new Date(req.body.publishedDate),
    pageCount: req.body.pageCount,
    description: req.body.description,
  });

  saveCover(book, req.body.cover);

  try {
    const newBook = await book.save();
    res.redirect(`books/${newBook.id}`);
  } catch (error) {
    console.error("Error saving book:", error);
    renderNewPage(res, book, true);
  }
});

// update
router.put("/:id", async (req, res) => {
  let book;

  try {
    book = await Book.findById(req.params.id);
    book.title = req.body.title;
    book.author = req.body.author;
    book.publishedDate = new Date(req.body.publishedDate);
    book.pageCount = req.body.pageCount;
    book.description = req.body.description;
    if (req.body.cover != null && req.body.cover != "") {
      saveCover(book, req.body.cover);
    }
    await book.save();
    res.redirect(`/books/${book.id}`);
  } catch (error) {
    if (book != null) {
      renderEditPage(res, book, true);
    } else {
      redirect("/");
    }
  }
});

// show book route

router.get("/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate("author").exec();
    if (!book.author) {
      return res.redirect("/authors"); // Redirect to authors list or another appropriate page
    }
    res.render("books/show", { book: book });
  } catch {
    res.redirect("/");
  }
});

// edit

router.get("/:id/edit", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      console.error("Book not found with ID:", req.params.id);
      return res.redirect("/");
    }
    renderEditPage(res, book);
  } catch (error) {
    console.error("Error fetching book with ID:", req.params.id, error);
    res.redirect("/");
  }
});

router.delete("/:id", async (req, res) => {
  let book;
  try {
    book = await Book.findById(req.params.id);
    await book.deleteOne();
    res.redirect("/books");
  } catch {
    if (book != null) {
      res.render("books/show", {
        book: book,
        errorMessage: "error deleting book",
      });
    } else {
      res.redirect("/");
    }
  }
});

async function renderNewPage(res, book, hasError = false) {
  renderFormPage(res, book, "new", hasError);
}
async function renderEditPage(res, book, hasError = false) {
  renderFormPage(res, book, "edit", hasError);
}

function saveCover(book, coverEncoded) {
  if (coverEncoded == null) return;
  const cover = JSON.parse(coverEncoded);
  if (cover != null && imageMimeTypes.includes(cover.type)) {
    book.coverImage = new Buffer.from(cover.data, "base64");
    book.coverImageType = cover.type;
  }
}

async function renderFormPage(res, book, form, hasError = false) {
  try {
    const authors = await Author.find({});
    const params = { authors: authors, book: book };
    if (hasError) {
      if (form === "edit") {
        params.errorMessage = "error updating book";
      } else {
        params.errorMessage = "error creating book";
      }
    }
    if (hasError) params.errorMessage = "Error creating book";
    res.render(`books/${form}`, params);
  } catch (error) {
    console.error("Error rendering new page:", error);
    res.redirect("/books");
  }
}
module.exports = router;
