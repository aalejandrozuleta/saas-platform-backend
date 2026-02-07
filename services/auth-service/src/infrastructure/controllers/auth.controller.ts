import { Body, Controller, Post, Req } from '@nestjs/common';
import { RegisterUserDto } from '@application/dto/register/register-user.dto';
import { I18nService } from '@saas/shared/i18n';
import { RegisterUserUseCase } from '@application/use-cases/register-user.use-case';

/**
 * Controller de autenticación
 */
@Controller({version: '1'}) // 🔴 AQUÍ va el path base
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
    );

    return {
      message: this.i18n.translate('REGISTER_SUCCESS', lang),
      data: {
        id: user.id,
        email: user.email.getValue(),
      },
    };
  }
}
