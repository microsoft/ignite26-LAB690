import { date, entity, role, text, uuid } from '@microsoft/rayfin-core';
import type { WorkOrderComment as WorkOrderCommentRecord } from '@field-services/shared';

@entity()
@role('authenticated', ['create', 'read', 'delete'])
export class WorkOrderComment implements WorkOrderCommentRecord {
  @uuid() id!: string;
  @text({ min: 1, max: 200 }) userId!: string;
  @date() createdAt!: Date;
  @uuid() workOrderId!: string;
  @text({ min: 1, max: 2000 }) content!: string;
}
