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
	if (!userExpenses) return res.sendStatus(200);
	const aggPipeline = [
		{
			$match: { userId: user.userId },
		},
		{
			$unwind: "$expenses",
		},
		{
			$project: {
				value: {
					$cond: {
						if: { $eq: ["$expenses.type", "in"] },
						then: "$expenses.value",
						else: { $multiply: ["$expenses.value", -1] },
					},
				},
			},
		},
		{
			$group: {
				_id: null,
				total: { $sum: "$value" },
			},
		},
	];
	const aggResult = await userExpensesCollection
		.aggregate(aggPipeline)
		.toArray();
	const total = aggResult.pop().total;
	userExpenses.total = total;
	res.status(200).send(userExpenses);
};

export const postExpenses = async (req, res) => {
	const user = await validateToken(req.headers.authorization);
	const expenses = req.body;
	if (!user) res.status(404).send("Invalid token!");
	if (!expenses) res.sendStatus(400);
	const { value, description, type } = expenses;
	const date = dayjs().format("DD/MM");
	const userExpenses = await userExpensesCollection.findOne({
		userId: user.userId,
	});
	if (!userExpenses) {
		await userExpensesCollection.insertOne({
			userId: user.userId,
			expenses: [
				{
					item: 1,
					value: parseFloat(value),
					description,
					type,
					date,
				},
			],
		});
		return res.sendStatus(201);
	}
	const item = userExpenses.expenses.length + 1;
	const expense = {
		item,
		value: parseFloat(value),
		description,
		type,
		date,
	};
	await userExpensesCollection.updateOne(userExpenses, {
		$push: { expenses: expense },
	});
	res.sendStatus(201);
};
