import { ROLES_KEY, Roles } from './roles.decorator';

describe('Roles decorator', () => {
  it('debe definir la constante ROLES_KEY como "roles"', () => {
    expect(ROLES_KEY).toBe('roles');
  });

  it('debe establecer la metadata con los roles proporcionados', () => {
    class TestClass {
      @Roles('SUPER_ADMIN', 'ADMIN')
      testMethod() {}
    }

    const metadata: string[] = Reflect.getMetadata(
      ROLES_KEY,
      TestClass.prototype.testMethod,
    );

    expect(metadata).toEqual(['SUPER_ADMIN', 'ADMIN']);
  });

  it('debe funcionar con un solo rol', () => {
    class TestClass {
      @Roles('SUPER_ADMIN')
      testMethod() {}
    }

    const metadata: string[] = Reflect.getMetadata(
      ROLES_KEY,
      TestClass.prototype.testMethod,
    );

    expect(metadata).toEqual(['SUPER_ADMIN']);
  });

  it('debe funcionar sin roles (array vacío)', () => {
    class TestClass {
      @Roles()
      testMethod() {}
    }

    const metadata: string[] = Reflect.getMetadata(
      ROLES_KEY,
      TestClass.prototype.testMethod,
    );

    expect(metadata).toEqual([]);
  });
});
