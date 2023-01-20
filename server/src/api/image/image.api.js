import { ControllerHook, ImagesApiPath, HttpMethod, ImagePayloadKey } from '../../common/enums/enums.js';
import { upload } from '../../middlewares/middlewares.js';

const initImage = (fastify, opts, done) => {
  const { image: imageService } = opts.services;
  fastify.register(upload.contentParser);

  fastify.route({
    method: HttpMethod.POST,
    url: ImagesApiPath.ROOT,
    [ControllerHook.PRE_HANDLER]: upload.single(ImagePayloadKey.IMAGE),
    [ControllerHook.HANDLER]: req => imageService.upload(req.file)
  });

  done();
};

export { initImage };
