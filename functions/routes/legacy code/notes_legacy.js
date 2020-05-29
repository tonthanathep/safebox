const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const admin = require("../api/firestore");
const { check, validationResult } = require("express-validator");
const router = express.Router();
const cookieParser = require("cookie-parser")();
const cors = require("cors")({ origin: true });

// Note Get
router.get("/", (req, res) => {
  console.log("[Router] GET | Home route");

  var notes = [];

  const idToken = req.headers.authorization || "";
  admin.fAuth
    .verifyIdToken(idToken, true)
    .then((decodeClaims) => {
      console.log("=> [FireAuth] Session verified");
      console.log("=> [FireAuth] UID is " + decodeClaims.uid);

      //Get user data
      admin.fStore
        .collection("users")
        .doc(decodeClaims.uid)
        .get()
        .then((doc) => {
          var have_family = doc.data().have_family;
          if (have_family) {
            admin.fStore
              .collection("family")
              .doc(doc.data().family_id)
              .get()
              .then((famref) => {
                admin.fStore
                  .collection("family")
                  .doc(doc.data().family_id)
                  .collection("notes")
                  .orderBy("timestamp", "asc")
                  .get()
                  .then(async (snapshot) => {
                    await snapshot.forEach((doc) => {
                      notes.push(doc.data());
                    });
                  })
                  .then(async () => {
                    console.log(notes);
                    let finalArray = notes.map(async (doc) => {
                      await admin.fAuth.getUser(doc.user_id).then((user) => {
                        doc.photoURL = user.photoURL;
                      });
                      return doc;
                    });
                    const resolvedFinalArray = await Promise.all(finalArray);
                    console.log(resolvedFinalArray);
                    res.json(resolvedFinalArray);
                  });
              });
          } else {
            res.redirect("/family/setup");
          }
        });
    })
    .catch((error) => {
      console.log("=> [FireAuth] Unauthorized");
      res.redirect("/auth/login");
    });
});

//Note Add
router.post("/add", (req, res) => {
  console.log("[Router] POST | Note Add route");

  const idToken = req.headers.authorization || "";
  admin.fAuth
    .verifyIdToken(idToken, true)
    .then((decodeClaims) => {
      console.log("=> [FireAuth] Session verified");
      let famRef = admin.fStore
        .collection("users")
        .doc(decodeClaims.uid)
        .get()
        .then((doc) => {
          if ((doc.data().have_family = true)) {
            let docRef = admin.fStore
              .collection("family")
              .doc(doc.data().family_id)
              .collection("notes")
              .doc();
            let docId = docRef.id;
            let docDate = new Date();

            //Variable to decode timestamp
            let date = docDate.getDate();
            let month = docDate.getMonth();
            let year = docDate.getFullYear();
            let dateString = date + "-" + (month + 1) + "-" + year;

            let addDoc = docRef
              .set({
                status_id: docId,
                user_id: decodeClaims.uid,
                topic: req.body.topic,
                content: req.body.content,
                timestamp: dateString,
              })
              .then((ref) => {
                console.log("=>[Firestore] Added document with ID:", docId);
              });
          }
        });
    })
    .catch((error) => {
      console.log("=> [FireAuth] Unauthorized");
      res.redirect("/auth/login");
    });
});

// Note View Route
router.get("/view/:id", (req, res) => {
  console.log("[Router] GET | Status View route on", req.params.id);

  const sessionCookie = req.cookies.session || "";
  admin.fAuth
    .verifySessionCookie(sessionCookie, true)
    .then((decodeClaims) => {
      console.log("=> [FireAuth] Session verified");
      admin.fAuth.getUser(decodeClaims.sub).then((userRecord) => {
        console.log("=> [FireAuth] UID is " + userRecord.uid);

        //Get user data
        let userRef = admin.fStore
          .collection("users")
          .doc(userRecord.uid)
          .get()
          .then((doc) => {
            var have_family = doc.data().have_family;
            if (have_family) {
              let statusRef = admin.fStore
                .collection("family")
                .doc(doc.data().family_id)
                .collection("notes")
                .doc(req.params.id)
                .get()
                .then((doc) => {
                  if (!doc.exists) {
                    res.render("404", {});
                  } else {
                    res.render("note_view", {
                      status: doc.data(),
                    });
                  }
                });
            } else {
              res.redirect("/family/setup");
            }
          });
      });
    })
    .catch((error) => {
      console.log("=> [FireAuth] Unauthorized");
      res.redirect("/auth/login");
    });
});

router.get("/count/:id", (req, res) => {
  console.log("[Router] GET | Status View route on", req.params.id);

  const sessionCookie = req.cookies.session || "";
  admin.fAuth
    .verifySessionCookie(sessionCookie, true)
    .then((decodeClaims) => {
      console.log("=> [FireAuth] Session verified");
      admin.fAuth.getUser(decodeClaims.sub).then((userRecord) => {
        console.log("=> [FireAuth] UID is " + userRecord.uid);

        //Get user data
        let userRef = admin.fStore
          .collection("users")
          .doc(userRecord.uid)
          .get()
          .then((doc) => {
            var have_family = doc.data().have_family;
            if (have_family) {
              let statusRef = admin.fStore
                .collection("family")
                .doc(doc.data().family_id)
                .collection("notes")
                .doc(req.params.id)
                .get()
                .then((doc) => {
                  if (!doc.exists) {
                    res.render("404", {});
                  } else {
                    res.render("count_view", {
                      status: doc.data(),
                    });
                  }
                });
            } else {
              res.redirect("/family/setup");
            }
          });
      });
    })
    .catch((error) => {
      console.log("=> [FireAuth] Unauthorized");
      res.redirect("/auth/login");
    });
});

// Status Update Route
router.get("/add", (req, res) => {
  console.log("[Router] GET | Status Add route");

  const sessionCookie = req.cookies.session || "";
  admin.fAuth
    .verifySessionCookie(sessionCookie, true)
    .then((decodeClaims) => {
      console.log("=> [FireAuth] Session verified");
      admin.fAuth.getUser(decodeClaims.sub).then((userRecord) => {
        console.log("=> [FireAuth] UID is " + userRecord.uid);

        //Get user data
        let userRef = admin.fStore
          .collection("users")
          .doc(userRecord.uid)
          .get()
          .then((doc) => {
            var have_family = doc.data().have_family;
            if (have_family) {
              res.render("add_note", {
                doc: doc.data(),
              });
            } else {
              res.redirect("/family/setup");
            }
          });
      });
    })
    .catch((error) => {
      console.log("=> [FireAuth] Unauthorized");
      res.redirect("/auth/login");
    });
});

// Status Update POST Route

// Status Edit Route
router.get("/edit/:id", (req, res) => {
  console.log("[Router] GET | Status Edit route on");

  console.log(req.params.id);

  const tokenId = req.headers.authorization || "";
  admin.fAuth
    .verifyIdToken(tokenId, true)
    .then((decodeClaims) => {
      console.log("=> [FireAuth] Session verified");
      console.log("=> [FireAuth] UID is " + decodeClaims.uid);

      //Get user data
      let userRef = admin.fStore
        .collection("users")
        .doc(decodeClaims.uid)
        .get()
        .then((doc) => {
          let statusRef = admin.fStore
            .collection("family")
            .doc(doc.data().family_id)
            .collection("notes")
            .doc(req.params.id)
            .get()
            .then((sta) => {
              if (!sta.exists) {
                res.send(404);
              } else {
                res.json(sta.data());
              }
            });
        });
    })
    .catch((error) => {
      console.log("=> [FireAuth] Unauthorized");
      res.redirect("/auth/login");
    });
});

// Status Edit POST Route
router.post("/edit", (req, res) => {
  console.log("[Router] PUT | Status Edit route to", req.body.status_id);

  console.log(req.body.topic);
  console.log(req.body.content);

  const idToken = req.headers.authorization || "";
  admin.fAuth
    .verifyIdToken(idToken, true)
    .then((decodeClaims) => {
      console.log("=> [FireAuth] Session verified");
      console.log("=> [FireAuth] UID is " + decodeClaims.uid);

      let userRef = admin.fStore
        .collection("users")
        .doc(decodeClaims.uid)
        .get()
        .then((user) => {
          let docRef = admin.fStore
            .collection("family")
            .doc(user.data().family_id)
            .collection("notes")
            .doc(req.body.status_id);

          let updateDoc = docRef
            .update({
              content: req.body.content,
              topic: req.body.topic,
            })
            .then((ref) => {
              res.sendStatus(404);
            })
            .catch((error) => {
              console.log(error);
            });
        });
    })
    .catch((error) => {
      console.log(error);
      console.log("=> [FireAuth] Unauthorized");
      res.redirect("/auth/login");
    });
});

// Status Edit DELETE Route
router.delete("/:id", (req, res) => {
  console.log("[Router] DELETE | Status route to", req.params.id);

  const idToken = req.headers.authorization || "";
  admin.fAuth
    .verifyIdToken(idToken, true)
    .then((decodeClaims) => {
      console.log("=> [FireAuth] Session verified");

      console.log("=> [FireAuth] UID is " + decodeClaims.uid);
      let userRef = admin.fStore
        .collection("users")
        .doc(decodeClaims.uid)
        .get()
        .then((user) => {
          let docRef = admin.fStore
            .collection("family")
            .doc(user.data().family_id)
            .collection("notes")
            .doc(req.params.id)
            .delete()
            .then((ref) => {
              res.sendStatus(404);
              console.log(
                "=>[Firestore] Delete document with ID:",
                req.params.id
              );
            });
        });
    })
    .catch((error) => {
      console.log("=> [FireAuth] Unauthorized");
      res.redirect("/auth/login");
    });
});

module.exports = router;
