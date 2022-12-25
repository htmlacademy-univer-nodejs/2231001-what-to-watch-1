import typegoose, {defaultClasses, getModelForClass} from '@typegoose/typegoose';
import {User} from '../../types/user.type.js';
import {checkPassword, createSHA256} from '../../utils/common-functions.js';

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

  @prop({required: true, default: []})
  public moviesToWatch!: string[];

  @prop({required: true, default: ''})
  private password!: string;

  setPassword(password: string, salt: string) {
    checkPassword(password);
    this.password = createSHA256(password, salt);
  }

  verifyPassword(password: string, salt: string) {
    return createSHA256(password, salt) === this.password;
  }
}

export const UserModel = getModelForClass(UserEntity);
