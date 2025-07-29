const app = require("../server");
const errorHandler = (err,req,res,next) => {
    console.error(err.stack);


    let statusCode = 500;
    let message = 'Something went wrong on the server';

    if (err.message) {
        message = err.message;
    }

    res.status(statusCode).json({
        success : false,
        message: message,
    });
};

module.exports = errorHandler;

