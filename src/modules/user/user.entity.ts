import {User} from '../../types/user.type.js';
import typegoose, {defaultClasses, getModelForClass, Ref} from '@typegoose/typegoose';
import {checkPassword, createSHA256} from '../../utils/common-functions.js';
import {MovieEntity} from '../movie/movie.entity.js';

const {prop, modelOptions} = typegoose;

export interface UserEntity extends defaultClasses.Base {}

@modelOptions({
  schemaOptions: {
    collection: 'users'
  }
})
export class UserEntity extends defaultClasses.TimeStamps implements User {
  constructor(data: User) {
    super();

    this.email = data.email;
    this.avatarPath = data.avatarPath;
    this.name = data.name;
  }

  @prop({unique: true, required: true})
  public email!: string;

  @prop()
  public avatarPath?: string;

  @prop({required: true, default: ''})
  public name!: string;

  @prop({ref: MovieEntity, required: true, default: []})
  public moviesToWatch!: Ref<MovieEntity>[];

  @prop({required: true, default: ''})
  private password!: string;

  setPassword(password: string, salt: string) {
    checkPassword(password);
    this.password = createSHA256(password, salt);
  }

  getPassword() {
    return this.password;
  }
}

export const UserModel = getModelForClass(UserEntity);
