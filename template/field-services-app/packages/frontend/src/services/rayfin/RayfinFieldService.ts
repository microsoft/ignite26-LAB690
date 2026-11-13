import type { ServicePro, WorkOrder, WorkOrderStatus } from '@field-services/shared';
import type { GraphQLResponseValue } from '@microsoft/rayfin-data';
import { v5 as uuidv5 } from 'uuid';
import {
  AdminDataSummary,
  FieldServiceSeedDataset,
  IFieldService,
  NewWorkOrderInput,
  BulkResult,
} from '../interfaces/IFieldService';
import { createBulkCheckpoint, parseBulkCheckpoint, runBulkSlice, type BulkOptions, type BulkTarget } from '../BulkOperation';

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

type WorkOrderQueryFilter = {
  servicePro_id?: {
    eq?: string;
    isNull?: boolean;
  };
  or?: WorkOrderQueryFilter[];
};

const INITIAL_DEMO_ORDER = {
  id: uuidv5('lab690:initial-work-order', uuidv5.URL),
  customer: 'Jane Doe',
  address: '12 Rue de Rivoli, Paris',
  task: 'Hang large painting in living room',
  scheduledAt: new Date('2026-05-03T10:00:00Z'),
  note: 'Initial example work order. Leave unassigned so any Service Pro can accept it.',
};

const READ_PAGE_SIZE = 100;
const BASELINE_DATE = new Date('2026-04-30T12:00:00.000Z');

function toServicePro(profile: GraphQLResponseValue<ServicePro>): ServicePro {
  return {
    ...profile,
    createdAt: new Date(profile.createdAt),
    updatedAt: new Date(profile.updatedAt),
  };
}

function toWorkOrder(order: GraphQLResponseValue<WorkOrder>): WorkOrder {
  return {
    ...order,
    scheduledAt: new Date(order.scheduledAt),
    createdAt: new Date(order.createdAt),
    updatedAt: new Date(order.updatedAt),
  };
}

function seedId(kind: 'profile' | 'order', key: string): string {
  return uuidv5(`lab690:${kind}:${key}`, uuidv5.URL);
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
    const [servicePros, workOrders] = await Promise.all([
      this.getServicePros(),
      this.getWorkOrders(),
    ]);
    return {
      servicePros: servicePros.length,
      workOrders: workOrders.length,
    };
  }

  async restoreSeedData(
    seedData: FieldServiceSeedDataset,
    options: BulkOptions
  ): Promise<BulkResult> {
    this.validateSeedData(seedData);
    const client = getRayfinClient();
    const profiles = new Map(seedData.servicePros.map(profile => [seedId('profile', profile.seedId), profile]));
    const orders = new Map(seedData.workOrders.map(order => [seedId('order', order.id), order]));
    const targets: BulkTarget[] = [
      ...[...profiles.keys()].map(id => ({ entity: 'servicePros' as const, id })),
      ...[...orders.keys()].map(id => ({ entity: 'workOrders' as const, id })),
    ];
    const datasetId = uuidv5(JSON.stringify(seedData), uuidv5.URL);
    const start = options.checkpoint
      ? parseBulkCheckpoint(options.checkpoint)
      : createBulkCheckpoint('seed', datasetId, targets);
    if (start.action !== 'seed' || start.datasetId !== datasetId ||
        JSON.stringify(start.targets) !== JSON.stringify(targets)) {
      throw new Error('The saved restore checkpoint does not match this seed dataset. Discard it and start a new restore.');
    }
    const checkpoint = await runBulkSlice(start, async ({ entity, id }) => {
      if (entity === 'servicePros') {
        const [existing] = await client.data.ServicePro.select(['id']).where({ id: { eq: id } }).first(1).execute();
        if (existing) return;
        const seedProfile = profiles.get(id);
        if (!seedProfile) throw new Error('Unknown sample profile.');
        await client.data.ServicePro.create({
          id,
          user_id: seedProfile.userId,
          name: seedProfile.name,
          skills: seedProfile.skills.join(', '),
          createdAt: BASELINE_DATE,
          updatedAt: BASELINE_DATE,
        });
      } else {
        const [existing] = await client.data.WorkOrder.select(['id']).where({ id: { eq: id } }).first(1).execute();
        if (existing) return;
        const seedOrder = orders.get(id);
        if (!seedOrder) throw new Error('Unknown sample work order.');
        const serviceProId = seedOrder.serviceProSeedId
          ? seedId('profile', seedOrder.serviceProSeedId)
          : null;
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
      }
    }, options);
    if (checkpoint.nextIndex < checkpoint.targets.length) return { done: false, checkpoint };

    const [currentProfiles, currentOrders] = await Promise.all([this.getServicePros(), this.getWorkOrders()]);
    const restoredProfiles = new Set(currentProfiles.map(profile => profile.id));
    const restoredOrders = new Set(currentOrders.map(order => order.id));
    if (seedData.servicePros.some(profile => !restoredProfiles.has(seedId('profile', profile.seedId))) ||
        seedData.workOrders.some(order => !restoredOrders.has(seedId('order', order.id)))) {
      options.onCheckpoint({ ...checkpoint, nextIndex: 0 });
      throw new Error('Some sample records are missing. Resume to add them without replacing existing work.');
    }

    this.demoDataChecked = true;
    return { done: true, checkpoint, summary: await this.getDataSummary() };
  }

  async resetDemoData(confirmation: string, options: BulkOptions): Promise<BulkResult> {
    const itemId = getRayfinClient().runtimeConfig?.itemId;
    if (!itemId || confirmation !== `RESET ${itemId}`) {
      throw new Error('Reset requires confirmation of the current Fabric app item ID.');
    }
    let start = options.checkpoint ? parseBulkCheckpoint(options.checkpoint) : undefined;
    if (!start) {
      const [workOrders, servicePros] = await Promise.all([
        this.getWorkOrders(), this.getServicePros(),
      ]);
      start = createBulkCheckpoint('reset', 'reset-v1', [
        ...workOrders.map(({ id }) => ({ entity: 'workOrders' as const, id })),
        ...servicePros.map(({ id }) => ({ entity: 'servicePros' as const, id })),
        { entity: 'initialOrder', id: INITIAL_DEMO_ORDER.id },
      ]);
    }
    const rank = { comments: -1, workOrders: 0, servicePros: 1, initialOrder: 2 };
    if (start.action !== 'reset' || start.datasetId !== 'reset-v1' ||
        start.targets.at(-1)?.entity !== 'initialOrder' ||
        start.targets.at(-1)?.id !== INITIAL_DEMO_ORDER.id ||
        start.targets.some((target, index) => target.entity === 'comments' || (index > 0 &&
          (rank[target.entity] < rank[start.targets[index - 1].entity] ||
           start.targets[index - 1].entity === 'initialOrder')))) {
      throw new Error('Invalid reset checkpoint. Discard it and start a new reset.');
    }
    const client = getRayfinClient();
    const checkpoint = await runBulkSlice(start, async ({ entity, id }) => {
      if (entity === 'initialOrder') {
        const [existing] = await client.data.WorkOrder.select(['id']).where({ id: { eq: id } }).first(1).execute();
        if (!existing) await this.createInitialOrder();
      } else {
        const table = entity === 'workOrders' ? client.data.WorkOrder : client.data.ServicePro;
        const query = entity === 'workOrders' ? client.data.WorkOrder.select(['id']) : client.data.ServicePro.select(['id']);
        const [existing] = await query.where({ id: { eq: id } }).first(1).execute();
        if (existing) await table.delete({ id });
      }
    }, options);
    if (checkpoint.nextIndex < checkpoint.targets.length) return { done: false, checkpoint };
    const summary = await this.getDataSummary();
    const initialOrder = await this.getWorkOrderById(INITIAL_DEMO_ORDER.id);
    if (summary.servicePros !== 0 || summary.workOrders !== 1 ||
        initialOrder.servicePro_id || initialOrder.status !== 'pending') {
      throw new Error('Reset verification failed; data changed during reset. Close other app tabs, discard the checkpoint, and start a new reset.');
    }
    this.demoDataChecked = true;
    return { done: true, checkpoint, summary };
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
      servicePros.push(...page.items.map(toServicePro));
      cursor = page.endCursor ?? null;
      hasNextPage = page.hasNextPage;
    }

    return servicePros;
  }

  async getMyProfile(userId: string): Promise<ServicePro | null> {
    const client = getRayfinClient();
    const [profile] = await client.data.ServicePro.select(SERVICE_PRO_FIELDS)
      .where({ user_id: { eq: userId } })
      .first(1)
      .execute();
    return profile ? toServicePro(profile) : null;
  }

  async createProfile(
    userId: string,
    name: string,
    skills: string
  ): Promise<ServicePro> {
    const client = getRayfinClient();
    const now = new Date();
    const profile = await client.data.ServicePro.create({
      name,
      skills,
      user_id: userId,
      createdAt: now,
      updatedAt: now,
    });
    return toServicePro(profile);
  }

  async updateProfile(
    id: string,
    name: string,
    skills: string
  ): Promise<ServicePro> {
    const client = getRayfinClient();
    await client.data.ServicePro.update(
      { id },
      {
        name,
        skills,
        updatedAt: new Date(),
      }
    );
    const [profile] = await client.data.ServicePro.select(SERVICE_PRO_FIELDS)
      .where({ id: { eq: id } })
      .first(1)
      .execute();
    if (!profile) {
      throw new Error('Updated Service Pro profile could not be read.');
    }
    return toServicePro(profile);
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
      workOrders.push(...page.items.map(toWorkOrder));
      cursor = page.endCursor ?? null;
      hasNextPage = page.hasNextPage;
    }

    return workOrders;
  }

  async createWorkOrder(input: NewWorkOrderInput): Promise<WorkOrder> {
    const client = getRayfinClient();
    const now = new Date();
    const order = await client.data.WorkOrder.create({
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
    return this.getWorkOrderById(order.id);
  }

  async assignWorkOrder(
    id: string,
    serviceProId: string | null
  ): Promise<WorkOrder> {
    const client = getRayfinClient();
    if (serviceProId) {
      await client.data.WorkOrder.update(
        { id },
        {
          servicePro_id: serviceProId,
          status: 'assigned',
          updatedAt: new Date(),
        }
      );
    } else {
      await client.data.WorkOrder.update({ id }, {
        servicePro_id: null,
        status: 'pending',
        updatedAt: new Date(),
      });
    }
    return this.getWorkOrderById(id);
  }

  async acceptWorkOrder(
    id: string,
    serviceProId: string
  ): Promise<WorkOrder> {
    const client = getRayfinClient();
    await client.data.WorkOrder.update(
      { id },
      {
        servicePro_id: serviceProId,
        status: 'assigned',
        updatedAt: new Date(),
      }
    );
    return this.getWorkOrderById(id);
  }

  async updateWorkOrderStatus(
    id: string,
    status: WorkOrderStatus
  ): Promise<WorkOrder> {
    const client = getRayfinClient();
    await client.data.WorkOrder.update(
      { id },
      {
        status,
        updatedAt: new Date(),
      }
    );
    return this.getWorkOrderById(id);
  }

  private async getWorkOrderById(id: string): Promise<WorkOrder> {
    const [order] = await getRayfinClient().data.WorkOrder.select(WORK_ORDER_FIELDS)
      .where({ id: { eq: id } })
      .first(1)
      .execute();
    if (!order) {
      throw new Error('Saved work order could not be read.');
    }
    return toWorkOrder(order);
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
