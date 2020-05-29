const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const admin = require("../api/firestore");
const { check, validationResult } = require("express-validator");
const router = express.Router();
const cookieParser = require("cookie-parser")();
const cors = require("cors")({ origin: true });

// Status GET Latest


// Status GET
router.get("/", (req, res) => {
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
          res.json(doc.data())
        });
    })
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
          let docRef = admin.fStore
            .collection("family")
            .doc(doc.data().family_id)
            .collection("status")
            .doc();
          let docId = docRef.id;

          let statusData = "";

          if (req.body.picture != null) {
            statusData = {
              status_id: docId,
              user_id: decodeClaims.uid,
              content: req.body.content,
              picture: req.body.picture,
              moodlet: req.body.moodlet,
              timestamp: req.body.timestamp,
            };
          } else if (req.body.voice != null) {
            statusData = {
              status_id: docId,
              user_id: decodeClaims.uid,
              content: req.body.content,
              voice: req.body.voice,
              moodlet: req.body.moodlet,
              timestamp: req.body.timestamp,
            };
          } else {
            statusData = {
              status_id: docId,
              user_id: decodeClaims.uid,
              content: req.body.content,
              moodlet: req.body.moodlet,
              timestamp: req.body.timestamp,
            };
          }

          let addDoc = docRef.set(statusData).then((ref) => {
            console.log("=>[Firestore] Added document with ID:", docId);
            admin.fStore.collection("users").doc(decodeClaims.uid).update({
              moodlet: req.body.moodlet,
              status_id: docId,
            });

            //Send push notification
            admin.fStore.collection("family").doc(doc.data().family_id).get().then(async (famDoc) => {

              const famLeft = famDoc.data().members.filter(member => {
                return member != decodeClaims.uid
              })

              console.log(famLeft)

              let finalArray = famLeft.map(async (value) => {
                console.log('value is ' + value)
                let userRef = await admin.fStore.collection('users').doc(value).get()
                console.log(userRef.data())
                return userRef.data().fcmToken
              })
              const registrationTokens = await Promise.all(finalArray);
              console.log(registrationTokens)
              
              
              let userName = admin.fAuth.getUser(decodeClaims.uid)
              let moodlet = ''
              let statusType = ''

              if(req.body.moodlet === 'happy'){
                moodlet = 'มีความสุข 😁'
              } else if(req.body.moodlet === 'love'){
                moodlet = 'ตื่นเต้น 🤩'
              } else if(req.body.moodlet === 'meh'){
                moodlet = 'เบื่อ 😐'
              } else if(req.body.moodlet === 'tired'){
                moodlet = 'เหนื่อย 😪'
              }

              if(req.body.picture != null){
                statusType = ' พึ่งอัพเดตรูปภาพใหม่บน Kumami '
              } else if(req.body.voice != null){
                statusType = ' พึ่งอัพเดตบันทึกเสียงใหม่บน Kumami'
              } else {
                statusType = ' พึ่งอัพเดตสถานะใหม่บน Kumami'
              } 
              
              const message = {
                notification: {
                  title: "🔔 " + (await userName).displayName + statusType,
                  body: req.body.content + ' - รู้สึก' + moodlet,
                  click_action: 'http://localhost:3000'
                },
              }

              admin.fMessage.sendToDevice(registrationTokens, message).then(response => {
                console.log(response.successCount + ' messages were sent!')
              }).catch(error => {
                console.log(error)
              })
              
            })


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
  console.log("[Router] POST | Status Edit route to", req.body.status_id);

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
        .then((doc) => {
          if (doc.data().status_id == req.body.status_id) {
            let docRef = admin.fStore
              .collection("family")
              .doc(doc.data().family_id)
              .collection("status")
              .doc(req.body.status_id);
            let updateDoc = docRef
              .update({
                content: req.body.content,
                moodlet: req.body.moodlet,
                voice: req.body.voice,
                picture: req.body.picture
              })
              .then((ref) => {
                console.log(
                  "=>[Firestore] Updated document with ID:",
                  req.body.status_id
                );
                admin.fStore.collection("users").doc(decodeClaims.uid).update({
                  moodlet: req.body.moodlet,
                });
              });
          } else {
            let docRef = admin.fStore
              .collection("family")
              .doc(doc.data().family_id)
              .collection("status")
              .doc(req.body.status_id);
            let updateDoc = docRef
              .update({
                content: req.body.content,
                moodlet: req.body.moodlet,
                voice: req.body.voice,
                picture: req.body.picture
              })
              .then(async (ref) => {
                console.log(
                  "=>[Firestore] Updated document with ID:",
                  req.body.status_id
                );
              });
          }
        });
    })
    .catch((error) => {
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
      let docData = admin.fStore
        .collection("users")
        .doc(decodeClaims.uid)
        .get()
        .then((doc) => {
          if (doc.data().status_id == req.params.id) {
            let docRef = admin.fStore
              .collection("family")
              .doc(doc.data().family_id)
              .collection("status")
              .doc(req.params.id)
              .delete()
              .then((ref) => {
                console.log(
                  "=>[Firestore] Delete document with ID:",
                  req.params.id
                );
                let latestRef = admin.fStore
                  .collection("family")
                  .doc(doc.data().family_id)
                  .collection("status")
                  .where("user_id", "==", decodeClaims.uid)
                  .orderBy("timestamp", "desc")
                  .limit(1)
                  .get()
                  .then((snapshot) => {
                    snapshot.forEach((status) => {
                      admin.fStore
                        .collection("users")
                        .doc(decodeClaims.uid)
                        .update({
                          moodlet: status.data().moodlet,
                          status_id: status.data().status_id,
                        });
                    });
                  });
              });
          } else {
            let docRef = admin.fStore
              .collection("family")
              .doc(doc.data().family_id)
              .collection("status")
              .doc(req.params.id)
              .delete()
              .then((ref) => {
                console.log(
                  "=>[Firestore] Deleted document with ID:",
                  req.params.id
                );
              });
          }
        });
    })
    .catch((error) => {
      console.log("=> [FireAuth] Unauthorized");
      res.redirect("/auth/login");
    });
});

module.exports = router;
