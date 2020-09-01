const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

//All shortend urls and the full url they reference
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";

  let randomString = "";

  for(let i = 1; i <= 6; i++){

    randomString += letters[Math.floor(Math.random() * letters.length)];

  }

  return randomString;
}
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urlsIndex", templateVars);
});
//Takes a post request for /urls and generates a new shortened url
app.post("/urls", (req, res) => {
  let rand = generateRandomString();
  urlDatabase[rand] = req.body.longURL;
  let templateVars = { shortURL: rand, longURL: req.body.longURL };
  res.render("urlsShow", templateVars);    
});

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