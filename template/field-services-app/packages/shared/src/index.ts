export interface ServicePro {
  id: string;
  name: string;
  skills: string;
  user_id: string;
  createdAt: Date;
  updatedAt: Date;
}

export type WorkOrderStatus =
  | 'pending'
  | 'assigned'
  | 'in_progress'
  | 'completed'
  | 'needs_followup'
  | 'cancelled';

export interface WorkOrder {
  id: string;
  customer: string;
  address: string;
  task: string;
  scheduledAt: Date;
  status: WorkOrderStatus;
  servicePro_id?: string | null;
  servicePro?: Pick<ServicePro, 'name' | 'skills'> | null;
  note?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type FieldServiceSchema = {
  ServicePro: ServicePro;
  WorkOrder: Omit<WorkOrder, 'servicePro'> & { servicePro?: ServicePro | null };
};
