// IMPORTED TOOLS ------------------------------------------------------------
const bcrypt = require('bcrypt');

//HELPER FUNCTIONS -----------------------------------------------------------

// Checks if an input email from registration or login page is already in the users database
function checkExistingEmail(inputEmail, users) {
  for (id in users) {
    if (users[id]['email'] === inputEmail) {
      return true;
    }
  }
  return false;
}

// Checks if an input password from login page is already in the users database
function checkExistingPassword(inputPw, users) {
  for (id in users) {
    if (bcrypt.compareSync(inputPw, users[id]['password'])) { 
      return true;
    }
  }
  return false;
}

// Retrieves user ID by searching for input email
function getIdByEmail(inputEmail, users) {
  for (id in users) {
    if (users[id]['email'] === inputEmail) {
      return id;
    }
  }
}

module.exports = {checkExistingEmail, checkExistingPassword, getIdByEmail};

