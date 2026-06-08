import { createMock, DeepMocked } from '@golevelup/ts-jest';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { Role } from 'src/core/constants';
import { Test, TestingModule } from '@nestjs/testing';
import { SignUpAuthDto } from './dto/sign-up-auth.dto';
import { generateToken } from 'src/utils/token.util';
import { ResponseAuthDto } from './dto/response-auth.dto';
import { SignInAuthDto } from './dto/sign-in-auth.dto';
import { BadRequestException } from '@nestjs/common';

jest.mock('src/utils/token.util', () => ({
  generateToken: jest.fn().mockResolvedValue('mocked-jwt-token'),
}));

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: DeepMocked<JwtService>;
  let userService: DeepMocked<UserService>;

  let mockUser: User;
  let mockResponseAuth: ResponseAuthDto;

  beforeEach(async () => {
    mockUser = {
      id: 1,
      name: 'John',
      email: 'john@test.com',
      password: 'hashed',
      role: Role.EMPLOYEE,
      cart: null,
      passwordChangedAt: new Date(),
      createdAt: new Date(),
    };

    mockResponseAuth = {
      id: 1,
      name: 'John',
      email: 'john@test.com',
      role: Role.EMPLOYEE,
      accessToken: 'mocked-jwt-token',
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: createMock<JwtService>(),
        },
        {
          provide: UserService,
          useValue: createMock<UserService>(),
        },
      ],
    })
      .useMocker(createMock)
      .compile();

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get(JwtService);
    userService = module.get(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('signUp()', () => {
    it('should create a user and return access token', async () => {
      // Arrange
      const signUpAuthDto: SignUpAuthDto = {
        name: 'Test',
        email: 'test@email.com',
        password: '123456',
      };
      userService.create.mockResolvedValue(mockUser);

      // Act
      const result = await authService.signUp(signUpAuthDto);

      // Assert
      expect(userService.create).toHaveBeenCalledWith(signUpAuthDto);
      expect(generateToken).toHaveBeenCalledWith(mockUser, jwtService);
      expect(result.accessToken).toBe('mocked-jwt-token');
    });
  });

  describe('signIn', () => {
    const signInAuthDto: SignInAuthDto = {
      email: 'john@test.com',
      password: '123456',
    };

    it('should sign in user and return auth response', async () => {
      // Arrange
      userService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await authService.signIn(signInAuthDto);

      // Assert
      expect(generateToken).toHaveBeenCalledWith(mockUser, jwtService);
      expect(userService.findByEmail).toHaveBeenCalledWith(signInAuthDto.email);
      expect(result).toEqual(mockResponseAuth);
    });

    it('should throw BadRequestException if the password is wrong', async () => {
      // Arrange
      userService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Assert
      await expect(authService.signIn(signInAuthDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
