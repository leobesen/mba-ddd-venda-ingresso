import { EntitySchema } from '@mikro-orm/core';
import Partner from '../../domain/entities/partner.entity';
import { PartnerIdSchemaType } from './types/partner-id.schema-type';

export const PartnerSchema = new EntitySchema<Partner>({
  class: Partner,
  properties: {
    id: {
      type: PartnerIdSchemaType,
      primary: true,
    },
    name: { type: 'string', length: 255 },
  },
});
