const validate = schema => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false, // show all errors
  });

  if (error) {
    console.log('❌ VALIDATION ERROR:', error.details);

    return res.status(400).send(error.details.map(e => e.message));
  }

  req.body = value;
  next();
};

module.exports = validate;
