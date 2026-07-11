function errorHandler(err, req, res, next) {
    const statusCode = err.status || 500;
    res.status(statusCode).json({
        error: {
            code: err.code || 'INTERNAL_ERROR',
            message: err.message || 'An unexpected error occurred.',
            timestamp: new Date().toISOString()
        }
    });
}
module.exports = errorHandler;
