const config = require("./utils/config");
const express = require("express");
const app = express();
const cors = require("cors");
require("express-async-errors");
const uploadRouter = require("./controllers/upload");
// const blogsRouter = require('./controllers/blogs')
// const usersRouter = require('./controllers/users')
// const loginRouter = require('./controllers/login')
// const middleware = require('./utils/middleware')
const logger = require("./utils/logger");
// const mongoose = require('mongoose')

app.use(cors());
app.use(express.static("dist"));
app.use(express.json());
// app.use(middleware.requestLogger)
// app.use(middleware.tokenExtractor)
app.get("/", async (request, response, next) => {
  response.json({ message: "Hello World" });
});

app.use("/api/upload", uploadRouter);
// app.use('/api/blogs', blogsRouter)

// /app.use('/api/users', usersRouter)

// if (process.env.NODE_ENV === 'test') {
//   const testingRouter = require('./controllers/testing')
//   app.use('/api/testing', testingRouter)

// }

// app.use(middleware.unknownEndpoint)
// app.use(middleware.errorHandler)

module.exports = app;
