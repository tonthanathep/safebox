const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const admin = require("../api/firestore");
const { check, validationResult } = require("express-validator");
const router = express.Router();
const token = require("../api/token");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const randomize = require("randomatic");

//Middleware Initialize
router.use(cors({ origin: true }));
router.use(cookieParser());
router.use(bodyParser.json());
router.use(
  bodyParser.urlencoded({
    extended: true,
  })
);


router.post("/leave", (req, res) => {

  console.log('leaving!')

  const idToken = req.headers.authorization;
  admin.fAuth.verifyIdToken(idToken, true).then((decodeClaims) => {

    admin.fStore.collection('users').doc(decodeClaims.uid).get().then(doc => {
      admin.fStore.collection('family').doc(doc.data().family_id).update({
        members: admin.FieldValue.arrayRemove(decodeClaims.uid),
      }).then(() => {
        admin.fStore.collection('users').doc(decodeClaims.uid).update({
          have_family: false,
          family_id: null,
          status_id: null,
          moodlet: 'happy',
        })
      })
    })
  }).catch(error =>{
    console.log(error)
  })
})


router.get("/howareyou", (req, res) => {
  console.log("hay = howareyou reached");
  const idToken = req.headers.authorization;

  admin.fAuth.verifyIdToken(idToken, true).then((decodeClaims) => {
    console.log("hay = authorized");
    console.log(decodeClaims.uid);
    admin.fStore
      .collection("users")
      .doc(decodeClaims.uid)
      .get()
      .then((doc) => {
        console.log("hay = doc get");
        admin.fStore
          .collection("family")
          .doc(doc.data().family_id)
          .get()
          .then(async (famDoc) => {
            let finalArray = famDoc.data().members.map(async (value) => {
              let userRef = await admin.fStore
                .collection("users")
                .doc(value)
                .get()

              let tempRef = userRef.data()

              await admin.fAuth.getUser(tempRef.user_id).then((user) => {
                tempRef.photoURL = user.photoURL
              })

              return tempRef
            });
            const resolvedFinalArray = await Promise.all(finalArray);
            console.log(resolvedFinalArray);
            res.json(resolvedFinalArray);
          });
      });
  });
});

router.post("/token", (req, res) => {
  console.log('[Get Token Reached]')
  const idToken = req.headers.authorization;
  admin.fAuth.verifyIdToken(idToken, true).then((decodeClaims) => {
    console.log('authorized')
    let userRef = admin.fStore.collection('users').doc(decodeClaims.uid).update({
      fcmToken: req.body.token
    }).then(() => {
      res.sendStatus(200)
    }).catch(() => {
      res.sendStatus(403)
    })
  })
})

router.get("/ishave", (req, res) => {
  console.log("ishave reached");
  const idToken = req.headers.authorization;
  admin.fAuth.verifyIdToken(idToken, true).then((decodeClaims) => {
    console.log("authorized");
    console.log(decodeClaims.uid);
    let userRef = admin.fStore
      .collection("users")
      .doc(decodeClaims.uid)
      .get()
      .then((doc) => {
        console.log("doc get");
        console.log("have family is " + doc.data().have_family);
        res.send(doc.data().have_family);
      });
  });
});

router.get("/getcode", (req, res) => {
  console.log("getcode reached");
  const idToken = req.headers.authorization;
  admin.fAuth.verifyIdToken(idToken, true).then((decodeClaims) => {
    console.log("authorized");
    console.log(decodeClaims.uid);
    let userRef = admin.fStore
      .collection("users")
      .doc(decodeClaims.uid)
      .get()
      .then((doc) => {
        console.log("doc get");
        let famRef = admin.fStore
          .collection("family")
          .doc(doc.data().family_id)
          .get()
          .then((famDoc) => {
            console.log("famdoc get");
            res.json(famDoc.data().family_code);
          });
      });
  });
});

//Setup Page GET
router.get("/setup", (req, res) => {
  console.log("[Router] GET => Family - Setup");
  const sessionCookie = req.cookies.session || "";
  admin.fAuth
    .verifySessionCookie(sessionCookie, true)
    .then((decodeClaims) => {
      console.log("=> [FireAuth] Session verified");
      admin.fAuth.getUser(decodeClaims.sub).then((userRecord) => {
        console.log("=> [FireAuth] User ID is:" + userRecord.uid);
        let userdata = admin.fStore
          .collection("users")
          .doc(userRecord.uid)
          .get()
          .then((doc) => {
            var have_family = doc.data().have_family;
            console.log(doc.data());
            if (have_family == true) {
              console.log("=> [Setup] This user have family");
              res.redirect("/auth/hello");
            } else {
              console.log("=> [Setup] This user not have family");
              res.render("setup", {
                user: userRecord,
              });
            }
          });
      });
    })
    .catch((error) => {
      res.redirect("/auth/login");
    });
});

//Setup Have Family POST
router.post("/setup/join", (req, res) => {
  console.log("[Router] POST => Family - Setup - Join");

  const idToken = req.headers.authorization || "";
  const familyCode = req.body.code;
  var family;

  admin.fAuth
    .verifyIdToken(idToken, true)
    .then((decodeClaims) => {
      console.log("=> [FireAuth] Session Verified!");
      console.log("User ID is:" + decodeClaims.uid);
      let userdata = admin.fStore
        .collection("users")
        .doc(decodeClaims.uid)
        .get()
        .then((doc) => {
          var have_family = doc.data().have_family;
          if (have_family) {
            res.redirect("/auth/hello");
          } else {
            let familyQuery = admin.fStore
              .collection("family")
              .where("family_code", "==", familyCode)
              .get()
              .then((snapshot) => {
                snapshot.forEach((doc) => {
                  family = doc.data();
                });
                res.json(family);
              });
          }
        });
    })
    .catch((error) => {
      res.redirect("/auth/login");
    });
});

//Setup Have Family Confirm
router.post("/setup/joinnext", (req, res) => {
  console.log("[Router] POST => Family - Setup - Join - Next");

  const idToken = req.headers.authorization || "";
  const familyId = req.body.id;
  const nickname = req.body.nickname;

  admin.fAuth
    .verifyIdToken(idToken, true)
    .then((decodeClaims) => {
      console.log("=> [FireAuth] Session Verified!");
      console.log("User ID is:" + decodeClaims.uid);
      let userdata = admin.fStore
        .collection("users")
        .doc(decodeClaims.uid)
        .get()
        .then((doc) => {
          var have_family = doc.data().have_family;
          if (have_family) {
            res.redirect("/auth/hello");
          } else {
            let familyQuery = admin.fStore
              .collection("family")
              .doc(familyId)
              .update({
                members: admin.FieldValue.arrayUnion(decodeClaims.uid),
              });
            let userUpdate = admin.fStore
              .collection("users")
              .doc(decodeClaims.uid)
              .update({
                have_family: true,
                family_id: familyId,
                nickname: nickname,
              });
            res.json({ status: "success" });
          }
        });
    })
    .catch((error) => {
      res.redirect("/auth/login");
    });
});

//Setup Create Family
router.post("/setup/new", (req, res) => {
  console.log("[Router] POST => Family - Setup - New");
  const idToken = req.headers.authorization || "";
  const familyName = req.body.name;
  const nickname = req.body.nickname;

  admin.fAuth
    .verifyIdToken(idToken, true)
    .then((decodeClaims) => {
      console.log("=> [FireAuth] Session Verified!");
      console.log("User ID is:" + decodeClaims.uid);
      let userdata = admin.fStore
        .collection("users")
        .doc(decodeClaims.uid)
        .get()
        .then((doc) => {
          var have_family = doc.data().have_family;
          if (have_family) {
            res.redirect("/auth/hello");
          } else {
            let famRef = admin.fStore.collection("family").doc();
            let famId = famRef.id;
            let famCode = randomize("A0", 6);
            let familyAdd = famRef.set({
              family_id: famId,
              name: familyName,
              members: [decodeClaims.uid],
              family_code: famCode,
            });

            let setStatusRef = admin.fStore
              .collection("family")
              .doc(famId)
              .collection("status")
              .add({});
            let setNoteRef = admin.fStore
              .collection("family")
              .doc(famId)
              .collection("notes")
              .add({});
            let setCountRef = admin.fStore
              .collection("family")
              .doc(famId)
              .collection("anni")
              .add({});

            let userUpdate = admin.fStore
              .collection("users")
              .doc(decodeClaims.uid)
              .update({
                have_family: true,
                family_id: famId,
                nickname: nickname,
              });

            res.json({
              family: familyName,
              famCode: famCode,
            });
          }
        });
    })
    .catch((error) => {
      res.redirect("/auth/login");
    });
});

module.exports = router;
