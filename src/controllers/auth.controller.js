import { v4 as uuid } from "uuid";
import bcrypt from "bcrypt";
import { usersCollection, sessionsCollection } from "../database/mongodb.js";

export const userSignIn = async (req, res) => {
	try {
		const token = uuid();
		const userId = req.user._id;
		const user = { userId, token };
		await sessionsCollection.insertOne(user);
		const { name, email } = req.user;
		res.status(200).send({ name, email, token });
	} catch (error) {
		console.log("User trying to sign in user returned: ", error);
	}
};

export const userSignUp = async (req, res) => {
	const { name, email, password } = req.user;
	try {
		const isDuplicate = await usersCollection.findOne({ email });
		if (isDuplicate) return res.status(409).send("User already exists!");
		const passwordHash = bcrypt.hashSync(password, 10);
		await usersCollection.insertOne({
			name,
			email,
			password: passwordHash,
		});
		res.sendStatus(201);
	} catch (error) {
		console.log("User trying to sign up returned: ", error);
	}
};
