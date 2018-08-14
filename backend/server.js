var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var messages = [{
  text: 'Tim text',
  owner: 'Tim',
},
{
  text: 'Jone text',
  owner: 'Jone',
}
];

var users = [{
  firstName: 'a',
  email: 'a',
  password: 'a',
  id: 0
}];


app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With');
  next();
});

var api = express.Router();
var auth = express.Router();


api.get('/messages', (req, res) => {
  res.json(messages);
});

api.get('/messages/:user', (req, res) => {
  var user = req.params.user;
  var result = messages.filter(message => message.owner == user);
  res.json(result);
});

api.post('/messages', (req, res) => {
  console.log(req.body);
  messages.push(req.body);
  res.json(req.body);
});

api.get('/users/me', checkAuthenticated, (req, res) => {
  console.log("Request Parameter : User",req.user);
  res.json(users[req.user]);
});

api.post('/users/me', checkAuthenticated, (req, res) => {
  console.log("Request Parameter : User",req.user);
  // res.json(users[req.user]);
  var user = users[req.user];
  user.firstName = req.body.firstName;
  user.lastName = req.body.lastName;
  res.json(user);
});

auth.post('/login', (req, res) => {
  console.log('Blah.............')
  var user = users.find(user => user.email == req.body.email);
  console.log("user:",user)
  if (!user)
  sendAuthError(res);
  if (user.password == req.body.password)
  sendToken(user, res);
  else
  sendAuthError(res);
});

auth.post('/register', (req, res) => {
  var index = users.push(req.body) - 1;
  var user = users[index];
  user.id = index;
  sendToken(user, res);
})

function sendToken(user, res) {
  var token = jwt.sign(user.id, '123');
  res.json({ firstName: user.firstName, token: token });
}

function sendAuthError(res) {
  return res.json({ sucess: false, message: 'Email or Password incorrect' });
}

function checkAuthenticated(req, res, next) {
  console.log(req.header);
  if (!req.header('authorization'))
  return res.status(401).send({ message: 'Unauthorized requested. Missing Authentication Header' });

  var token = req.header('authorization').split(' ')[1];
  var payload = jwt.decode(token, '123');
  console.log("Payload",payload);
  console.log("token",token);
  if (!payload)
  return res.status(401).send({ message: 'Unauthorized requested. Authentication Header Invalid' });

  req.user = payload;
  next();

}

app.use('/api', api);
app.use('/auth', auth);

app.listen(63145);
