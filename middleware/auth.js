const jwt = require('jsonwebtoken');
module.exports = function(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.sendStatus(401);
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (err) {
        res.sendStatus(403);
    }
};
