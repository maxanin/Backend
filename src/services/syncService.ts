import SepidarService from "./sepidarService";
import Item from "../models/Item";
import Inventory from "../models/Inventory";
import PriceNoteItem from "../models/PriceNoteItem";
import Customer from "../models/Customer";
import SyncLog from "../models/SyncLog";

export default class SyncService {
  private sepidar: SepidarService;

  constructor(sepidar = new SepidarService()) {
    this.sepidar = sepidar;
  }

  async syncItems(tenantId: string, integrationId: number, token: string) {
    const log = await SyncLog.create({ tenantId, scope: "items", startedAt: new Date() });
    try {
      const items = await this.sepidar.getItems(tenantId, integrationId, token);
      const ops = items.map((it: any) => ({
        updateOne: {
          filter: { tenantId, itemId: it.Id ?? it.ID ?? it.id },
          update: {
            tenantId,
            itemId: it.Id ?? it.ID ?? it.id,
            code: it.Code,
            barcode: it.BarCode ?? it.Barcode,
            title: it.Title,
            isActive: it.IsActive,
            isSellable: it.IsSellable,
            type: it.Type,
            unitId: it.UnitRef ?? it.UnitId,
            secondaryUnitId: it.SecondaryUnitRef ?? it.SecondaryUnitId,
            unitsRatio: it.UnitsRatio,
            weight: it.Weight,
            volume: it.Volume,
            isTaxExempt: it.IsTaxExempt,
            taxRate: it.TaxRate,
            dutyRate: it.DutyRate,
            saleGroupRef: it.SaleGroupRef,
            tracings: it.Tracings?.map((t: any) => ({ tracingId: t.TracingId ?? t.TracingRef ?? t.Id, title: t.Title, isSelectable: t.IsSelectable })),
            tracingInventories: it.TracingInventories,
            totalInventory: it.TotalInventory,
            propertyValues: it.PropertyValues,
            brokerSellable: it.BrokerSellable,
            lastSyncAt: new Date()
          },
          upsert: true
        }
      }));
      if (ops.length) await Item.bulkWrite(ops);
      await SyncLog.findByIdAndUpdate(log._id, { finishedAt: new Date(), status: "ok", details: { count: ops.length } });
      return { count: ops.length };
    } catch (error: any) {
      await SyncLog.findByIdAndUpdate(log._id, { finishedAt: new Date(), status: "error", error });
      throw error;
    }
  }

  async syncInventories(tenantId: string, integrationId: number, token: string) {
    const log = await SyncLog.create({ tenantId, scope: "inventories", startedAt: new Date() });
    try {
      const inventories = await this.sepidar.getInventories(tenantId, integrationId, token);
      const ops = inventories.map((r: any) => ({
        updateOne: {
          filter: { tenantId, itemRef: r.ItemRef, stockRef: r.StockRef, tracingRef: r.TracingRef ?? null },
          update: { tenantId, itemRef: r.ItemRef, stockRef: r.StockRef, tracingRef: r.TracingRef, quantity: r.Quantity, lastSyncAt: new Date() },
          upsert: true
        }
      }));
      if (ops.length) await Inventory.bulkWrite(ops);
      await SyncLog.findByIdAndUpdate(log._id, { finishedAt: new Date(), status: "ok", details: { count: ops.length } });
      return { count: ops.length };
    } catch (error: any) {
      await SyncLog.findByIdAndUpdate(log._id, { finishedAt: new Date(), status: "error", error });
      throw error;
    }
  }

  async syncPriceNotes(tenantId: string, integrationId: number, token: string) {
    const log = await SyncLog.create({ tenantId, scope: "priceNotes", startedAt: new Date() });
    try {
      const rows = await this.sepidar.getPriceNoteItems(tenantId, integrationId, token);
      const ops = rows.map((p: any) => ({
        updateOne: {
          filter: { tenantId, priceNoteItemId: p.Id ?? p.ID ?? p.PriceNoteItemId },
          update: {
            tenantId,
            priceNoteItemId: p.Id ?? p.ID ?? p.PriceNoteItemId,
            saleTypeRef: p.SaleTypeRef,
            itemRef: p.ItemRef,
            tracingRef: p.TracingRef,
            unitRef: p.UnitRef,
            fee: p.Fee,
            canChangeInvoiceFee: p.CanChangeInvoiceFee,
            canChangeInvoiceDiscount: p.CanChangeInvoiceDiscount,
            customerGroupingRef: p.CustomerGroupingRef,
            upperMargin: p.UpperMargin,
            lowerMargin: p.LowerMargin,
            additionRate: p.AdditionRate,
            lastSyncAt: new Date()
          },
          upsert: true
        }
      }));
      if (ops.length) await PriceNoteItem.bulkWrite(ops);
      await SyncLog.findByIdAndUpdate(log._id, { finishedAt: new Date(), status: "ok", details: { count: ops.length } });
      return { count: ops.length };
    } catch (error: any) {
      await SyncLog.findByIdAndUpdate(log._id, { finishedAt: new Date(), status: "error", error });
      throw error;
    }
  }

  async syncCustomers(tenantId: string, integrationId: number, token: string) {
    const log = await SyncLog.create({ tenantId, scope: "customers", startedAt: new Date() });
    try {
      const customers = await this.sepidar.getCustomers(tenantId, integrationId, token);
      const ops = customers.map((c: any) => ({
        updateOne: {
          filter: { tenantId, customerId: c.Id ?? c.ID ?? c.CustomerId },
          update: {
            tenantId,
            customerId: c.Id ?? c.ID ?? c.CustomerId,
            guid: c.Guid ?? c.GUID ?? c.GuidString,
            title: c.Title,
            code: c.Code,
            phoneNumber: c.PhoneNumber,
            remainder: c.Remainder,
            creditRemainder: c.CreditRemainder,
            customerType: c.CustomerType,
            name: c.Name,
            lastName: c.LastName,
            birthDate: c.BirthDate,
            nationalId: c.NationalId,
            economicCode: c.EconomicCode,
            version: c.Version,
            groupingRef: c.GroupingRef,
            discountRate: c.DiscountRate,
            addresses: c.Addresses,
            lastSyncAt: new Date()
          },
          upsert: true
        }
      }));
      if (ops.length) await Customer.bulkWrite(ops);
      await SyncLog.findByIdAndUpdate(log._id, { finishedAt: new Date(), status: "ok", details: { count: ops.length } });
      return { count: ops.length };
    } catch (error: any) {
      await SyncLog.findByIdAndUpdate(log._id, { finishedAt: new Date(), status: "error", error });
      throw error;
    }
  }
}

