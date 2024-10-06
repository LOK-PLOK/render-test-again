const express = require("express");
const morgan = require("morgan");
const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json());
app.use(express.static("dist"));

morgan.token("body", (req) => {
  return JSON.stringify(req.body);
});

app.use(
  morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
      tokens.body(req, res),
    ].join(" ");
  })
);

let persons = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/", (request, response) => {
  response.send("<h1>Hello World!</h1>");
});

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/api/info", (request, response) => {
  const size = persons.length;
  const date = new Date();
  response.send(`<p>Phonbook has info for ${size} people</p> <p>${date}</p>`);
});

app.get("/api/persons/:id", (request, response) => {
  const id = String(request.params.id);
  const person = persons.find((person) => person.id === id);
  if (person) {
    response.json(person);
  } else {
    console.log("x");
    response.status(404).end();
  }
});

const generateId = () => {
  const maxId = persons.length > 0 ? Math.floor(Math.random() * 3000) : 0;
  return maxId + 1;
};

app.post("/api/persons", (request, response) => {
  const body = request.body;
  // console.log("Received body:", body);

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: "name or number missing",
    });
  }

  const duplicateName = persons.find((person) => person.name === body.name);
  const duplicateNumber = persons.find(
    (person) => person.number === body.number
  );

  if (duplicateName && duplicateNumber) {
    return response.status(409).json({
      error: "name and number must be unique",
    });
  }

  const person = {
    id: generateId().toString(),
    name: body.name,
    number: body.number,
  };

  persons = persons.concat(person);
  // console.log("New person added:", person);

  response.status(201);
  response.json(person);
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((person) => person.id !== id);

  response.status(204).end();
});

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
