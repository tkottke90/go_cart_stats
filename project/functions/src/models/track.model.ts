import * as Joi from '@hapi/joi';

export default Joi.object({
  name: Joi.string(),
  thumbnail: Joi.string(),
  hotLaps: Joi.array().length(0)
})