import 'reflect-metadata';
import Application from './app/application.js';
import LoggerService from './common/logger/logger.service.js';
import ConfigService from './common/config/config.service.js';
import {Container} from 'inversify';
import {COMPONENT} from './types/component.type.js';
import {LoggerInterface} from './common/logger/logger.interface.js';
import {ConfigInterface} from './common/config/config.interface.js';
import MongoDBService from './common/db-client/mongodb.service.js';
import {DatabaseInterface} from './common/db-client/db.interface.js';
import {UserServiceInterface} from './modules/user/user-service.interface.js';
import UserService from './modules/user/user.service.js';
import {UserEntity, UserModel} from './modules/user/user.entity.js';
import {types} from '@typegoose/typegoose';
import {MovieEntity, MovieModel} from './modules/movie/movie.entity.js';
import {MovieServiceInterface} from './modules/movie/movie-service.interface.js';
import MovieService from './modules/movie/movie.service.js';
import CommentService from './modules/comment/comment.service.js';
import {CommentServiceInterface} from './modules/comment/comment-service.interface.js';
import {CommentEntity, CommentModel} from './modules/comment/comment.entity.js';
import {ControllerInterface} from './common/controller/controller.interface.js';
import {ExceptionFilterInterface} from './common/errors/exception-filter.interface.js';
import UserController from './modules/user/user.controller.js';
import ExceptionFilter from './common/errors/exception-filter.js';
import MovieController from './modules/movie/movie.controller.js';

const applicationContainer = new Container();
applicationContainer.bind<Application>(COMPONENT.Application).to(Application).inSingletonScope();
applicationContainer.bind<LoggerInterface>(COMPONENT.LoggerInterface).to(LoggerService).inSingletonScope();
applicationContainer.bind<ConfigInterface>(COMPONENT.ConfigInterface).to(ConfigService).inSingletonScope();
applicationContainer.bind<DatabaseInterface>(COMPONENT.DatabaseInterface).to(MongoDBService).inSingletonScope();
applicationContainer.bind<UserServiceInterface>(COMPONENT.UserServiceInterface).to(UserService);
applicationContainer.bind<types.ModelType<UserEntity>>(COMPONENT.UserModel).toConstantValue(UserModel);
applicationContainer.bind<MovieServiceInterface>(COMPONENT.MovieServiceInterface).to(MovieService);
applicationContainer.bind<types.ModelType<MovieEntity>>(COMPONENT.MovieModel).toConstantValue(MovieModel);
applicationContainer.bind<CommentServiceInterface>(COMPONENT.CommentServiceInterface).to(CommentService);
applicationContainer.bind<types.ModelType<CommentEntity>>(COMPONENT.CommentModel).toConstantValue(CommentModel);

applicationContainer.bind<ControllerInterface>(COMPONENT.MovieController).to(MovieController).inSingletonScope();
applicationContainer.bind<ExceptionFilterInterface>(COMPONENT.ExceptionFilterInterface).to(ExceptionFilter).inSingletonScope();
applicationContainer.bind<ControllerInterface>(COMPONENT.UserController).to(UserController).inSingletonScope();

const application = applicationContainer.get<Application>(COMPONENT.Application);
await application.init();
