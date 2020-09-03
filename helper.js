const generateRandomString = function () {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
  let randomString = "";
  for (let i = 1; i <= 6; i++) {
    randomString += letters[Math.floor(Math.random() * letters.length)];
  }
  return randomString;
};

const getUserByEmail = function(email, database) {
  for(const user in database){
    if (database[user].email === email) {
      return database[user];
    }
  }
};

module.exports = {generateRandomString, getUserByEmail}