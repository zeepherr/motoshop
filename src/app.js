import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { corsOptions } from "./config/index.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { notFound } from "./middlewares/notFound.middleware.js";
import { requestMdw } from "./middlewares/request.middlewares.js";
import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import brandRouter from "./routes/brand.route.js";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(requestMdw);
app.use(cors(corsOptions));

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/motor-brands", brandRouter);

app.use(notFound);
app.use(errorHandler);
export default app;
