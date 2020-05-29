const admin = require('../api/firestore');


function attachCsrfToken(url, cookie, value) {
  return function(req, res, next) {
    if (req.url == url) {
      res.cookie(cookie, value);
    }
    next();
  }
}

function getDataFromCookie(req) {
  var sessionCookie = req.cookies.session || '';
  userRecord = [];
  // User already logged in. Redirect to profile page.
  admin.fAuth.verifySessionCookie(sessionCookie).then(decodedClaims => {
    console.log("=> [FireAuth] Session Verified!");
    userRecord = admin.fAuth.getUser(decodedClaims.sub)
    console.log(userRecord.uid)
  }).catch(function(error) {
    console.log('Unauthorhized');
  });
  return userRecord;
}
  

exports.getData = getDataFromCookie;