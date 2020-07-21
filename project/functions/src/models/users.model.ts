import * as Joi from '@hapi/joi';

export default Joi.object({
    userId: Joi.string().allow(''),
    experience: Joi.number().positive(),
    rival: Joi.string().allow(''),
    number: Joi.number().positive()
});