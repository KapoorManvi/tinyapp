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

// const users = { 
//   "userRandomID": {
//     id: "userRandomID", 
//     email: "user@example.com", 
//     password: "purple-monkey-dinosaur"
//   },
//  "user2RandomID": {
//     id: "user2RandomID", 
//     email: "user2@example.com", 
//     password: "dishwasher-funk"
//   }
// };

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
  const userId = req.cookies.user_id;
  const user = users[userId];
  let templateVars = { urls: urlDatabase, 
    user: user,
  };
  res.render("urls_index", templateVars);
});

//A GET route to show the form that allows user to enter a URL to be shortened
app.get("/urls/new", (req, res) => {
  const userId = req.cookies.user_id;
  const user = users[userId];
  let templateVars = {
    user: user,
  };
  
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const userId = req.cookies.user_id;
  const user = users[userId];
  let templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL], 
    user: user,
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

// Accepts username input and shows user as logged in
app.post("/login", (req, res) => {
  
  res.cookie('user_id', req.body.username);
  res.redirect("/urls");
});

// Completes logout and clears username
app.post("/logout", (req, res) => {
  
  res.clearCookie('user_id', "");
  res.redirect("/urls");
});

// Displays Registration Page
app.get("/register", (req, res) => {
  const userId = req.cookies.user_id;
  const user = users[userId];
  let templateVars = {
    user: user,
  };
  res.render("urls_reg", templateVars);
});

const users = { 
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

app.post("/register", (req, res) => {
    // generate an id
    const userId = generateRandomString();
    // create a new user object => value associated with the id
    const newUser = {
      id: userId,
      email: req.body.email,
      password: req.body.password
    };
    // add new user object to the users db
    users[userId] = newUser;
    res.cookie('user_id', userId);
    res.redirect("/urls");
});

