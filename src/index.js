import express from "express";
import cors from "cors";
import { userSignIn, userSignUp } from "./controllers/auth.controller.js";
import {
	deleteExpenses,
	getExpenses,
	postExpenses,
} from "./controllers/users.controller.js";

const app = express();

// app configs
app.use(express.json());
app.use(cors());

app.post("/sign-in", userSignIn);

app.post("/sign-up", userSignUp);

app.get("/expenses", getExpenses);

app.post("/expenses", postExpenses);

app.delete("/expenses", deleteExpenses);

app.listen(5000, () => {
	console.log("Server running on port: 5000");
});
