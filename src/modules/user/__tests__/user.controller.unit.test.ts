import { describe, it, vi } from 'vitest';

import UserController from '#modules/user/user.controller.js';
import type { UserRepository } from '#modules/user/user.repo.js';

const findUserByEmailMock = vi.fn();
const findUserByUsernameMock = vi.fn();
const findPageByUserIdMock = vi.fn();
const getAllPagesMock = vi.fn();
const registerMock = vi.fn();
const registerPageMock = vi.fn();

const UserRepositoryMock = {
    findUserByEmail: findUserByEmailMock,
    findUserByUsername: findUserByUsernameMock,
    findPageByUserId: findPageByUserIdMock,
    getAllPages: getAllPagesMock,
    registerPage: registerPageMock,
    register: registerMock,
} as unknown as UserRepository;

describe('UserController (unit)', () => {
    const userController = new UserController(UserRepositoryMock);
    void userController;

    it('', () => {});
});
