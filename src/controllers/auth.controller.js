import { signInValidation, signUpValidation } from "../validationSchema.js";
import { v4 as uuid } from "uuid";
import bcrypt from "bcrypt";
import { usersCollection, sessionsCollection } from "../database/mongodb.js";

export const userSignIn = async (req, res) => {
	const signInInfo = req.body;
	const { error, value } = signInValidation.validate(signInInfo);
	if (error) return res.status(401).send(error.message);
	try {
		const isRegistered = await usersCollection.findOne({ email: value.email });
		if (!isRegistered) return res.status(404).send("User doesn't exist!");
		if (!bcrypt.compareSync(value.password, isRegistered.password)) {
			return res.status(401).send("Wrong password!");
		}
		delete isRegistered.password;
		delete isRegistered.repassword;
		const token = uuid();
		await sessionsCollection.insertOne({ userId: isRegistered._id, token });
		res.status(200).send({ token, ...isRegistered });
	} catch (error) {
		console.log("User trying to sign in user returned: ", error);
	}
};

export const userSignUp = async (req, res) => {
	const signUpInfo = req.body;
	const { error, value } = signUpValidation.validate(signUpInfo);
	if (error) return res.status(400).send(error.message);
	try {
		const isDuplicate = await usersCollection.findOne({ email: value.email });
		if (isDuplicate) return res.status(409).send("User already exists!");
		const passwordHash = bcrypt.hashSync(value.password, 10);
		delete value.repassword;
		await usersCollection.insertOne({
			...value,
			password: passwordHash,
		});
		res.sendStatus(201);
	} catch (error) {
		console.log("User trying to sign up returned: ", error);
	}
};
