import { Body, Controller, Post, Req } from '@nestjs/common';
import { RegisterUserDto } from '@application/dto/register/register-user.dto';
import { I18nService } from '@saas/shared';
import { RegisterUserUseCase } from '@application/use-cases/register-user.use-case';

/**
 * Controller de autenticación
 */
@Controller({version: '1'}) 
export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly i18n: I18nService,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterUserDto, @Req() req: any) {
    const lang = req.headers['accept-language']?.startsWith('es')
      ? 'es'
      : 'en';

    const user = await this.registerUserUseCase.execute(
      dto.email,
      dto.password,
      {
        ip: req.ip,
        country: req.headers['x-country'] as string,
        deviceFingerprint: req.headers['x-device-fingerprint'] as string,
      },
    );

    return {
      message: this.i18n.translate('REGISTER_SUCCESS', lang),
      data: {
        id: user.id,
        email: user.email.getValue(),
      },
    };
  }

  @Post('login')
  async login() {
    
  }
}
