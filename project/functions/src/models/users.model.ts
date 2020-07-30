import * as Joi from '@hapi/joi';

export default Joi.object({
    id: Joi.string().allow(''),
    displayName: Joi.string().allow('').optional(),
    nickname: Joi.string().allow('').optional(),
    email: Joi.string().email().optional(),
    experience: Joi.number().positive(),
    rival: Joi.string().allow('').optional(),
    number: Joi.number().positive(),
    new: Joi.boolean().default(true)
});