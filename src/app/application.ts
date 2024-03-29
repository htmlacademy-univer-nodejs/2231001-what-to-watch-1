import cors from 'cors';
import express, {Express} from 'express';
import {inject, injectable} from 'inversify';
import {ConfigInterface} from '../common/config/config.interface.js';
import {ControllerInterface} from '../common/controller/controller.interface';
import {DatabaseInterface} from '../common/db-client/db.interface.js';
import {ExceptionFilterInterface} from '../common/errors/exception-filter.interface';
import {LoggerInterface} from '../common/logger/logger.interface.js';
import {AuthenticateMiddleware} from '../middlewares/authenticate.middleware.js';
import {COMPONENT} from '../types/component.type.js';
import {getFullServerPath} from '../utils/common-functions.js';
import {getDBConnectionURI} from '../utils/db.js';

@injectable()
export default class Application {
  private expressApp: Express;

  constructor(@inject(COMPONENT.LoggerInterface) private logger: LoggerInterface,
              @inject(COMPONENT.ConfigInterface) private config: ConfigInterface,
              @inject(COMPONENT.DatabaseInterface) private dbClient: DatabaseInterface,
              @inject(COMPONENT.MovieController) private movieController: ControllerInterface,
              @inject(COMPONENT.ExceptionFilterInterface) private exceptionFilter: ExceptionFilterInterface,
              @inject(COMPONENT.UserController) private userController: ControllerInterface,
              @inject(COMPONENT.CommentController) private commentController: ControllerInterface,) {
    this.expressApp = express();
  }

  initRoutes() {
    this.expressApp.use('/movies', this.movieController.router);
    this.expressApp.use('/users', this.userController.router);
    this.expressApp.use('/comments', this.commentController.router);
  }

  initMiddleware() {
    this.expressApp.use(express.json());
    this.expressApp.use('/upload', express.static(`.${this.config.get('UPLOAD_DIRECTORY')}`));
    this.expressApp.use('/static', express.static(`.${this.config.get('STATIC_DIRECTORY_PATH')}`));

    const authenticateMiddleware = new AuthenticateMiddleware(this.config.get('JWT_SECRET'));
    this.expressApp.use(authenticateMiddleware.execute.bind(authenticateMiddleware));
    this.expressApp.use(cors());
  }

  initExceptionFilters() {
    this.expressApp.use(this.exceptionFilter.catch.bind(this.exceptionFilter));
  }

  async init() {
    const port = this.config.get('PORT');
    this.logger.info(`Application initialized. Get value from $PORT: ${port}.`);

    const uri = getDBConnectionURI(
      this.config.get('DB_USER'),
      this.config.get('DB_PASSWORD'),
      this.config.get('DB_HOST'),
      this.config.get('DB_PORT'),
      this.config.get('DB_NAME')
    );

    await this.dbClient.connect(uri);

    this.initMiddleware();
    this.initRoutes();
    this.initExceptionFilters();
    const host = this.config.get('HOST');
    this.expressApp.listen(port, () => this.logger.info(`Server started on ${getFullServerPath(host, port)}`));
  }
}
