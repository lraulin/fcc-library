const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  test("#example Test GET /api/books", function (done) {
    chai
      .request(server)
      .get("/api/books")
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body, "response should be an array");
        assert.property(
          res.body[0],
          "commentcount",
          "Books in array should contain commentcount"
        );
        assert.property(
          res.body[0],
          "title",
          "Books in array should contain title"
        );
        assert.property(
          res.body[0],
          "_id",
          "Books in array should contain _id"
        );
        done();
      });
  });

  suite("Routing tests", function () {
    suite(
      "POST /api/books with title => create book object/expect book object",
      function () {
        test("Test POST /api/books with title", function (done) {
          const bookToCreate = { title: "The Cat in the Hat" };
          chai
            .request(server)
            .post("/api/books")
            .send(bookToCreate)
            .end(function (err, res) {
              assert.equal(res.status, 200);
              assert.property(res.body, "_id", "Book should contain _id");
              assert.property(res.body, "title", "Book should contain title");
              done();
            });
        });

        test("Test POST /api/books with no title given", function (done) {
          chai
            .request(server)
            .post("/api/books")
            .send()
            .end(function (err, res) {
              assert.equal(res.status, 400);
              assert.equal(
                res.text,
                "missing title",
                "Message should say missing title"
              );
              done();
            });
        });
      }
    );

    suite("GET /api/books => array of books", function () {
      test("Test GET /api/books", function (done) {
        chai
          .request(server)
          .get("/api/books")
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body, "response should be an array");
            assert.property(
              res.body[0],
              "commentcount",
              "Books in array should contain commentcount"
            );
            assert.property(
              res.body[0],
              "title",
              "Books in array should contain title"
            );
            assert.property(
              res.body[0],
              "_id",
              "Books in array should contain _id"
            );
            done();
          });
      });
    });

    suite("GET /api/books/[id] => book object with [id]", function () {
      test("Test GET /api/books/[id] with id not in db", function (done) {
        const id = "5f98668eb47cda035811aeac";
        chai
          .request(server)
          .get("/api/books/" + id)
          .end(function (err, res) {
            assert.equal(res.status, 404);
            assert.equal(res.text, "no book exists");
            done();
          });
      });

      test("Test GET /api/books/[id] with valid id in db", function (done) {
        chai
          .request(server)
          .get("/api/books")
          .end(function (err, res) {
            const idToGet = res.body[0]._id;
            chai
              .request(server)
              .get("/api/books/" + idToGet)
              .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.body._id, idToGet);
                done();
              });
          });
      });
    });

    suite(
      "POST /api/books/[id] => add comment/expect book object with id",
      function () {
        test("Test POST /api/books/[id] with comment", function (done) {
          chai
            .request(server)
            .get("/api/books")
            .end(function (err, res) {
              const comment = "blah blah blah";
              const idToUpdate = res.body[0]._id;
              chai
                .request(server)
                .post("/api/books/" + idToUpdate)
                .send({ comment })
                .end(function (err, res) {
                  assert.equal(res.status, 200);
                  assert.equal(res.body._id, idToUpdate);
                  assert.isArray(res.body.comments);
                  assert.include(
                    res.body.comments,
                    comment,
                    "Comments array in returned book includes added comment"
                  );
                  done();
                });
            });
        });
      }
    );
  });
});
