import {Request, Response} from 'express';
import {StatusCodes} from 'http-status-codes';
import {inject} from 'inversify';
import {Controller} from '../../common/controller/controller.js';
import HttpError from '../../common/errors/http-error.js';
import {LoggerInterface} from '../../common/logger/logger.interface.js';
import {PrivateRouteMiddleware} from '../../middlewares/private-route.middleware.js';
import {ValidateDtoMiddleware} from '../../middlewares/validate-dto.middleware.js';
import {COMPONENT} from '../../types/component.type.js';
import {HttpMethod} from '../../types/http-method.enum.js';
import {fillDTO} from '../../utils/common-functions.js';
import {MovieServiceInterface} from '../movie/movie-service.interface.js';
import {CommentServiceInterface} from './comment-service.interface.js';
import {CommentRoute} from './comment.models.js';
import CreateCommentDto from './dto/create-comment.dto.js';
import CommentResponse from './response/comment.response.js';

export default class CommentController extends Controller {
  constructor(@inject(COMPONENT.LoggerInterface) logger: LoggerInterface,
              @inject(COMPONENT.CommentServiceInterface) private readonly commentService: CommentServiceInterface,
              @inject(COMPONENT.MovieServiceInterface) private  readonly movieService: MovieServiceInterface) {
    super(logger);

    this.logger.info('Register routes for CommentController.');
    this.addRoute<CommentRoute>({
      path: CommentRoute.ROOT,
      method: HttpMethod.Post,
      handler: this.create,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateDtoMiddleware(CreateCommentDto)
      ]
    });
  }

  public async create(req: Request<object, object, CreateCommentDto>, res: Response): Promise<void> {
    const {body, user} = req;

    if (!await this.movieService.exists(body.movieId)) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `Movie with id ${body.movieId} not found.`,
        'CommentController'
      );
    }

    const comment = await this.commentService.create({...body, userId: user.id});
    this.created(res, fillDTO(CommentResponse, comment));
  }
}
