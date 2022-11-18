import {
	deleteExpenses,
	getExpenses,
	postExpenses,
	putExpenses,
} from "../controllers/users.controller.js";
import { Router } from "express";

const route = Router();

route.get("/expenses", getExpenses);

route.post("/expenses", postExpenses);

route.delete("/expenses", deleteExpenses);

route.put("/expenses", putExpenses);

export default route;
