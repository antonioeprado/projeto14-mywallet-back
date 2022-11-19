import dayjs from "dayjs";
import { userExpensesCollection } from "../database/mongodb.js";
import { ObjectID } from "bson";

export const getExpenses = async (req, res) => {
	const { userId } = req.user;
	const aggPipeline = [
		{
			$match: { userId },
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
	req.expenses.total = total;
	res.status(200).send(req.expenses);
};

export const postExpenses = async (req, res) => {
	const { value, description, type } = req.expenses;
	const { userId } = req.user;
	const date = dayjs().format("DD/MM");
	const userExpenses = await userExpensesCollection.findOne({
		userId,
	});
	if (!userExpenses) {
		await userExpensesCollection.insertOne({
			userId,
			expenses: [
				{
					_id: new ObjectID(),
					value: parseFloat(value),
					description,
					type,
					date,
				},
			],
		});
		return res.sendStatus(201);
	}
	const expense = {
		_id: new ObjectID(),
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

export const deleteExpenses = async (req, res) => {
	const item = req.item;
	const { userId } = req.user;
	try {
		await userExpensesCollection.updateOne(
			{ "expenses._id": ObjectID(item) },
			{ $pull: { expenses: { _id: ObjectID(item) } } }
		);
		const expenses = await userExpensesCollection.findOne({ userId });
		res.status(200).send(expenses);
	} catch (error) {
		console.log(error);
	}
};

export const putExpenses = async (req, res) => {
	const { userId } = req.user;
	const { value, description, item } = req.body;
	try {
		await userExpensesCollection.updateOne(
			{ "expenses._id": ObjectID(item) },
			{
				$set: {
					"expenses.$.value": Number(value),
					"expenses.$.description": description,
				},
			}
		);
		const expenses = userExpensesCollection.findOne({ userId });
		res.status(200).send(expenses);
	} catch (error) {
		console.log(error);
	}
};
