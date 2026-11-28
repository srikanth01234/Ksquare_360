const mongoose = require('mongoose');

// Bind every model operation in these handlers to the transaction's session.
mongoose.set('transactionAsyncLocalStorage', true);

module.exports = function transactionalWrite(handler) {
  return async (req, res, next) => {
    try {
      const result = await mongoose.connection.transaction(async () => {
        const response = { status: 200, body: undefined };
        await handler(req, {
          status(code) {
            response.status = code;
            return this;
          },
          json(body) { response.body = body; },
        }, (error) => { throw error; });
        return response;
      });
      return res.status(result.status).json(result.body);
    } catch (error) {
      if (error.code === 11000 && error.keyPattern?.submissionKey) {
        return res.status(409).json({
          success: false,
          message: 'This expense was already submitted. Retry to retrieve the saved expense.',
        });
      }
      return next(error);
    }
  };
};
