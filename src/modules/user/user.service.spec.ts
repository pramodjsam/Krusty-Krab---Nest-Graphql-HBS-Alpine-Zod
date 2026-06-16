import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { UserService } from './user.service';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { ClientProxy } from '@nestjs/microservices';
import { EMAIL_SERVICE_MQ, Role } from 'src/core/constants';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { SendResetTokenDto } from './dto/send-reset-token.dto';
import { VerifyTokenDto } from './dto/verify-token.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';

jest.mock('@react-email/render', () => ({
  render: jest.fn().mockResolvedValue('<html>mock email</html>'),
}));

jest.mock('nestjs-paginate', () => ({
  ...jest.requireActual('nestjs-paginate'),
  paginate: jest.fn(),
}));

describe('User Service', () => {
  let userService: UserService;
  let userRepository: DeepMocked<Repository<User>>;
  let emailClient: DeepMocked<ClientProxy>;

  let mockUser: User;
  let mockUserWithResetToken: User;
  let mockPaginatedUserResponse: Paginated<User>;

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
    mockUserWithResetToken = {
      id: 1,
      name: 'John',
      email: 'john@test.com',
      password: 'hashed',
      role: Role.EMPLOYEE,
      cart: null,
      passwordChangedAt: new Date(),
      resetToken: 1234,
      resetTokenExpiry: new Date(Date.now() + 5 * 60 * 1000),
      createdAt: new Date(),
    };
    mockPaginatedUserResponse = {
      data: [mockUser],
      meta: {
        itemsPerPage: 5,
        totalItems: 1,
        currentPage: 1,
        totalPages: 1,
        sortBy: [['id', 'DESC']], // matches your paginate config
        searchBy: ['name'], // whichever columns are searchable
        search: '', // empty string if no search applied
        select: ['id', 'name'], // columns selected, optional but required in TS
      },
      links: {
        first: undefined,
        previous: undefined,
        next: undefined,
        last: undefined,
        current: '',
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: createMock<Repository<User>>(),
        },
        {
          provide: EMAIL_SERVICE_MQ,
          useValue: createMock<ClientProxy>(),
        },
      ],
    })
      .useMocker(createMock)
      .compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get(getRepositoryToken(User));
    emailClient = module.get(EMAIL_SERVICE_MQ);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('create()', () => {
    it('should create new user', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        name: 'John',
        email: 'john@test.com',
        password: '123456',
      };
      userRepository.findOne.mockResolvedValue(null);
      userRepository.save.mockResolvedValue(mockUser);

      // Act
      const result = await userService.create(createUserDto);

      //   Assert
      expect(result).toEqual(mockUser);
    });

    it('should throw error if user already exists', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        name: 'John',
        email: 'john@test.com',
        password: '123456',
      };
      userRepository.findOne.mockResolvedValue(mockUser);

      // Assert
      await expect(userService.create(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll()', () => {
    it('should return all users', async () => {
      // Arrange
      const mockPaginatedQuery: PaginateQuery = {
        page: 1,
        path: '',
      };

      (paginate as jest.Mock).mockResolvedValue(mockPaginatedUserResponse);

      // Act
      const result = await userService.findAll(mockPaginatedQuery);

      // Assert
      expect(result).toEqual(mockPaginatedUserResponse);
    });
  });

  describe('findOne()', () => {
    it('should return a user by id', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(mockUser);

      // Act
      const result = await userService.findOne(1);

      // Assert
      expect(result).toEqual(mockUser);
    });

    it('should throw error if user not found', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(null);

      // Assert
      await expect(userService.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('should by user by email', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(mockUser);

      // Act
      const result = await userService.findByEmail(mockUser.email);

      // Assert
      expect(result).toEqual(mockUser);
    });

    it('should throw error if user is not found', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(null);

      // Assert
      await expect(
        userService.findByEmail('randomemail@email.com'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update()', () => {
    it('should update user details', async () => {
      // Arrange
      const updateUserDto: UpdateUserDto = {
        name: 'updated name',
      };
      jest.spyOn(userService, 'findOne').mockResolvedValue(mockUser);
      userRepository.save.mockResolvedValue({
        ...mockUser,
        name: 'updated name',
      });

      // Act
      const result = await userService.update(1, updateUserDto);

      // Assert
      expect(result).toEqual({
        ...mockUser,
        name: updateUserDto.name,
      });
    });
  });

  describe('remove()', () => {
    it('should remove user by id', async () => {
      // Arrange
      jest.spyOn(userService, 'findOne').mockResolvedValue(mockUser);

      // Act
      const result = await userService.remove(1);

      // Assert
      expect(result).toEqual({
        success: true,
        message: 'User removed successfully',
      });
    });
  });

  describe('sendResetToken()', () => {
    it('should send reset token', async () => {
      // Arrange
      const sendResetTokenDto: SendResetTokenDto = {
        email: mockUser.email,
      };
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(mockUser);

      // Act
      const result = await userService.sendResetToken(sendResetTokenDto);

      // Assert
      expect(emailClient.emit).toHaveBeenCalled();
      expect(userRepository.save).toHaveBeenCalled();
      expect(result).toEqual({
        success: true,
        message: 'Email sent successfully',
      });
    });
  });

  describe('verifyToken()', () => {
    it('should return success message if correct token is sent', async () => {
      // Arrange
      const verifyTokenDto: VerifyTokenDto = {
        email: mockUserWithResetToken.email,
        resetToken: Number(mockUserWithResetToken.resetToken),
      };
      jest
        .spyOn(userService, 'findByEmail')
        .mockResolvedValue(mockUserWithResetToken);

      // Act
      const result = await userService.verifyToken(verifyTokenDto);

      // Assert
      expect(userService.findByEmail).toHaveBeenCalled();
      expect(userService.findByEmail).toHaveBeenCalledWith(
        verifyTokenDto.email,
      );
      expect(result).toEqual({
        success: true,
        message: 'Token verified successfully',
      });
    });

    it('should throw error if reset token is invalid', async () => {
      // Arrange
      const verifyTokenDto: VerifyTokenDto = {
        email: mockUserWithResetToken.email,
        resetToken: Number(mockUserWithResetToken.resetToken),
      };
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(mockUser);

      // Assert
      await expect(userService.verifyToken(verifyTokenDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('resetPassword()', () => {
    it('should reset password successfully', async () => {
      // Arrange
      const resetPasswordDto: ResetPasswordDto = {
        email: mockUserWithResetToken.email,
        password: '789456',
        confirmPassword: '789456',
        resetToken: Number(mockUserWithResetToken.resetToken),
      };
      jest
        .spyOn(userService, 'findByEmail')
        .mockResolvedValue(mockUserWithResetToken);

      // Act
      const result = await userService.resetPassword(resetPasswordDto);

      // Assert
      expect(emailClient.emit).toHaveBeenCalled();
      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          resetToken: null,
          resetTokenExpiry: null,
          email: mockUserWithResetToken.email,
        }),
      );
      expect(result).toEqual({
        success: true,
        message: 'Email sent successfully',
      });
    });

    it('should throw error if token is invalid', async () => {
      // Arrange
      const resetPasswordDto: ResetPasswordDto = {
        email: mockUserWithResetToken.email,
        password: '789456',
        confirmPassword: '789456',
        resetToken: 7894,
      };
      jest
        .spyOn(userService, 'findByEmail')
        .mockResolvedValue(mockUserWithResetToken);

      // Assert
      await expect(userService.resetPassword(resetPasswordDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
