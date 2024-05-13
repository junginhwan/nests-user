import * as uuid from 'uuid';
import { Injectable, InternalServerErrorException, UnprocessableEntityException } from '@nestjs/common';
import { EmailService } from 'src/email/email.service';
import { UserInfo } from './interfaces/user-info.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entity/user.entity';
import { DataSource, Repository } from 'typeorm';
import { ulid } from 'ulid';

@Injectable()
export class UsersService {

    constructor(
        private emailService: EmailService,
        @InjectRepository(UserEntity) private usersRepository: Repository<UserEntity>,
        private dataSource: DataSource
    ) {}

    async createUser(name: string, email: string, password: string) {

        const userExist = await this.checkUserExists(email);
        if (userExist) {
            throw new UnprocessableEntityException('해당 이메일로는 가입할 수 없습니다.');
        }

        await this.checkUserExists(email);
        const signupVerifyToken = uuid.v1();
        await this.saveUserUsingTransaction(name, email, password, signupVerifyToken);
        await this.sendMemberJoinEmail(email, signupVerifyToken);
    }

    private async checkUserExists(emailAddress: string): Promise<boolean> {
        const user = await this.usersRepository.findOne({
            where: { email: emailAddress }
        });
        return user !== null;
    }

    private async saveUser(name: string, email: string, password: string, signupVerifyToken: string) {
        const user = new UserEntity();
        user.id = ulid();
        user.name = name;
        user.email = email;
        user.password = password;
        user.signupVerifyToken = signupVerifyToken;
        await this.usersRepository.save(user);
    }

    private async sendMemberJoinEmail(email: string, signupVerifyToken: string) {
        await this.emailService.sendMemberJoinVerification(email, signupVerifyToken);
    }

    async verifyEmail(signupVerifyToken: string): Promise<string> {
        throw new Error('Method not implemented.');
    }

    async login(email: string, password: string): Promise<string> {
        throw new Error('Method not implemented.');
    }

    async getUserInfo(userId: string): Promise<UserInfo> {
        throw new Error('Method not implemented.');
    }

    private async saveUserUsingTransaction(name: string, email: string, password: string, signupVerifyToken: string) {
        await this.dataSource.transaction(async manager => {
            const user = new UserEntity();
            user.id = ulid();
            user.name = name;
            user.email = email;
            user.password = password;
            user.signupVerifyToken = signupVerifyToken;
            await manager.save(user);

            // throw new InternalServerErrorException();
        });
    }
}
