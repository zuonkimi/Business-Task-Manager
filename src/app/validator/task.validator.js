const Joi = require('joi');

const taskValidateSchema = Joi.object({
  title: Joi.string().min(1).required(),
  description: Joi.string().allow(''),
  status: Joi.string().valid('pending', 'done').optional(),
  deadline: Joi.date().optional().allow(''),
  tags: Joi.array()
    .items(
      Joi.string().valid(
        '安全書類',
        '請求書',
        '発注',
        '注文請書',
        'リモート',
        '領収書',
        '他',
      ),
    )
    .single(),
}).unknown(true);

module.exports = taskValidateSchema;
