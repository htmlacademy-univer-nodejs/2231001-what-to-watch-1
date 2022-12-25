import {ClassConstructor, plainToInstance} from 'class-transformer';
import crypto from 'crypto';
import * as jose from 'jose';
import {getGenre} from '../types/genre.type.js';

export const createMovie = (row: string) => {
  const tokens = row.replace('\n', '').split('\t');
  const [
    title,
    description,
    publishingDate,
    genre,
    releaseYear,
    rating,
    previewPath,
    moviePath,
    actors,
    director,
    durationInMinutes,
    userName,
    email,
    avatarPath,
    posterPath,
    backgroundImagePath,
    backgroundColor
  ] = tokens;
  return {
    title,
    description,
    publishingDate: new Date(publishingDate),
    genre: getGenre(genre),
    releaseYear: Number(releaseYear),
    rating: Number(rating),
    previewPath,
    moviePath,
    actors: actors.split(';'),
    director,
    durationInMinutes: Number(durationInMinutes),
    commentsCount: 0,
    user: {email, name: userName, avatarPath},
    posterPath,
    backgroundImagePath,
    backgroundColor
  };
};

export const checkPassword = (password: string) => {
  if (password.length < 6 || password.length > 12) {
    throw new Error('Password should be from 6 to 12 characters');
  }
};

export const createSHA256 = (line: string, salt: string): string => crypto.createHmac('sha256', salt).update(line).digest('hex');

export const fillDTO = <T, V>(someDto: ClassConstructor<T>, plainObject: V) =>
  plainToInstance(someDto, plainObject, {excludeExtraneousValues: true});

export const createErrorObject = (message: string) => ({
  error: message,
});

export const createJWT = async (algorithm: string, jwtSecret: string, payload: object): Promise<string> =>
  new jose.SignJWT({...payload})
    .setProtectedHeader({alg: algorithm})
    .setIssuedAt()
    .setExpirationTime('2d')
    .sign(new TextEncoder().encode(jwtSecret));
