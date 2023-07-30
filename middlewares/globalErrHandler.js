const globalErrHandler = (err, req, res, next) => {
  //status
  //message
  //stack shows the actual erro message with details
  const stack = err.stack;
  const message = err.message;
  const status = err.status ? err.status : "failed";
  const statusCode = err?.statusCode ? err.statusCode : 500;

  //Send the response to user
  res.status(statusCode).json({
    message,
    stack,
    status,
  });
};

module.exports = globalErrHandler;
