import type { ServicePro, WorkOrder, WorkOrderStatus } from '@field-services/shared';
import type { BulkCheckpoint, BulkOptions } from '../BulkOperation';

export interface FieldServiceSeedProfile {
  seedId: string;
  name: string;
  skills: string[];
  userId: string;
}

export interface FieldServiceSeedWorkOrder {
  id: string;
  customer: string;
  address: string;
  task: string;
  scheduledAt: string;
  status: WorkOrderStatus;
  serviceProSeedId: string | null;
  note: string;
}

export interface FieldServiceSeedDataset {
  generatedAt: string;
  startDate: string;
  endDate: string;
  servicePros: FieldServiceSeedProfile[];
  workOrders: FieldServiceSeedWorkOrder[];
}

export interface AdminDataSummary {
  servicePros: number;
  workOrders: number;
}

export interface NewWorkOrderInput {
  customer: string;
  address: string;
  task: string;
  scheduledAt: Date;
  servicePro_id?: string | null;
  note?: string;
}

export type BulkResult =
  | { done: false; checkpoint: BulkCheckpoint }
  | { done: true; checkpoint: BulkCheckpoint; summary: AdminDataSummary };

export interface IFieldService {
  bootstrapDemoData(): Promise<void>;
  getDataSummary(): Promise<AdminDataSummary>;
  restoreSeedData(
    seedData: FieldServiceSeedDataset,
    options: BulkOptions
  ): Promise<BulkResult>;
  resetDemoData(confirmation: string, options: BulkOptions): Promise<BulkResult>;
  getServicePros(): Promise<ServicePro[]>;
  getMyProfile(userId: string): Promise<ServicePro | null>;
  createProfile(userId: string, name: string, skills: string): Promise<ServicePro>;
  updateProfile(id: string, name: string, skills: string): Promise<ServicePro>;
  getWorkOrders(): Promise<WorkOrder[]>;
  getWorkOrdersForServicePro(serviceProId: string): Promise<WorkOrder[]>;
  createWorkOrder(input: NewWorkOrderInput): Promise<WorkOrder>;
  assignWorkOrder(id: string, serviceProId: string | null): Promise<WorkOrder>;
  acceptWorkOrder(id: string, serviceProId: string): Promise<WorkOrder>;
  updateWorkOrderStatus(id: string, status: WorkOrderStatus): Promise<WorkOrder>;
}
