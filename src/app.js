const path = require("path");
const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const cors = require("cors");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const userRouter = require("./routes/userRoutes");
const viewRouter = require("./routes/viewRoutes");
const authController = require("./controllers/authController");



// TODO -
/*  user confirm password when deleting accounts, 
    delete user main account,
    change CSS, remove unnecessary classes, responsiveness, adjust classes,
    payments for sub,
    forgot password - send email ==> token?,
    CSRF TOKENS,
    panel admina,
    zbundlowany js
*/
// Start express app
const app = express();

app.enable("trust proxy");

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(cors());
app.options("*", cors());

app.use(express.static(path.join(__dirname, "public")));

app.use(helmet());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const reqLimiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", reqLimiter);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

app.use(mongoSanitize());

app.use(xss());

app.use(compression());

app.use("/", viewRouter);
app.use("/api/v1/users", userRouter);

app.all("*", authController.isLoggedIn, (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
