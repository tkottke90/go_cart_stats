import * as Joi from '@hapi/joi';

export default Joi.object({
  name: Joi.string(),
  thumbnail: Joi.string()
})