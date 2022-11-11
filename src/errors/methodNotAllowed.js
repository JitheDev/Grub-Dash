//if a request is not permitted send status 405 alerting that ${request.method} is not allowed 
function methodNotAllowed(request, response, next) {
  next({
    status: 405,
    message: `${request.method} not allowed for ${request.originalUrl}`,
  });
}

module.exports = methodNotAllowed;
