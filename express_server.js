const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');


app.set("view engine", "ejs");
app.use(cookieParser());

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lP" }
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
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

// Displays the URLS page with the list of shortened URLs for a given user 
app.get("/urls", (req, res) => {
  console.log("req.cookies: ", req.cookies);
  console.log("USERS DB: ", users);
  const userId = req.cookies.user_id;
  const user = users[userId];
  let urlsForLoggedInUser = {};
  if (userId) {

    for (obj in urlDatabase) {
      console.log(urlDatabase[obj]);
      if (urlDatabase[obj].userID === userId) {
        urlsForLoggedInUser[obj] = urlDatabase[obj];
      }
    }
    let templateVars = { urls: urlsForLoggedInUser,
      user: user,
    };
    res.render("urls_index", templateVars);
  } else {
    res.status(403).send('<h1>Halt! Who goes there??</h1> <p>Shoot, it looks like you forgot to login. Back up, and try again.</p>');
  }
});

//Displays the form that allows user to enter a URL to be shortened
app.get("/urls/new", (req, res) => {
  const userId = req.cookies.user_id;
  const user = users[userId];
  let templateVars = {
    user: user,
  };
  if (user) {
    res.render("urls_new", templateVars);

  } else {
    res.redirect("/login");
  }
});

//Displays the Edit URL page for a given URL
app.get("/urls/:shortURL", (req, res) => {
  const userId = req.cookies.user_id;
  const user = users[userId];

  if (userId === urlDatabase[req.params.shortURL].userID) {
    let templateVars = { 
      shortURL: req.params.shortURL, 
      longURL: urlDatabase[req.params.shortURL].longURL, 
      user: user,
    };
    res.render("urls_show", templateVars);
    
  } else {
    res.status(403).send('<h1>Uh, this URL does not belong to you. </h1> <p>Sharing is usually caring, but not today. Stick to your own URLs please! </p>');
  }
});

//A POST request to accept the user input from the URL shortener form
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  const userId = req.cookies.user_id;
  urlDatabase[shortURL] = {longURL: longURL, userID: userId }; // shortURL-longURL key-value pair are saved to the urlDatabase when it receives a POST request to /urls
  res.redirect('/urls'); // generates short url random string
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

//Takes user to the website as indicated by longURL when shortUL is clicked
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//Delete URL button added to main page that lists all shortened URLs - deletes URL from urlDatabase
app.post("/urls/:shortURL/delete", (req, res) => {
  const userId = req.cookies && req.cookies.user_id

  if (userId === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.status(403).send('<h1>Uh, this URL does not belong to you. </h1> <p>Sharing is usually caring, but not today. Stick to deleting your own URLs please! </p>');
  }
  
});

//Edit URLs feature - edit button on main page takes you to a new page to enter a new long URL to replace an existing shortened URL
app.post("/urls/:shortURL", (req, res) => {
  const userId = req.cookies && req.cookies.user_id
  
  if (userId === urlDatabase[req.params.shortURL].userID) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect("/urls");
  
  } else {
    res.status(403).send('<h1>Uh, this URL does not belong to you. </h1> <p>Sharing is usually caring, but not today. Stick to editing your own URLs please! </p>');
  }
  
});

// Accepts email and password input on the login page, compares them to stored values for a match and places cookie if there is a match
app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  if (!checkExistingEmail(email)) {
    res.status(403).send('<h1>403 Error</h1> <p>Shoot, it looks like that email is not registered. Check for typos and try again.</p>');
  } else if (checkExistingEmail(email) && checkExistingPassword(password)) {
    
    const userId = getIdByEmail(email);
    res.cookie('user_id', userId); 
    res.redirect("/urls");
  } else {
    res.status(403).send('<h1>403 Error</h1> <p>Uh, did you forget something...? The password and email do not match.</p>');
  }
  
});

//Displays the login page
app.get("/login", (req, res) => {
  const userId = req.cookies.user_id;
  const user = users[userId];
  let templateVars = {
    user: user,
  };
  res.render("urls_login", templateVars);
});

// Completes logout and clears username
app.post("/logout", (req, res) => {
  
  res.clearCookie('user_id', "");
  res.redirect("/login");
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

// Receives submitted registration form, checks if the email submitted already exists as a registered account & generates a new user ID
app.post("/register", (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    if (email === "" || password === "") {
      res.status(400).send('<h1>400 Error</h1> <p>Uh, did you forget something...? Password and email fields cannot be blank.</p>');
    } else if (checkExistingEmail(email)) {
      res.status(400).send('<h1>400 Error</h1> <p>Uh oh, this email is already registered. Pick a different one and try again. </p>');
    } else {
      // generate an id
      const userId = generateRandomString();
      // create a new user object => value associated with the id
      const newUser = {
        id: userId,
        email: req.body.email,
        password: bcrypt.hashSync(password, 10),
      };
      // add new user object to the users db
      users[userId] = newUser;
      res.cookie('user_id', userId);
      res.redirect("/urls");
    }
});

// Checks if an input email from registration or login page is already in the users database
function checkExistingEmail(inputEmail) {
  for (id in users) {
    if (users[id]['email'] === inputEmail) {
      return true;
    }
  }
  return false;
}

// Checks if an input password from login page is already in the users database
function checkExistingPassword(inputPw) {
  for (id in users) {
    if (bcrypt.compareSync(inputPw, users[id]['password'])) { 
      return true;
    }
  }
  return false;
}

function getIdByEmail(inputEmail) {
  for (id in users) {
    if (users[id]['email'] === inputEmail) {
      return id;
    }
  }
}
