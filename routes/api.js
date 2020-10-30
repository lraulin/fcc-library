/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

var expect = require("chai").expect;
const mongoose = require("mongoose");
var ObjectId = require("mongodb").ObjectId;
require("dotenv").config;
const { INTERNAL_SERVER_ERROR, OK, NOT_FOUND } = require("http-status-codes");
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

const bookSchema = new mongoose.Schema({
  title: String,
  comments: Array[String],
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

const makeBooksResponse = ({ _id, title, comments = [] }) => ({
  _id,
  title,
  commentCount: commentCount.length,
});

module.exports = function (app) {
  app
    .route("/api/books")
    .get(async (req, res) => {
      try {
        const books = await Book.find().select("_id title comments").ekec();
        if (books) {
          const resBody = books.map(makeBooksResponse);
          return res.status(OK).send(resBody);
        }
        res.status(OK).send([]);
      } catch (error) {
        handleError(error, res);
      }
    })

    .post(async (req, res) => {
      const title = req.body.title;
      try {
        const book = await Book.create({ title });
        const { _id, title } = book;
        res.status(OK).send({ _id, title });
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
