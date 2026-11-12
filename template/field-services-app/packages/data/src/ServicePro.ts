import { date, entity, role, text, uuid } from '@microsoft/rayfin-core';
import type { ServicePro as ServiceProRecord } from '@field-services/shared';

@entity()
@role('authenticated', '*')
export class ServicePro implements ServiceProRecord {
  @uuid() id!: string;
  @text({ min: 1, max: 100 }) name!: string;
  @text({ min: 1, max: 300 }) skills!: string;
  @text() user_id!: string;
  @date() createdAt!: Date;
  @date() updatedAt!: Date;
}
