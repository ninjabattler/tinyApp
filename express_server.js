const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));


app.set("view engine", "ejs");

//All shortend urls and the full url they reference
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//All registered users
const users = {

  'jjjjjj': {

    id: 'jjjjjj',

    email: 'j@j.j',

    password: 'j'

  }

}

function generateRandomString() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";

  let randomString = "";

  for (let i = 1; i <= 6; i++) {

    randomString += letters[Math.floor(Math.random() * letters.length)];

  }

  return randomString;
}
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.cookies['userId']] };
  res.render("urlsIndex", templateVars);
});
//Takes a post request for /urls and generates a new shortened url
app.post("/urls", (req, res) => {
  let rand = generateRandomString();
  urlDatabase[rand] = req.body.longURL;
  let templateVars = { shortURL: rand, longURL: req.body.longURL };
  res.render("urlsShow", templateVars);
});

//Page to login
app.get("/login", (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.cookies['userId']], badRequest: false };
  res.render("login", templateVars);
});

//Take in a username and log the user in
app.post("/login", (req, res) => {
  //Check if username or password fields are empty
  if (req.body.username === '' || req.body.password === '') {
    res.statusCode = 400;
    let templateVars = { urls: urlDatabase, user: users[req.cookies['userId']], badRequest: true };
    res.render("login", templateVars);
    return false
  }

  let foundUser = '';

  //Check for the account
  for (const user in users) {
    if (users[user].email === req.body.username) {
      if (users[user].password === req.body.password) {
        foundUser = users[user].id;
      }
    }
  }

  if(foundUser === ''){
    res.statusCode = 400;
    let templateVars = { urls: urlDatabase, user: users[req.cookies['userId']], badRequest: true };
    res.render("login", templateVars);
    return false
  }

  res.cookie("userId", foundUser);
  console.log(foundUser);
  res.redirect("/urls");
});

//Page to register
app.get("/register", (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.cookies['userId']], badRequest: false };
  res.render("register", templateVars);
});

//Register a new user
app.post("/register", (req, res) => {

  //Check if username or password fields are empty
  if (req.body.username === '' || req.body.password === '') {
    res.statusCode = 400;
    let templateVars = { urls: urlDatabase, user: users[req.cookies['userId']], badRequest: true };
    res.render("register", templateVars);
    return false
  }

  //Check if email has already been used
  for (const user in users) {
    if (users[user].email === req.body.username) {
      res.statusCode = 400;
      let templateVars = { urls: urlDatabase, user: users[req.cookies['userId']], badRequest: true };
      res.render("register", templateVars);
      return false
    }
  }

  const rand = generateRandomString();
  users[rand] = { id: rand, email: req.body.username, password: req.body.password };
  res.cookie("userId", rand);
  console.log(users);
  res.redirect("/urls");

});

app.post("/logout", (req, res) => {
  res.clearCookie('username')
  res.redirect("/urls");
});

//Page to create a new Url
app.get("/urls/new", (req, res) => {
  res.render("urlsNew");
});

//Delete a specific shortUrl
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  let templateVars = { urls: urlDatabase };
  res.redirect("/urls");
});

//Edit the longUrl of a specific shortUrl
app.post("/urls/:shortURL/edit", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect(`/urls/${req.params.shortURL}`);
});

//Redirect user to the longUrl attached to the entered shorUrl
app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urlsShow", templateVars);
});

//Start Listening
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});