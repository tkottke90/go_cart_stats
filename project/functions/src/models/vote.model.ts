import * as Joi from '@hapi/joi';

export default Joi.object({
    ballot: Joi.string().min(3),
    voter: Joi.string(),
    date: Joi.date().min('now')
});