"use strict";

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const {
  INTERNAL_SERVER_ERROR,
  OK,
  NOT_FOUND,
  BAD_REQUEST,
} = require("http-status-codes");

const { MONGO_URI } = process.env;

console.log(MONGO_URI);

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const bookSchema = new mongoose.Schema({
  title: String,
  comments: [String],
});

const Book = mongoose.model("Book", bookSchema);

const handleError = (error, res) => {
  console.log(error);
  res
    .status(INTERNAL_SERVER_ERROR)
    .send({ success: false, message: "Something went wrong..." });
};

const makeBookResponse = ({ _id, title, comments = [] }) => ({
  _id,
  title,
  comments,
});

const makeBookCommentCountResponse = ({ _id, title, comments = [] }) => ({
  _id,
  title,
  commentcount: comments.length,
});

module.exports = function (app) {
  app
    .route("/api/books")
    .get(async (req, res) => {
      try {
        const books = await Book.find().select("_id title comments").exec();
        if (books) {
          const resBody = books.map(makeBookCommentCountResponse);
          return res.status(OK).send(resBody);
        }
        res.status(OK).send([]);
      } catch (error) {
        handleError(error, res);
      }
    })

    .post(async (req, res) => {
      const { title } = req.body;
      if (!title) {
        return res.status(BAD_REQUEST).send("missing title");
      }
      try {
        const book = await Book.create({ title });
        res.status(OK).send({ _id: book._id, title: book.title });
      } catch (error) {
        handleError(error, res);
      }
    })

    .delete(async (req, res) => {
      try {
        await Book.deleteMany({}).exec();
        res.status(OK).send("complete delete successful");
      } catch (error) {
        handleError(error, res);
      }
    });

  app
    .route("/api/books/:id")
    .get(async (req, res) => {
      const { id } = req.params;

      try {
        const book = await Book.findById(id)
          .select("_id title comments")
          .exec();
        if (!book) {
          return res.status(NOT_FOUND).send("no book exists");
        }
        res.status(OK).send(makeBookResponse(book));
      } catch (error) {
        handleError(error, res);
      }
    })

    .post(async (req, res) => {
      const { id } = req.params;
      const { comment } = req.body;

      try {
        const book = await Book.findById(id).exec();
        if (!book.comments) {
          book.comments = [];
        }
        book.comments.push(comment);
        await book.save();
        res.status(OK).send(makeBookResponse(book));
      } catch (error) {
        handleError(error, res);
      }
    })

    .delete(async (req, res) => {
      const { id } = req.params;

      try {
        const book = await Book.findByIdA(id);
        if (!book) {
          res.status(NOT_FOUND).send("no book exists");
        }
        await book.delete();
        res.status(OK).send("delete successful");
      } catch (error) {
        handleError(error, res);
      }
    });
};
