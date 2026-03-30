const admin = require("firebase-admin");

let initialized = false;

function getServiceAccount() {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const path = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

  if (json) {
    try {
      return JSON.parse(json);
    } catch (e) {
      const err = new Error("FIREBASE_SERVICE_ACCOUNT_JSON is invalid JSON");
      err.status = 500;
      throw err;
    }
  }

  if (path) {
    // Lazy require to avoid bundler issues
    // eslint-disable-next-line global-require
    const fs = require("fs");
    if (!fs.existsSync(path)) {
      const err = new Error("FIREBASE_SERVICE_ACCOUNT_PATH file not found");
      err.status = 500;
      throw err;
    }
    return JSON.parse(fs.readFileSync(path, "utf8"));
  }

  const err = new Error(
    "Firebase Admin is not configured. Set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH."
  );
  err.status = 503;
  throw err;
}

function initFirebaseAdmin() {
  if (initialized) return admin;

  const serviceAccount = getServiceAccount();
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  initialized = true;
  return admin;
}

async function verifyFirebaseIdToken(idToken) {
  if (!idToken) {
    const err = new Error("idToken is required");
    err.status = 400;
    throw err;
  }

  const firebase = initFirebaseAdmin();
  try {
    return await firebase.auth().verifyIdToken(String(idToken));
  } catch (e) {
    const err = new Error("Invalid Firebase token");
    err.status = 401;
    throw err;
  }
}

async function getFirebaseUserByUid(uid) {
  if (!uid) {
    const err = new Error("uid is required");
    err.status = 400;
    throw err;
  }

  const firebase = initFirebaseAdmin();
  try {
    return await firebase.auth().getUser(String(uid));
  } catch (_) {
    const err = new Error("Firebase user not found");
    err.status = 404;
    throw err;
  }
}

async function getFirebaseUserByEmail(email) {
  if (!email) {
    const err = new Error("email is required");
    err.status = 400;
    throw err;
  }

  const firebase = initFirebaseAdmin();
  try {
    return await firebase.auth().getUserByEmail(String(email));
  } catch (_) {
    const err = new Error("Firebase user not found");
    err.status = 404;
    throw err;
  }
}

async function updateFirebaseUserPasswordByEmail(email, newPassword) {
  if (!email) {
    const err = new Error("email is required");
    err.status = 400;
    throw err;
  }
  if (!newPassword) {
    const err = new Error("newPassword is required");
    err.status = 400;
    throw err;
  }

  const firebase = initFirebaseAdmin();
  const user = await getFirebaseUserByEmail(email);
  await firebase.auth().updateUser(String(user.uid), {
    password: String(newPassword),
  });
  return true;
}

async function generateFirebasePasswordResetLink(email, continueUrl) {
  if (!email) {
    const err = new Error("email is required");
    err.status = 400;
    throw err;
  }

  const firebase = initFirebaseAdmin();
  const options = continueUrl
    ? {
        url: String(continueUrl),
        handleCodeInApp: false,
      }
    : undefined;

  try {
    return await firebase
      .auth()
      .generatePasswordResetLink(String(email), options);
  } catch (e) {
    const err = new Error("Unable to generate Firebase password reset link");
    err.status = 500;
    throw err;
  }
}

module.exports = {
  verifyFirebaseIdToken,
  getFirebaseUserByUid,
  getFirebaseUserByEmail,
  updateFirebaseUserPasswordByEmail,
  generateFirebasePasswordResetLink,
};
