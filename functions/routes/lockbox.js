const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const admin = require("../api/firestore");
const { check, validationResult } = require("express-validator");
const router = express.Router();
const cookieParser = require("cookie-parser")();
const cors = require("cors")({ origin: true });

// Want to borrow
router.get("/borrow", (req, res) => {
  const idToken = req.headers.authorization || "";
  admin.fAuth
    .verifyIdToken(idToken, true)
    .then(() => {
      admin.fStore.collection('lockbox').where('ready', '==', true).limit(1).get().then(lockbox => {
        lockbox.forEach(box => {
          res.json(box.data())
        })
      })
    });
})

//Check Free Box
router.get("/", (req,res) => {
  let boxcount = 0
  const idToken = req.headers.authorization || "";
  admin.fAuth
    .verifyIdToken(idToken, true)
    .then(() => {
      admin.fStore.collection('lockbox').where('ready', '==', true).get().then(lockbox => {
        lockbox.forEach(box => {
          boxcount = boxcount + 1;
        });
        res.json(boxcount);
        
      })
    });
})

// Borrowing
router.post("/borrow", (req, res) => {
  const idToken = req.headers.authorization || "";
  admin.fAuth
    .verifyIdToken(idToken, true)
    .then((decodeClaims) => {
      admin.fStore.collection('lockbox').doc(req.body.lock_id).update({
        ready: false,
        borrowedBy: decodeClaims.uid,
        borrowedTime: req.body.borrowedTime
      }).then(() => {
        admin.fStore.collection('users').doc(decodeClaims.uid).update({
          isBorrow: true,
          device: req.body.device,
          lastBorrow: req.body.borrowedTime,
          lock_id: req.body.lock_id,
          number: req.body.number
        }).then(() => {
          res.sendStatus(200)
        })
      })
    });
})

router.post("/return", (req, res) => {
  const idToken = req.headers.authorization || "";
  admin.fAuth
    .verifyIdToken(idToken, true)
    .then((decodeClaims) => {
      admin.fStore.collection('lockbox').doc(req.body.lockbox).update({
        ready: true,
        borrowedBy: null,
        borrowedTime: null,
        lastBorrowedBy: decodeClaims.uid,
        lastReturnTime: req.body.borrowedTime
      }).then(() => {
        admin.fStore.collection('users').doc(decodeClaims.uid).update({
          isBorrow: false,
          lastReturned: req.body.borrowedTime
        }).then(() => {
          res.sendStatus(200)
        })
      })
    });
})




module.exports = router;
