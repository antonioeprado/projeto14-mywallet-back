import express from "express";
import cors from "cors";
import authRoute from "./routers/auth.routes.js";
import expensesRoute from "./routers/users.routes.js";

const app = express();

// app configs
app.use(express.json());
app.use(cors());
app.use(authRoute);
app.use(expensesRoute);

app.listen(5000, () => {
	console.log("Server running on port: 5000");
});
