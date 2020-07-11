// IMPORTED TOOLS AND FUNCTIONS-----------------------------------------------

const { assert } = require('chai');

const { checkExistingEmail } = require('../helpers');

// TEST USERS DATABASE -------------------------------------------------------
const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

// TESTS ---------------------------------------------------------------------
describe('checkExistingEmail', function() {
  it('should return true if the input email exists', function() {
    const user = checkExistingEmail("user@example.com", testUsers);
    const expectedOutput = "true";
    assert.isTrue(user, "The email is already registered.")
  });

  it('should return false if the input email does not exist', function() {
    const user = checkExistingEmail("user5@example.com", testUsers);
    const expectedOutput = "false";
    assert.isFalse(user, "The email is not registered.")
  });
});