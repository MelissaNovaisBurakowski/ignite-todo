const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(req, resp, next) {
  const { username } = req.headers;
  const user = users.find(user => user.username === username);
  if (!user) {
    return resp.status(400).json({ error: "User not found" })
  }
  req.user = user;
  next();
}

app.post('/users', (req, resp) => {
  const { name, username } = req.body;
  const hasUser = users.some(user => user.username === username);
  if (hasUser) {
    return resp.status(400).json({ error: "User already exists" })
  }
  const user = {
    id: uuidv4(), name, username, todos: []
  }
  users.push(user);
  resp.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (req, resp) => {
  const { user } = req;
  resp.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (req, resp) => {
  const { user } = req;
  const { title, deadline } = req.body;
  const todo = { title, deadline: new Date(deadline), created_at: new Date(), id: uuidv4(), done: false }
  user.todos.push(todo);
  resp.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (req, resp) => {
  const { user } = req;
  const { title, deadline } = req.body;
  const { id } = req.params;
  const todo = user.todos.find(todo => todo.id === id)
  if (!todo) {
    resp.status(404).json({ error: "Todo not found" })
  }
  todo.title = title;
  todo.deadline = new Date(deadline);
  resp.json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (req, resp) => {
  const { user } = req;
  const { id } = req.params;
  const todo = user.todos.find(todo => todo.id === id)
  if (!todo) {
    resp.status(404).json({ error: "Todo not found" })
  }
  todo.done = true;
  resp.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (req, resp) => {
  const { user } = req;
  const { id } = req.params;
  const todo = user.todos.find(todo => todo.id === id)
  if (!todo) {
    resp.status(404).json({ error: "Todo not found" })
  }
  user.todos.splice(todo, 1)
  resp.status(204).json(users.todos);
});

module.exports = app;