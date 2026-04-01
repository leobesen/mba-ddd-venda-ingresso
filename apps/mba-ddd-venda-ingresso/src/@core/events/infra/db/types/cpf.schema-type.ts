/* eslint-disable @typescript-eslint/no-unused-vars */
import { Type, Platform, EntityProperty } from '@mikro-orm/core';
import { Cpf } from 'apps/mba-ddd-venda-ingresso/src/@core/common/domain/value-objects/cpf.vo';

export class CpfSchemaType extends Type<Cpf, string> {
  convertToDatabaseValue(
    valueObject: Cpf | undefined | null,
    platform: Platform,
  ): string {
    return valueObject instanceof Cpf
      ? valueObject.value
      : (valueObject as unknown as string);
  }

  //não funciona para relacionamentos
  convertToJSValue(value: string, platform: Platform): Cpf {
    return new Cpf(value);
  }

  getColumnType(prop: EntityProperty, platform: Platform) {
    return 'VARCHAR(11)';
  }
}
