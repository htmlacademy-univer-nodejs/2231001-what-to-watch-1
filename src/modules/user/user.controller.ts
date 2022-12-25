import {Request, Response} from 'express';
import {StatusCodes} from 'http-status-codes';
import {inject, injectable} from 'inversify';
import {ConfigInterface} from '../../common/config/config.interface.js';
import {Controller} from '../../common/controller/controller.js';
import HttpError from '../../common/errors/http-error.js';
import {LoggerInterface} from '../../common/logger/logger.interface.js';
import {PrivateRouteMiddleware} from '../../middlewares/private-route.middleware.js';
import {UploadFileMiddleware} from '../../middlewares/upload-file.middleware.js';
import {ValidateDtoMiddleware} from '../../middlewares/validate-dto.middleware.js';
import {ValidateObjectIdMiddleware} from '../../middlewares/validate-objectid.middleware.js';
import {COMPONENT} from '../../types/component.type.js';
import {HttpMethod} from '../../types/http-method.enum.js';
import {createJWT, fillDTO} from '../../utils/common-functions.js';
import MovieResponse from '../movie/response/movie.response.js';
import CreateUserDto from './dto/create-user.dto.js';
import LoginUserDto from './dto/login-user.dto.js';
import LoggedUserResponse from './response/logged-user.response.js';
import UserResponse from './response/user.response.js';
import {UserServiceInterface} from './user-service.interface.js';
import {JWT_ALGORITHM, UserRoute} from './user.models.js';

@injectable()
export default class UserController extends Controller {
  constructor(@inject(COMPONENT.LoggerInterface) logger: LoggerInterface,
    @inject(COMPONENT.UserServiceInterface) private readonly userService: UserServiceInterface,
    @inject(COMPONENT.ConfigInterface) private readonly configService: ConfigInterface) {
    super(logger);
    this.logger.info('Register routes for UserController.');

    this.addRoute<UserRoute>({
      path: UserRoute.REGISTER,
      method: HttpMethod.Post,
      handler: this.create,
      middlewares: [new ValidateDtoMiddleware(CreateUserDto)]
    });
    this.addRoute<UserRoute>({
      path: UserRoute.LOGIN,
      method: HttpMethod.Post,
      handler: this.login,
      middlewares: [new ValidateDtoMiddleware(LoginUserDto)]
    });
    this.addRoute<UserRoute>({path: UserRoute.LOGIN, method: HttpMethod.Get, handler: this.get});
    this.addRoute<UserRoute>({
      path: UserRoute.TO_WATCH,
      method: HttpMethod.Get,
      handler: this.getToWatch,
      middlewares: [new PrivateRouteMiddleware()]
    });
    this.addRoute<UserRoute>({
      path: UserRoute.TO_WATCH,
      method: HttpMethod.Post,
      handler: this.postToWatch,
      middlewares: [new PrivateRouteMiddleware()]
    });
    this.addRoute<UserRoute>({
      path: UserRoute.TO_WATCH,
      method: HttpMethod.Delete,
      handler: this.deleteToWatch,
      middlewares: [new PrivateRouteMiddleware()]
    });
    this.addRoute<UserRoute>({
      path: UserRoute.AVATAR,
      method: HttpMethod.Post,
      handler: this.uploadAvatar,
      middlewares: [
        new ValidateObjectIdMiddleware('userId'),
        new UploadFileMiddleware(this.configService.get('UPLOAD_DIRECTORY'), 'avatar'),
      ]
    });
  }

  async create({body}: Request<Record<string, unknown>, Record<string, unknown>, CreateUserDto>, res: Response): Promise<void> {
    const existsUser = await this.userService.findByEmail(body.email);

    if (existsUser) {
      throw new HttpError(StatusCodes.CONFLICT, `User with email «${body.email}» exists.`, 'UserController');
    }

    const result = await this.userService.create(body, this.configService.get('SALT'));
    this.created(res, fillDTO(UserResponse, result));
  }

  async login({body}: Request<Record<string, unknown>, Record<string, unknown>, LoginUserDto>, res: Response): Promise<void> {
    const user = await this.userService.verifyUser(body, this.configService.get('SALT'));

    if (!user) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'Unauthorized',
        'UserController'
      );
    }

    const token = await createJWT(
      JWT_ALGORITHM,
      this.configService.get('JWT_SECRET'),
      { email: user.email, id: user.id}
    );

    this.ok(res, fillDTO(LoggedUserResponse, {email: user.email, token}));
  }

  async get(req: Request, res: Response): Promise<void> {
    const user = await this.userService.findByEmail(req.user.email);
    this.ok(res, fillDTO(LoggedUserResponse, user));
  }

  async getToWatch(req: Request<Record<string, unknown>, Record<string, unknown>>, _res: Response): Promise<void> {
    const {user} = req;
    const result = await this.userService.findToWatch(user.id);
    this.ok(_res, fillDTO(MovieResponse, result));
  }

  async postToWatch(req: Request<Record<string, unknown>, Record<string, unknown>, { movieId: string }>, _res: Response): Promise<void> {
    const {body, user} = req;
    await this.userService.addToWatch(body.movieId, user.id);
    this.noContent(_res, {message: 'Успешно. Фильм добавлен в список "К просмотру".'});
  }

  async deleteToWatch(req: Request<Record<string, unknown>, Record<string, unknown>, { movieId: string }>, _res: Response): Promise<void> {
    const {body, user} = req;
    await this.userService.deleteToWatch(body.movieId, user.id);
    this.noContent(_res, {message: 'Успешно. Фильм удален из списка "К просмотру".'});
  }

  async uploadAvatar(req: Request, res: Response) {
    this.created(res, {
      filepath: req.file?.path
    });
  }
}
