import {IsInt, IsMongoId, IsString, Length, Max, Min} from 'class-validator';

export default class CreateCommentDto {
  @IsString({message: 'text is required'})
  @Length(5, 1024, {message: 'text lenght must be from 2 to 100 symbols'})
  public text!: string;

  @IsInt({message: 'rating must be an integer'})
  @Min(0, {message: 'Minimum rating is 0'})
  @Max(10, {message: 'Maximum rating is 10'})
  public rating!: number;

  @IsMongoId({message: 'movieId field must be valid an id'})
  public movieId!: string;

  public userId!: string;
}
