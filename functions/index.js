const express = require("express");
const path = require("path"); //Use to pointh where the file is
const bodyParser = require("body-parser");
const ffunc = require("firebase-functions");
const expressValidator = require("express-validator");
const flash = require("connect-flash");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const cors = require("cors");
// const FirestoreStore = require( 'firestore-store' )(session);

// Firestore
const admin = require("./api/firestore");

// Initialize App
const app = express();

// Point views folder + Load PUG to express
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// Initializer Body-Parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors({ origin: true }));
app.use(cookieParser());

// Set Public Folder
app.use(express.static(path.join(__dirname, "../public")));

// app.use( session( {
//   store:  new FirestoreStore( {
//     database: admin.fStore
//   } ),

//   name:              '__session', // ← required for Cloud Functions / Cloud Run
//   secret:            'keyboard cat',
//   resave:            true,
//   saveUninitialized: true
// } ) );

// Express Session
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
}));

// Express Messages
app.use(require("connect-flash")());
app.use(function(req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

// Home Route
app.get("/", (req, res) => {
  console.log("[Router] GET | Home route");

  res.render('landing',{});

});

// Router

let lockbox = require("./routes/lockbox");
app.use("/lockbox", lockbox);

app.listen(5000, () => {
  console.log(`[Init] Server is now running on port 3000`);
});

// exports.home = ffunc.region("asia-east2").https.onRequest(app);