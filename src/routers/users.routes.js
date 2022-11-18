import {
	deleteExpenses,
	getExpenses,
	postExpenses,
	putExpenses,
} from "../controllers/users.controller.js";
import { Router } from "express";
import {
	checkRequestToken,
	validateToken,
} from "../middlewares/auth.middleware.js";
import {
	findExpenses,
	checkReqExpenses,
	checkItemReq,
	checkPutPayload,
} from "../middlewares/users.middleware.js";

const route = Router();
route.use(checkRequestToken);
route.use(validateToken);

route.get("/expenses", findExpenses, getExpenses);

route.post("/expenses", checkReqExpenses, postExpenses);

route.delete("/expenses", checkItemReq, deleteExpenses);

route.put("/expenses", checkPutPayload, putExpenses);

export default route;
