import { ServicePro } from './ServicePro.js';
import { WorkOrder } from './WorkOrder.js';
import { WorkOrderComment } from './WorkOrderComment.js';

export type { FieldServiceSchema } from '@field-services/shared';

export const schema = [ServicePro, WorkOrder, WorkOrderComment];
