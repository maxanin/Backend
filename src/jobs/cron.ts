import SepidarService from "../services/sepidarService";
import SyncService from "../services/syncService";

type SyncContext = { tenantId: string; integrationId: number; token: string };

export function startCron(getContexts: () => Promise<SyncContext[]>, intervalMs = 15 * 60 * 1000) {
  const sepidar = new SepidarService();
  const syncService = new SyncService(sepidar);

  const run = async () => {
    try {
      const contexts = await getContexts();
      for (const c of contexts) {
        await Promise.all([
          syncService.syncItems(c.tenantId, c.integrationId, c.token),
          syncService.syncInventories(c.tenantId, c.integrationId, c.token),
          syncService.syncPriceNotes(c.tenantId, c.integrationId, c.token),
          syncService.syncCustomers(c.tenantId, c.integrationId, c.token)
        ]);
      }
    } catch (e) {
      // لاگ با لاگر اپ انجام می‌شود (در این ماژول دسترسی مستقیم نداریم)
    }
  };

  // اجرای نخستین و سپس دوره‌ای
  run();
  const id = setInterval(run, intervalMs);
  return () => clearInterval(id);
}
