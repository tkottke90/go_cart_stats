import * as Joi from '@hapi/joi';

export default Joi.object({
    userId: Joi.string(),
    date: Joi.date(),
    cartNumber: Joi.number().positive(),
    trackId: Joi.string().optional(),
    laps: Joi.array().items(Joi.object({
        display: Joi.string().pattern(/[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2}/),
        position: Joi.string().allow(''),
        timeComponents: Joi.object({
            minutes: Joi.number().min(0),
            seconds: Joi.number().min(0),
            milliseconds: Joi.number().min(0)
        }),
        bestLap: Joi.boolean()
    }))
});