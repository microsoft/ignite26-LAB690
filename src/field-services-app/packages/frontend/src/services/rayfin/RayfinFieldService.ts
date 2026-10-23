import type { ServicePro, WorkOrder, WorkOrderStatus, WorkOrderComment } from '@field-services/shared';
import { v5 as uuidv5 } from 'uuid';
import {
  AdminDataSummary,
  FieldServiceSeedDataset,
  IFieldService,
  NewWorkOrderCommentInput,
  NewWorkOrderInput,
  SeedProgressCallback,
} from '../interfaces/IFieldService';

import { getRayfinClient } from './RayfinClientService';

const SERVICE_PRO_FIELDS = [
  'id',
  'name',
  'skills',
  'user_id',
  'createdAt',
  'updatedAt',
] as const;

const WORK_ORDER_FIELDS = [
  'id',
  'customer',
  'address',
  'task',
  'scheduledAt',
  'status',
  'servicePro_id',
  'servicePro.name',
  'servicePro.skills',
  'note',
  'createdAt',
  'updatedAt',
] as const;

const WORK_ORDER_COMMENT_FIELDS = [
  'id',
  'userId',
  'createdAt',
  'workOrderId',
  'content',
] as const;

type WorkOrderQueryFilter = {
  servicePro_id?: {
    eq?: string;
    isNull?: boolean;
  };
  or?: WorkOrderQueryFilter[];
};

type WorkOrderCommentQueryFilter = {
  workOrderId?: {
    eq?: string;
  };
  or?: WorkOrderCommentQueryFilter[];
};

const INITIAL_DEMO_ORDER = {
  id: uuidv5('lab690:initial-work-order', uuidv5.URL),
  customer: 'Jane Doe',
  address: '12 Rue de Rivoli, Paris',
  task: 'Hang large painting in living room',
  scheduledAt: new Date('2026-05-03T10:00:00Z'),
  note: 'Initial example work order. Leave unassigned so any Service Pro can accept it.',
};

const WRITE_BATCH_SIZE = 5;
const READ_PAGE_SIZE = 100;
const BASELINE_DATE = new Date('2026-04-30T12:00:00.000Z');

function seedId(kind: 'profile' | 'order', key: string): string {
  return uuidv5(`lab690:${kind}:${key}`, uuidv5.URL);
}

async function runInBatches<T>(
  items: T[],
  operation: (item: T) => Promise<unknown>,
  onProgress?: (completed: number, total: number) => void
): Promise<void> {
  let completed = 0;
  for (let index = 0; index < items.length; index += WRITE_BATCH_SIZE) {
    const batch = items.slice(index, index + WRITE_BATCH_SIZE);
    const results = await Promise.allSettled(batch.map(operation));
    const failures = results.filter(result => result.status === 'rejected');
    if (failures.length) {
      throw new Error(
        `${failures.length} data operation(s) failed. Some records may have been processed. ${failures.map(result => String(result.reason)).join('; ')}`
      );
    }
    completed += batch.length;
    onProgress?.(completed, items.length);
  }
}

export class RayfinFieldService implements IFieldService {
  private demoDataChecked = false;

  async bootstrapDemoData(): Promise<void> {
    if (this.demoDataChecked) {
      return;
    }

    const hasWorkOrders = await this.hasWorkOrders();
    if (hasWorkOrders) {
      this.demoDataChecked = true;
      return;
    }

    await this.createInitialOrder();
    this.demoDataChecked = true;
  }

  async getDataSummary(): Promise<AdminDataSummary> {
    const [servicePros, workOrders, comments] = await Promise.all([
      this.getServicePros(),
      this.getWorkOrders(),
      this.getCommentsByFilter(),
    ]);
    return {
      servicePros: servicePros.length,
      workOrders: workOrders.length,
      comments: comments.length,
    };
  }

  async restoreSeedData(
    seedData: FieldServiceSeedDataset,
    onProgress?: SeedProgressCallback
  ): Promise<AdminDataSummary> {
    this.validateSeedData(seedData);
    const client = getRayfinClient();
    const [existingProfiles, existingOrders] = await Promise.all([
      this.getServicePros(), this.getWorkOrders(),
    ]);
    const profileIds = new Set(existingProfiles.map(profile => profile.id));
    const orderIds = new Set(existingOrders.map(order => order.id));

    const serviceProIdsBySeedId = new Map<string, string>();
    let profileCompleted = 0;
    for (const seedProfile of seedData.servicePros) {
      const id = seedId('profile', seedProfile.seedId);
      if (!profileIds.has(id)) {
        await client.data.ServicePro.create({
          id,
          user_id: seedProfile.userId,
          name: seedProfile.name,
          skills: seedProfile.skills.join(', '),
          createdAt: BASELINE_DATE,
          updatedAt: BASELINE_DATE,
        });
      }
      serviceProIdsBySeedId.set(seedProfile.seedId, id);
      profileCompleted++;
      onProgress?.('servicePros', profileCompleted, seedData.servicePros.length);
    }

    await runInBatches(
      seedData.workOrders,
      async (seedOrder) => {
        const id = seedId('order', seedOrder.id);
        if (orderIds.has(id)) return;
        const serviceProId = seedOrder.serviceProSeedId
          ? serviceProIdsBySeedId.get(seedOrder.serviceProSeedId)
          : null;

        if (seedOrder.serviceProSeedId && !serviceProId) {
          throw new Error(
            `Seed work order ${seedOrder.id} references unknown Service Pro ${seedOrder.serviceProSeedId}.`
          );
        }

        await client.data.WorkOrder.create({
          id,
          customer: seedOrder.customer,
          address: seedOrder.address,
          task: seedOrder.task,
          scheduledAt: new Date(seedOrder.scheduledAt),
          ...(serviceProId ? { servicePro_id: serviceProId } : {}),
          note: seedOrder.note,
          status: seedOrder.status,
          createdAt: BASELINE_DATE,
          updatedAt: BASELINE_DATE,
        });
      },
      (completed, total) => onProgress?.('workOrders', completed, total)
    );

    const [profiles, orders] = await Promise.all([this.getServicePros(), this.getWorkOrders()]);
    const restoredProfiles = new Set(profiles.map(profile => profile.id));
    const restoredOrders = new Set(orders.map(order => order.id));
    if (seedData.servicePros.some(profile => !restoredProfiles.has(seedId('profile', profile.seedId))) ||
        seedData.workOrders.some(order => !restoredOrders.has(seedId('order', order.id)))) {
      throw new Error('Some sample records are missing. Retry Restore sample data to add them without replacing existing work.');
    }

    this.demoDataChecked = true;
    return this.getDataSummary();
  }

  async resetDemoData(confirmation: string): Promise<AdminDataSummary> {
    const itemId = getRayfinClient().runtimeConfig?.itemId;
    if (!itemId || confirmation !== `RESET ${itemId}`) {
      throw new Error('Reset requires confirmation of the current Fabric app item ID.');
    }
    await this.clearAllData();
    await this.createInitialOrder();
    this.demoDataChecked = true;
    return this.getDataSummary();
  }

  private async createInitialOrder(): Promise<void> {
    await getRayfinClient().data.WorkOrder.create({
      ...INITIAL_DEMO_ORDER,
      status: 'pending',
      createdAt: BASELINE_DATE,
      updatedAt: BASELINE_DATE,
    });
  }

  async getServicePros(): Promise<ServicePro[]> {
    const client = getRayfinClient();
    const servicePros: ServicePro[] = [];
    let cursor: string | null = null;
    let hasNextPage = true;

    while (hasNextPage) {
      let query = client.data.ServicePro.select(SERVICE_PRO_FIELDS)
        .orderBy({ name: 'asc', id: 'asc' })
        .first(READ_PAGE_SIZE);

      if (cursor) {
        query = query.after(cursor);
      }

      const page = await query.executePaginated();
      servicePros.push(...page.items);
      cursor = page.endCursor ?? null;
      hasNextPage = page.hasNextPage;
    }

    return servicePros;
  }

  async getMyProfile(userId: string): Promise<ServicePro | null> {
    const client = getRayfinClient();
    const [profile] = await client.data.ServicePro.select([
      'id',
      'name',
      'skills',
      'user_id',
      'createdAt',
      'updatedAt',
    ])
      .where({ user_id: { eq: userId } })
      .first(1)
      .execute();
    return profile ?? null;
  }

  async createProfile(
    userId: string,
    name: string,
    skills: string
  ): Promise<ServicePro> {
    const client = getRayfinClient();
    const now = new Date();
    return client.data.ServicePro.create({
      name,
      skills,
      user_id: userId,
      createdAt: now,
      updatedAt: now,
    });
  }

  async updateProfile(
    id: string,
    name: string,
    skills: string
  ): Promise<ServicePro> {
    const client = getRayfinClient();
    return client.data.ServicePro.update(
      { id },
      {
        name,
        skills,
        updatedAt: new Date(),
      }
    );
  }

  async getWorkOrders(): Promise<WorkOrder[]> {
    return this.getWorkOrdersByFilter();
  }

  async getWorkOrdersForServicePro(serviceProId: string): Promise<WorkOrder[]> {
    return this.getWorkOrdersByFilter({
      or: [
        { servicePro_id: { isNull: true } },
        { servicePro_id: { eq: serviceProId } },
      ],
    });
  }

  async getCommentsForWorkOrders(
    workOrderIds: string[]
  ): Promise<WorkOrderComment[]> {
    const uniqueWorkOrderIds = [...new Set(workOrderIds)];
    const comments: WorkOrderComment[] = [];
    for (let offset = 0; offset < uniqueWorkOrderIds.length; offset += 50) {
      comments.push(...await this.getCommentsByFilter({
        or: uniqueWorkOrderIds.slice(offset, offset + 50)
          .map(workOrderId => ({ workOrderId: { eq: workOrderId } })),
      }));
    }

    return comments.sort(
        (left, right) =>
          new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
      );
  }

  private async getWorkOrdersByFilter(
    filter?: WorkOrderQueryFilter
  ): Promise<WorkOrder[]> {
    const client = getRayfinClient();
    const workOrders: WorkOrder[] = [];
    let cursor: string | null = null;
    let hasNextPage = true;

    while (hasNextPage) {
      let query = client.data.WorkOrder.select(WORK_ORDER_FIELDS)
        .orderBy({ scheduledAt: 'asc', id: 'asc' })
        .first(READ_PAGE_SIZE);

      if (filter) {
        query = query.where(filter);
      }

      if (cursor) {
        query = query.after(cursor);
      }

      const page = await query.executePaginated();
      workOrders.push(...page.items);
      cursor = page.endCursor ?? null;
      hasNextPage = page.hasNextPage;
    }

    return workOrders;
  }

  private async getCommentsByFilter(
    filter?: WorkOrderCommentQueryFilter
  ): Promise<WorkOrderComment[]> {
    const client = getRayfinClient();
    const comments: WorkOrderComment[] = [];
    let cursor: string | null = null;
    let hasNextPage = true;

    while (hasNextPage) {
      let query = client.data.WorkOrderComment.select(WORK_ORDER_COMMENT_FIELDS)
        .orderBy({ createdAt: 'asc', id: 'asc' })
        .first(READ_PAGE_SIZE);

      if (filter) {
        query = query.where(filter);
      }

      if (cursor) {
        query = query.after(cursor);
      }

      const page = await query.executePaginated();
      comments.push(...page.items);
      cursor = page.endCursor ?? null;
      hasNextPage = page.hasNextPage;
    }

    return comments;
  }

  async createWorkOrder(input: NewWorkOrderInput): Promise<WorkOrder> {
    const client = getRayfinClient();
    const now = new Date();
    return client.data.WorkOrder.create({
      customer: input.customer,
      address: input.address,
      task: input.task,
      scheduledAt: input.scheduledAt,
      status: input.servicePro_id ? 'assigned' : 'pending',
      ...(input.servicePro_id ? { servicePro_id: input.servicePro_id } : {}),
      note: input.note ?? '',
      createdAt: now,
      updatedAt: now,
    });
  }

  async createWorkOrderComment(
    input: NewWorkOrderCommentInput
  ): Promise<WorkOrderComment> {
    const content = input.content.trim();
    if (!content) {
      throw new Error('Comment content is required.');
    }

    const client = getRayfinClient();
    return client.data.WorkOrderComment.create({
      userId: input.userId,
      createdAt: new Date(),
      workOrderId: input.workOrderId,
      content,
    });
  }

  async assignWorkOrder(
    id: string,
    serviceProId: string | null
  ): Promise<WorkOrder> {
    const client = getRayfinClient();
    if (serviceProId) {
      return client.data.WorkOrder.update(
        { id },
        {
          servicePro_id: serviceProId,
          status: 'assigned',
          updatedAt: new Date(),
        }
      );
    }

    return client.data.WorkOrder.update({ id }, {
      servicePro_id: null,
      status: 'pending',
      updatedAt: new Date(),
    });
  }

  async acceptWorkOrder(
    id: string,
    serviceProId: string
  ): Promise<WorkOrder> {
    const client = getRayfinClient();
    return client.data.WorkOrder.update(
      { id },
      {
        servicePro_id: serviceProId,
        status: 'assigned',
        updatedAt: new Date(),
      }
    );
  }

  async updateWorkOrderStatus(
    id: string,
    status: WorkOrderStatus
  ): Promise<WorkOrder> {
    const client = getRayfinClient();
    return client.data.WorkOrder.update(
      { id },
      {
        status,
        updatedAt: new Date(),
      }
    );
  }

  private async clearAllData(): Promise<void> {
    const client = getRayfinClient();
    const [workOrders, servicePros, comments] = await Promise.all([
      this.getWorkOrders(),
      this.getServicePros(),
      this.getCommentsByFilter(),
    ]);

    await runInBatches(
      comments,
      comment => client.data.WorkOrderComment.delete({ id: comment.id })
    );
    await runInBatches(
      workOrders,
      (workOrder) => client.data.WorkOrder.delete({ id: workOrder.id })
    );
    await runInBatches(
      servicePros,
      (servicePro) => client.data.ServicePro.delete({ id: servicePro.id })
    );
    this.demoDataChecked = false;
  }

  private async hasWorkOrders(): Promise<boolean> {
    const client = getRayfinClient();
    const orders = await client.data.WorkOrder.select(['id'])
      .first(1)
      .execute();
    return orders.length > 0;
  }

  private validateSeedData(seedData: FieldServiceSeedDataset): void {
    const serviceProIds = new Set<string>();

    if (seedData.servicePros.length < 12) {
      throw new Error('Seed data must include at least 12 Service Pro profiles.');
    }

    for (const profile of seedData.servicePros) {
      if (!profile.seedId || !profile.name || !profile.userId) {
        throw new Error('Seed Service Pro profiles must include seedId, name, and userId.');
      }
      if (!Array.isArray(profile.skills) || profile.skills.length === 0) {
        throw new Error(`Seed Service Pro ${profile.seedId} must include skills.`);
      }
      if (serviceProIds.has(profile.seedId)) {
        throw new Error(`Duplicate seed Service Pro ${profile.seedId}.`);
      }
      serviceProIds.add(profile.seedId);
    }

    const orderIds = new Set<string>();
    for (const order of seedData.workOrders) {
      if (!order.id || !order.customer || !order.address || !order.task ||
          !Number.isFinite(new Date(order.scheduledAt).getTime())) {
        throw new Error(`Seed work order ${order.id} is missing required data.`);
      }
      if (orderIds.has(order.id)) throw new Error(`Duplicate seed work order ${order.id}.`);
      orderIds.add(order.id);
      if (!['pending', 'assigned', 'in_progress', 'completed', 'needs_followup', 'cancelled'].includes(order.status)) {
        throw new Error(`Seed work order ${order.id} has an invalid status.`);
      }
      if (!order.serviceProSeedId && order.status !== 'pending') {
        throw new Error(`Unassigned seed work order ${order.id} must be pending.`);
      }
      if (order.serviceProSeedId && !serviceProIds.has(order.serviceProSeedId)) {
        throw new Error(
          `Seed work order ${order.id} references unknown Service Pro ${order.serviceProSeedId}.`
        );
      }
    }
  }
}
