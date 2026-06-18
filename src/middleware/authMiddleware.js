const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    let token;

    // Log untuk intip apa yang dikirim Postman / Frontend
    console.log("Header Auth:", req.headers.authorization);

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            console.log("Token yang diambil:", token);

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Menyimpan hasil decode token (berisi id user) ke objek req.user
            req.user = decoded;
            next();
        } catch (error) {
            console.error("JWT Error:", error.message);
            res.status(401).json({ message: 'Token tidak valid' });
        }
    } else {
        res.status(401).json({ message: 'Akses ditolak, format token salah' });
    }
};

module.exports = { protect };