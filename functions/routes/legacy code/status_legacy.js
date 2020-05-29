const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const admin = require("../api/firestore");
const { check, validationResult } = require("express-validator");
const router = express.Router();
const cookieParser = require("cookie-parser")();
const cors = require("cors")({ origin: true });

// Status Route
router.get("/", (req, res) => {
  console.log("[Router] GET | Home route");

  const tempDoc = [];

  const tokenId = req.headers.authorization;
  admin.fAuth
    .verifyIdToken(tokenId, true)
    .then((decodeClaims) => {
      console.log("=> [FireAuth] Session verified");

      //Get user data
      let userRef = admin.fStore
        .collection("users")
        .doc(decodeClaims.uid)
        .get()
        .then((doc) => {
          let statusRef = admin.fStore
            .collection("family")
            .doc(doc.data().family_id)
            .collection("status")
            .orderBy("timestamp", "asc")
            .limit(10)
            .get()
            .then(async (snapshot) => {
              await snapshot.forEach((doc) => {
                tempDoc.push(doc.data());
              });
            })
            .then(async () => {
              let finalArray = tempDoc.map(async (doc) => {
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
    })
    .catch((error) => {
      console.log("=> [FireAuth] Unauthorized");
      res.redirect("/auth/login");
    });
});

// Status View Route
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
                .collection("status")
                .doc(req.params.id)
                .get()
                .then((doc) => {
                  if (!doc.exists) {
                    res.render("404", {});
                  } else {
                    if (doc.data().user_id == userRecord.uid) {
                      res.render("status_editable", {
                        status: doc.data(),
                      });
                    } else {
                      res.render("status", {
                        status: doc.data(),
                      });
                    }
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

// Status Add Get
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
              res.render("add_status", {
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

// Status Add
router.post("/add", (req, res) => {
  console.log("[Router] POST | Status Add route");

  const idToken = req.headers.authorization;
  console.log(req.body.content);
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
              .collection("status")
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
                content: req.body.content,
                moodlet: req.body.moodlet,
                timestamp: dateString,
              })
              .then((ref) => {
                console.log("=>[Firestore] Added document with ID:", docId);
                admin.fStore.collection("users").doc(decodeClaims.uid).update({
                  moodlet: req.body.moodlet,
                });
              });
          }
        });
    })
    .catch((error) => {
      console.log("=> [FireAuth] Unauthorized");
      res.redirect("/auth/login");
    });
});

// Status Edit Route
router.get("/edit/:id", (req, res) => {
  console.log("[Router] GET | Status Edit route on", req.params.id);

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
                .collection("status")
                .doc(req.params.id)
                .get()
                .then((sta) => {
                  if (!sta.exists) {
                    res.render("404", {});
                  } else {
                    if (sta.data().user_id == userRecord.uid) {
                      res.render("edit_status", {
                        fam: doc.data(),
                        status: sta.data(),
                      });
                    } else {
                      res.redirect("/status");
                    }
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

// Status Edit POST Route
router.post("/edit/:id", (req, res) => {
  console.log("[Router] POST | Status Edit route to", req.params.id);

  const sessionCookie = req.cookies.session || "";
  admin.fAuth.verifySessionCookie(sessionCookie, true).then((decodeClaims) => {
    console.log("=> [FireAuth] Session verified");
    admin.fAuth
      .getUser(decodeClaims.sub)
      .then((userRecord) => {
        console.log("=> [FireAuth] UID is " + userRecord.uid);

        if (userRecord.uid == req.body.uid) {
          let docRef = admin.fStore
            .collection("family")
            .doc(req.body.fam)
            .collection("status")
            .doc(req.params.id);
          let updateDoc = docRef
            .update({
              content: req.body.content,
              moodlet: req.body.moodlet,
            })
            .then((ref) => {
              req.flash("success", "Status Edited");
              res.redirect("/status");
              console.log(
                "=>[Firestore] Updated document with ID:",
                req.params.id
              );
            });
        } else {
          res.redirect("/auth/logout");
          console.log("Data Integrity Compromised");
        }
      })
      .catch((error) => {
        console.log("=> [FireAuth] Unauthorized");
        res.redirect("/auth/login");
      });
  });
});

// Status Edit DELETE Route
router.delete("/:id", (req, res) => {
  console.log("[Router] DELETE | Status route to", req.params.id);

  const sessionCookie = req.cookies.session || "";
  admin.fAuth.verifySessionCookie(sessionCookie, true).then((decodeClaims) => {
    console.log("=> [FireAuth] Session verified");
    admin.fAuth
      .getUser(decodeClaims.sub)
      .then((userRecord) => {
        console.log("=> [FireAuth] UID is " + userRecord.uid);
        let docData = admin.fStore
          .collection("users")
          .doc(userRecord.uid)
          .get()
          .then((doc) => {
            let docGet = admin.fStore
              .collection("family")
              .doc(doc.data().family_id)
              .collection("status")
              .doc(req.params.id)
              .get()
              .then((sta) => {
                if (userRecord.uid == sta.data().user_id) {
                  let docRef = admin.fStore
                    .collection("family")
                    .doc(doc.data().family_id)
                    .collection("status")
                    .doc(req.params.id)
                    .delete()
                    .then((ref) => {
                      req.flash("success", "Status Deleted");
                      res.redirect("/status");
                      console.log(
                        "=>[Firestore] Delete document with ID:",
                        req.params.id
                      );
                    });
                } else {
                  res.redirect("/auth/logout");
                  console.log("Data Integrity Compromised");
                }
              });
          });
      })
      .catch((error) => {
        console.log("=> [FireAuth] Unauthorized");
        res.redirect("/auth/login");
      });
  });
});

module.exports = router;
