import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const mongoClient = new MongoClient(process.env.MONGO_URI);

try {
	await mongoClient.connect();
} catch (error) {
	console.log("DB connection error: ", error);
}

const db = mongoClient.db("myWalletApp");
export const usersCollection = db.collection("users");
export const sessionsCollection = db.collection("sessions");
export const userExpensesCollection = db.collection("userExpenses");
