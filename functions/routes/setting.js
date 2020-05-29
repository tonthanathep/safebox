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
                  .collection("anni")
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

//Anniversary Add
router.post("/add", (req, res) => {
  console.log("[Router] POST | Anni Add route");

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
              .collection("anni")
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
                targetDate: req.body.targetDate,
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


// Note Update
router.post("/edit", (req, res) => {
  console.log("[Router] PUT | Anni Edit route to", req.body.status_id);

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
            .collection("anni")
            .doc(req.body.status_id);

          let updateDoc = docRef
            .update({
              content: req.body.content,
              topic: req.body.topic,
              targetDate: req.body.targetDate,
              user_id: decodeClaims.uid
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

// Note Delete
router.delete("/:id", (req, res) => {
  console.log("[Router] DELETE | Anni route to", req.params.id);

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
            .collection("anni")
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
