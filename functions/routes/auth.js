const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const admin = require("../api/firestore");
const { check, validationResult } = require("express-validator");
const router = express.Router();
const token = require("../api/token");
const cookieParser = require("cookie-parser");
const cors = require("cors");

//Middleware Initialize
router.use(cors({ origin: true }));
router.use(cookieParser());
router.use(bodyParser.json());
router.use(
  bodyParser.urlencoded({
    extended: true
  })
);



//Register POST
router.post("/register", (req, res) => {
  console.log("[Router] POST => Register ");

  const fullname = req.body.fullname;
  const idToken = req.headers.authorization || "";

  //Verify cookie with Firebase
  admin.fAuth.verifyIdToken(idToken, true).then(decodeClaims => {
      console.log("=> [FireAuth] Session Verified!");
      admin.fAuth.getUser(decodeClaims.sub).then(userRecord => {
        let userProfileAdd = admin.fStore.collection("users").doc(userRecord.uid).set
          ({
            user_id: userRecord.uid,
            isBorrow: false,
            device: null,
            lastBorrow: null,
          })
          .then(() => {
            console.log("=> [Firestore] Create user document along with this UID:",userRecord.uid);
            req.flash("success","Account Created!, Welcome " +userRecord.displayName +" to Kumami");
          });

        let userProfileNew = admin.fAuth
          .updateUser(userRecord.uid, {
            displayName: fullname
          })
          .then(() => {
            console.log("=> [FireAuth] Update user " + userRecord.uid + " with desired Display Name : " + fullname);
          });
      });
    })
});




module.exports = router;
