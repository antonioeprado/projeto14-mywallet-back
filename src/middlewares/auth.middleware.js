import { sessionsCollection, usersCollection } from "../database/mongodb.js";
import { signInValidation, signUpValidation } from "./validationSchema.js";
import bcrypt from "bcrypt";

export async function checkRequestToken(req, res, next) {
	const reqToken = req.headers.authorization;
	if (!reqToken) return res.sendStatus(401);
	req.token = reqToken.replace("Bearer ", "");
	next();
}

export async function validateToken(req, res, next) {
	const token = req.token;
	const user = await sessionsCollection.findOne({ token });
	if (!user) return res.sendStatus(401);
	req.user = user;
	next();
}

export async function checkPayload(req, res, next) {
	if (!req.body) return res.sendStatus(401);
	req.payload = req.body;
	next();
}

export async function validateSignInPayload(req, res, next) {
	const { error, value } = signInValidation.validate(req.payload);
	if (error) return res.status(400).send(error.message);
	const isRegistered = await usersCollection.findOne({ email: value.email });
	if (!isRegistered) return res.sendStatus(401);
	if (!bcrypt.compareSync(value.password, isRegistered.password)) {
		return res.status(401).send("Wrong password!");
	}
	delete isRegistered.password;
	delete isRegistered.repassword;
	req.user = isRegistered;
	next();
}

export async function validadeSignUpPayload(req, res, next) {
	const { error, value } = signUpValidation.validate(req.payload);
	if (error) return res.status(400).send(error.message);
	req.user = value;
	next();
}
