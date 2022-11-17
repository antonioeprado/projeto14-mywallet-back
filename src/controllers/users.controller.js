import dayjs from "dayjs";
import { validateToken } from "./auth.controller.js";
import { userExpensesCollection } from "../db/mongodb.js";

export const getExpenses = async (req, res) => {
	const user = await validateToken(req.headers.authorization);
	if (!user) {
		return res.status(404).send("Invalid token!");
	}
	const userExpenses = await userExpensesCollection.findOne({
		userId: user.userId,
	});
	console.log(userExpenses);
	res.status(200).send(userExpenses);
};

export const postExpenses = async (req, res) => {
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
};
