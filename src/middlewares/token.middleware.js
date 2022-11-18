export async function checkRequestToken(req, res, next) {
	const reqToken = req.body.authorization;
	if (!reqToken) return res.sendStatus(401);
	req.token = reqToken;
	next();
}

export async function validateToken(req, res, next) {
	const token = req.token.replace("Bearer ", "");
	const user = await sessionsCollection.findOne({ token });
	if (!user) return res.sendStatus(401);
	req.user = user;
	next();
}
