import { PUBLIC_ROUTE_KEY, PublicRoute } from './public-route.decorator';

describe('PublicRoute decorator', () => {
  it('debe exportar PUBLIC_ROUTE_KEY como string', () => {
    expect(typeof PUBLIC_ROUTE_KEY).toBe('string');
    expect(PUBLIC_ROUTE_KEY).toBe('publicRoute');
  });

  it('debe retornar un decorador de función', () => {
    const decorator = PublicRoute();

    expect(typeof decorator).toBe('function');
  });

  it('debe aplicarse sobre un método sin lanzar errores', () => {
    class TestClass {
      @PublicRoute()
      testMethod() {}
    }

    expect(new TestClass()).toBeDefined();
  });
});
