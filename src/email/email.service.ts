import Mail = require('nodemailer/lib/mailer');
import * as nodemailer from 'nodemailer';
import { Inject, Injectable } from '@nestjs/common';
import { EmailOptions } from 'src/users/interfaces/email-options.interface';
import emailConfig from 'src/config/emailConfig';
import { ConfigType } from '@nestjs/config';



@Injectable()
export class EmailService {
    private transporter: Mail;

    constructor(
        @Inject(emailConfig.KEY) private config: ConfigType<typeof emailConfig>
    ) {
        this.transporter = nodemailer.createTransport({
            service: config.service,
            auth: {
                user: config.auth.user,
                pass: config.auth.pass,
            }
        });
    }

    async sendMemberJoinVerification(emailAddress: string, signupVerifyToken: string) {
        const baseUrl = this.config.baseUrl;

        const url = `${baseUrl}/users/email-verify?signupVerifyToken=${signupVerifyToken}`;

        const mailOptions: EmailOptions = {
            to: emailAddress,
            subject: "가입 인증 메일",
            html: `
                가입확인 버튼을 누르시면 가입 인증이 완료됩니다. <br/>
                <form action="${url}" method="POST">
                    <button>가입확인</button>
                </form>
            `
        }
        console.log(mailOptions);
        return await this.transporter.sendMail(mailOptions);
    }
}
