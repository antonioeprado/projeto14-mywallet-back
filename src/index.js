import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import bcrypt from "bcrypt";
import Joi from "joi";
import { signInValidation } from "./validationSchema.js";

dotenv.config();

const app = express();

// app configs
app.use(cors());
app.use(express.json());

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

app.post("/sign-in", async (req, res) => {
	const signInInfo = req.body;
	const { error, value } = signInValidation.validate(signInInfo);
	if (error) {
		return res.status(401).send(error.message);
	}
	try {
		const isRegistered = await usersCollection.findOne(value);
		if (!isRegistered) {
			return res.status(404).send("User doesn't exist!");
		}
		res.sendStatus(200);
	} catch (error) {
		console.log("Trying to find signIn user returned: ", error);
	}
});
