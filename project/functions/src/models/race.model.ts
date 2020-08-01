import * as Joi from '@hapi/joi';

export default Joi.object({
    userId: Joi.string(),
    date: Joi.date(),
    cartNumber: Joi.number().positive(),
    trackId: Joi.string().optional(),
    totalTime: Joi.string().allow(''),
    bestTime: Joi.string().allow(''),
    laps: Joi.array().items(Joi.object({
        position: Joi.string().allow(''),
        time: Joi.string().allow(''),
        bestLap: Joi.boolean()
    })),
    invalid: Joi.boolean()
});