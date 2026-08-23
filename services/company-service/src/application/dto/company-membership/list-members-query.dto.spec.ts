import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { ListMembersQueryDto } from './list-members-query.dto';

describe('ListMembersQueryDto', () => {
  it('usa page=1 y limit=20 por default cuando no se envían', async () => {
    const dto = plainToInstance(ListMembersQueryDto, {});

    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(20);
    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('acepta page/limit válidos enviados como query string', async () => {
    const dto = plainToInstance(ListMembersQueryDto, { page: '3', limit: '50' });

    expect(dto.page).toBe(3);
    expect(dto.limit).toBe(50);
    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('rechaza limit por encima del máximo permitido', async () => {
    const dto = plainToInstance(ListMembersQueryDto, { limit: '500' });

    const errors = await validate(dto);

    expect(errors).not.toHaveLength(0);
  });

  it('rechaza page menor a 1', async () => {
    const dto = plainToInstance(ListMembersQueryDto, { page: '0' });

    const errors = await validate(dto);

    expect(errors).not.toHaveLength(0);
  });
});
