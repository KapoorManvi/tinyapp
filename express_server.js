const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

app.set("view engine", "ejs");
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  let randString = Math.random().toString(36).substr(2, 6);
  return randString;
}

app.use(bodyParser.urlencoded({extended: true}));

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  console.log("req.cookies: ", req.cookies);
  let templateVars = { urls: urlDatabase, 
    username: req.cookies["username"],
  };
  res.render("urls_index", templateVars);
});

//A GET route to show the form that allows user to enter a URL to be shortened
app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
  };
  
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL], 
    username: req.cookies["username"],
  };
  res.render("urls_show", templateVars);
});

//A POST request to accept the user input from the URL shortener form
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL; // shortURL-longURL key-value pair are saved to the urlDatabase when it receives a POST request to /urls
  res.redirect(`/urls/${shortURL}`); // generates short url random string
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

//Takes user to the website as indicated by longURL when shortUL is clicked
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//Delete URL button added to main page that lists all shortened URLs - deletes URL from urlDatabase
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//Edit URLs feature - edit button on main page takes you to a new page to enter a new long URL to replace an existing shortened URL
app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  
  res.cookie('username', req.body.username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  
  res.clearCookie('username', "");
  res.redirect("/urls");
});