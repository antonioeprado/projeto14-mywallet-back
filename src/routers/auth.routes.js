import { userSignIn, userSignUp } from "../controllers/auth.controller.js";
import { Router } from "express";
import {
	checkPayload,
	validadeSignUpPayload,
	validateSignInPayload,
} from "../middlewares/auth.middleware.js";

const route = Router();
route.use(checkPayload);

route.post("/sign-in", validateSignInPayload, userSignIn);

route.post("/sign-up", validadeSignUpPayload, userSignUp);

export default route;
