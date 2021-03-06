const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");
const methodOverride = require('method-override')
const session = require('cookie-session');
const { getUserByEmail, generateRandomString } = require('./helper');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  name: 'session',
  keys: ['random'],
}));
app.set("view engine", "ejs");
app.use(methodOverride('_method'))

//All shortend urls and the full url they reference
const urlDatabase = {
};

//List all registered users
const users = {
  'jjjjjj': {
    id: 'jjjjjj',
    email: 'j@j.j',
    password: bcrypt.hashSync('j', 2)
  }
};

//List of Visits
const visits = {

  'b2xVn2':[],

  '9sm5xK':[]

}

//Redirect to the main page
app.get("/", (req, res) => {
  if(!req.session.userId){
    res.redirect('/login');
    return;
  }
  res.redirect("/urls");
});

//Main page
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.session.userId] };
  res.render("urlsIndex", templateVars);
});

//Takes a post request for /urls and generates a new shortened url
app.post("/urls", (req, res) => {
  if(!req.session.userId){
    res.redirect('/login');
    return;
  }
  let rand = generateRandomString();
  urlDatabase[rand] = { longUrl: req.body.longURL, id: req.session.userId, visits: 0 };
  visits[rand] = [];
  req.session[`unique${rand}`] = [];
  let templateVars = {
    shortURL: rand,
    longURL: req.body.longURL, user:
    users[req.session.userId],
    id: req.session.userId,
    visits: urlDatabase[rand].visits,
    visitList: visits[rand],
    uniques: req.session[`unique${rand}`]
  };
  res.redirect(`/urls/${rand}`);
});

//Page to login
app.get("/login", (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.session.userId], badRequest: false };
  res.render("login", templateVars);
});

//Take in a username and log the user in
app.post("/login", (req, res) => {
  //Check if username or password fields are empty
  if (req.body.username === '' || req.body.password === '') {
    res.statusCode = 403;
    let templateVars = { urls: urlDatabase, user: users[req.session.userId], badRequest: true };
    res.render("login", templateVars);
    return false;
  }

  //Check for the account
  let foundUser = getUserByEmail(req.body.username, users);
  if (foundUser) {
    if (bcrypt.compareSync(req.body.password, foundUser.password)) {
      foundUser = foundUser.id;
    } else {
      foundUser = '';
    }
  } else {
    foundUser = '';
  }

  if (foundUser === '') {
    res.statusCode = 403;
    let templateVars = { urls: urlDatabase, user: users[req.session.userId], badRequest: true };
    res.render("login", templateVars);
    return false;
  }

  req.session.userId = foundUser;
  console.log(foundUser);
  res.redirect("/urls");
});

//Logout by deleting the userId cookie
app.post("/logout", (req, res) => {
  req.session.userId = null;
  res.redirect("/urls");
});

//Page to register
app.get("/register", (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.session.userId], badRequest: false };
  res.render("register", templateVars);
});

//Register a new user
app.post("/register", (req, res) => {

  //Check if username or password fields are empty
  if (req.body.username === '' || req.body.password === '') {
    res.statusCode = 400;
    let templateVars = { urls: urlDatabase, user: users[req.session.userId], badRequest: true };
    res.render("register", templateVars);
    return false;
  }

  //Check if email has already been used
  if (getUserByEmail(req.body.username, users)) {
    res.statusCode = 400;
    let templateVars = { urls: urlDatabase, user: users[req.session.userId], badRequest: true };
    res.render("register", templateVars);
    return false;
  }


  const rand = generateRandomString();
  users[rand] = { id: rand, email: req.body.username, password: bcrypt.hashSync(req.body.password, 2) };
  req.session.userId = rand;
  console.log(users);
  res.redirect("/urls");

});

//Page to create a new Url
app.get("/urls/new", (req, res) => {
  if(!req.session.userId){
    res.redirect('/login');
    return;
  }
  let templateVars = { urls: urlDatabase, user: users[req.session.userId] };
  res.render("urlsNew", templateVars);
});

//Delete a specific shortUrl
app.delete("/urls/:shortURL", (req, res) => {
  if (req.session.userId === urlDatabase[req.params.shortURL].id) {
    delete urlDatabase[req.params.shortURL];
  }
  res.redirect("/urls");
});

//Edit the longUrl of a specific shortUrl
app.put("/urls/:shortURL", (req, res) => {
  if(!req.session.userId){
    res.redirect('/login');
    return;
  }
  if (req.session.userId === urlDatabase[req.params.shortURL].id) {
    urlDatabase[req.params.shortURL] = {
      longUrl: req.body.longURL,
      id: urlDatabase[req.params.shortURL].id,
      visits: urlDatabase[req.params.shortURL].visits,
      uniques: req.session[`unique${req.params.shortURL}`]
    };
  }
  res.redirect(`/urls/${req.params.shortURL}`);
});

//Redirect user to the longUrl attached to the entered shorUrl
app.get("/u/:shortURL", (req, res) => {
  if(!req.session[`unique${req.params.shortURL}`]){
    res.redirect('/urls');
    return;
  }
  let unique = true
  
  for(const id of req.session[`unique${req.params.shortURL}`]){
    if(id === req.session.userId){
      unique = false;
    }
  }
  if(unique === true){
   req.session[`unique${req.params.shortURL}`].push(req.session.userId);
  }
  urlDatabase[req.params.shortURL].visits++;
  visits[req.params.shortURL].push({user: req.session.userId, date: new Date()})
  req.session.visited
  res.redirect(urlDatabase[req.params.shortURL]['longUrl']);
});

//Show one tiny Url
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]['longUrl'],
    id: urlDatabase[req.params.shortURL]['id'],
    visits: urlDatabase[req.params.shortURL].visits,
    user: users[req.session.userId],
    visitList: visits[req.params.shortURL],
    uniques: req.session[`unique${req.params.shortURL}`]
  };
  res.render("urlsShow", templateVars);
});

//Start Listening
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});