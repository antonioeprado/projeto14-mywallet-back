import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import { signInValidation, signUpValidation } from "./validationSchema.js";
import dayjs from "dayjs";

dotenv.config();

const app = express();

// app configs
app.use(express.json());
app.use(cors());

// db configs
const mongoClient = new MongoClient(process.env.MONGO_URI);

try {
	await mongoClient.connect();
} catch (error) {
	console.log("DB connection error: ", error);
}

const db = mongoClient.db("myWalletApp");
const usersCollection = db.collection("users");
const sessionsCollection = db.collection("sessions");
const userExpensesCollection = db.collection("userExpenses");

async function validateToken(requestToken) {
	const token = requestToken.replace("Bearer ", "");
	return await sessionsCollection.findOne({ token });
}

app.post("/sign-in", async (req, res) => {
	const signInInfo = req.body;
	const { error, value } = signInValidation.validate(signInInfo);
	if (error) {
		return res.status(401).send(error.message);
	}
	try {
		const isRegistered = await usersCollection.findOne({ email: value.email });
		if (!isRegistered) {
			return res.status(404).send("User doesn't exist!");
		}
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
});

app.post("/sign-up", async (req, res) => {
	const signUpInfo = req.body;
	const { error, value } = signUpValidation.validate(signUpInfo);
	if (error) {
		return res.status(400).send(error.message);
	}
	try {
		const isDuplicate = await usersCollection.findOne({ email: value.email });
		if (isDuplicate) {
			return res.status(409).send("User already exists!");
		}
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
});

app.get("/expenses", async (req, res) => {
	const user = await validateToken(req.headers.authorization);
	if (!user) {
		return res.status(404).send("Invalid token!");
	}
	const userExpenses = await userExpensesCollection.findOne({
		userId: user.userId,
	});
	console.log(userExpenses);
	res.status(200).send(userExpenses);
});

app.post("/expenses", async (req, res) => {
	const user = await validateToken(req.headers.authorization);
	const expenses = req.body;
	if (!user) res.status(404).send("Invalid token!");
	if (!expenses) res.sendStatus(400);
	expenses.date = dayjs().format("DD/MM");
	const userExpenses = await userExpensesCollection.findOne({
		userId: user.userId,
	});
	if (!userExpenses) {
		await userExpensesCollection.insertOne({
			userId: user.userId,
			expenses: [{ ...expenses, item: 1 }],
		});
		return res.sendStatus(201);
	}
	const index = userExpenses.expenses.length;
	expenses.item = index + 1;
	await userExpensesCollection.updateOne(userExpenses, {
		$push: { expenses },
	});
	res.sendStatus(200);
});

app.listen(5000, () => {
	console.log("Server running on port: 5000");
});
