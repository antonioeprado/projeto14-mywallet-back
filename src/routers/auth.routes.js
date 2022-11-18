import { userSignIn, userSignUp } from "../controllers/auth.controller.js";
import { Router } from "express";

const route = Router();

route.post("/sign-in", userSignIn);

route.post("/sign-up", userSignUp);

export default route;
