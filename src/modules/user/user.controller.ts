import type { User } from '@prisma/client';
import type { FastifyBaseLogger } from 'fastify';

import { ConflictError } from '#shared/errors/apiErrors/ConflictError.js';

import type { UserRepository } from './user.repo.js';
import type { IRegisterBody } from './user.schema.js';

export interface IRegisterArgs {
    body: IRegisterBody;
    logger: FastifyBaseLogger;
}

interface IRegisterNewPageArgs extends IRegisterArgs {
    user: User;
}

export default class UserController {
    private userRepository: UserRepository;

    constructor(userRepository: UserRepository) {
        this.userRepository = userRepository;
    }

    // controllers hidden...
}
