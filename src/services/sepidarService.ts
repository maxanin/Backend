// services/sepidarService.ts
import axios, { AxiosInstance } from "axios";
import crypto from "crypto";
import { parseStringPromise } from "xml2js";
import Device from "../models/Device";

type SepidarHeaders = {
  GenerationVersion: string;
  IntegrationID: number | string;
  ArbitraryCode: string;
  EncArbitraryCode: string;
  Authorization?: string;
};

export default class SepidarService {
  private http: AxiosInstance;
  private baseURL: string;

  constructor(baseURL = process.env.SEPIDAR_URL ?? "http://localhost:7373/api") {
    this.baseURL = baseURL.replace(/\/+$/, "");
    this.http = axios.create({ baseURL: this.baseURL, timeout: 15000 });
  }

  /** Build AES key from serial by concatenating serial twice (per doc) */
  private buildAesKeyFromSerial(serial: string): Buffer {
    // سریال را دوبار پشت‌سر‌هم می‌چسبانیم؛ سپس به طول 32 بایت (AES-256-CBC) پد یا برش می‌دهیم
    const doubled = (serial + serial);
    const key = Buffer.alloc(32, 0);
    key.write(doubled.slice(0, 32), "utf8");
    return key;
  }

  /** AES-CBC encrypt Base64 out */
  private aesCbcEncryptBase64(plain: Buffer, key: Buffer, iv: Buffer): string {
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    const enc = Buffer.concat([cipher.update(plain), cipher.final()]);
    return enc.toString("base64");
  }

  /** AES-CBC decrypt Base64 in -> Buffer */
  private aesCbcDecryptBase64(b64: string, key: Buffer, iv: Buffer): Buffer {
    const data = Buffer.from(b64, "base64");
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    const dec = Buffer.concat([decipher.update(data), decipher.final()]);
    return dec;
  }

  /** Convert RSAKeyValue XML -> PEM public key */
  private async rsaXmlToPemPublicKey(xml: string): Promise<string> {
    const parsed = await parseStringPromise(xml);
    const modB64 = parsed.RSAKeyValue.Modulus[0];
    const expB64 = parsed.RSAKeyValue.Exponent[0];
    const modulus = Buffer.from(modB64, "base64");
    const exponent = Buffer.from(expB64, "base64");

    // Build ASN.1 SubjectPublicKeyInfo
    // Minimal DER builder:
    const der = this.buildRsaSpkiDer(modulus, exponent);
    const pem = `-----BEGIN PUBLIC KEY-----\n${der.toString("base64").match(/.{1,64}/g)!.join("\n")}\n-----END PUBLIC KEY-----\n`;
    return pem;
  }

  /** Build DER for RSA SPKI (very compact) */
  private buildRsaSpkiDer(modulus: Buffer, exponent: Buffer): Buffer {
    // Helper to build ASN.1
    const seq = (bufs: Buffer[]) => Buffer.concat([Buffer.from([0x30, this.len(bufs)]), ...bufs]);
    const int = (buf: Buffer) => {
      // ensure positive: prepend 0x00 if high bit set
      if (buf[0] & 0x80) buf = Buffer.concat([Buffer.from([0x00]), buf]);
      return Buffer.concat([Buffer.from([0x02, buf.length]), buf]);
    };
    const bitString = (buf: Buffer) => Buffer.concat([Buffer.from([0x03, buf.length + 1, 0x00]), buf]);
    const oid = (bytes: number[]) => Buffer.from([0x06, bytes.length, ...bytes]);
    const nullTag = Buffer.from([0x05, 0x00]);

    // rsaEncryption OID 1.2.840.113549.1.1.1
    const rsaOid = oid([0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01]);

    const rsaPubKey = seq([int(modulus), int(exponent)]);
    const algId = seq([rsaOid, nullTag]);
    const spki = seq([algId, bitString(rsaPubKey)]);
    return spki;
  }

  private len(parts: Buffer[]): number {
    const total = parts.reduce((n, b) => n + b.length, 0);
    if (total < 128) return total;
    const bytes = [];
    let t = total;
    while (t > 0) { bytes.unshift(t & 0xff); t >>= 8; }
    return Buffer.concat([Buffer.from([0x80 | bytes.length]), Buffer.from(bytes)]).readUIntBE(0, 1 + bytes.length); // not used directly
  }

  /** Register device: send Cypher/IV built from client serial rules; get RSA public key back */
  async registerDevice(tenantId: string, serial: string, integrationIdFromUi?: number) {
    // IntegrationID: 4 رقم سمت چپ سریال طبق داک. :contentReference[oaicite:25]{index=25}
    const integrationId = integrationIdFromUi ?? parseInt(serial.slice(0, 4), 10);
    const key = this.buildAesKeyFromSerial(serial);
    const iv = crypto.randomBytes(16);
    const payload = Buffer.from(String(integrationId), "utf8");
    const cypherB64 = this.aesCbcEncryptBase64(payload, key, iv);

    const { data } = await this.http.post("/Devices/Register/", {
      Cypher: cypherB64,
      IV: iv.toString("base64"),
      IntegrationID: integrationId
    }); // رجوع به سند رجیستر دستگاه. :contentReference[oaicite:26]{index=26}

    // پاسخ: Cypher/IV که باید با همان کلید/IV دیکریپت شوند تا XML RSAKeyValue بدست آید. :contentReference[oaicite:27]{index=27}
    const serverCypher = data.Cypher as string;
    const serverIv = data.IV as string;
    const decrypted = this.aesCbcDecryptBase64(serverCypher, key, Buffer.from(serverIv, "base64"));
    const publicKeyXml = decrypted.toString("utf8"); // <RSAKeyValue>...</RSAKeyValue>

    const device = await Device.findOneAndUpdate(
      { tenantId, integrationId },
      {
        serial,
        integrationId,
        publicKeyXml,
        cypherFromServer: serverCypher,
        ivFromServer: serverIv,
        isRegistered: true,
        lastRegisteredAt: new Date()
      },
      { upsert: true, new: true }
    );

    return device;
  }

  /** Build request headers for every call */
  async buildHeaders(tenantId: string, integrationId: number, token?: string): Promise<SepidarHeaders> {
    const device = await Device.findOne({ tenantId, integrationId, isRegistered: true });
    if (!device) throw new Error("Device not registered");

    const arbitrary = crypto.randomUUID(); // باید در هر درخواست یکتا باشد. :contentReference[oaicite:28]{index=28}
    const publicPem = await this.rsaXmlToPemPublicKey(device.publicKeyXml);

    const encArbitrary = crypto.publicEncrypt(
      { key: publicPem, padding: crypto.constants.RSA_PKCS1_PADDING }, // PKCS#1 v1.5. :contentReference[oaicite:29]{index=29}
      Buffer.from(arbitrary, "utf8")
    ).toString("base64");

    const headers: SepidarHeaders = {
      GenerationVersion: device.generationVersion || "101",
      IntegrationID: integrationId,
      ArbitraryCode: arbitrary,
      EncArbitraryCode: encArbitrary
    };

    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  }

  /** Users/Login (returns JWT) */
  async login(tenantId: string, integrationId: number, username: string, password: string) {
    // SECURITY NOTE: MD5 is used here ONLY because it's required by the Sepidar API.
    // This is a known limitation of the external API and not a security choice.
    // MD5 is cryptographically broken and should never be used for password hashing
    // in applications we control.
    const md5 = crypto.createHash("md5").update(password, "utf8").digest("hex"); // طبق سند: PasswordHash=MD5. :contentReference[oaicite:30]{index=30}
    const headers = await this.buildHeaders(tenantId, integrationId);

    const { data } = await this.http.post("/users/login", {
      UserName: username,
      PasswordHash: md5
    }, { headers });

    // data.Token شامل JWT برای درخواست‌های بعدی است. :contentReference[oaicite:31]{index=31}
    return data as { Token: string; UserID: number; Title: string };
  }

  /** IsAuthorized */
  async isAuthorized(tenantId: string, integrationId: number, token: string) {
    const headers = await this.buildHeaders(tenantId, integrationId, token);
    const { data } = await this.http.get("/IsAuthorized", { headers }); // برمی‌گرداند bool. :contentReference[oaicite:32]{index=32}
    return data as boolean;
  }

  /** General/GenerationVersion (اختیاری: گرفتن LockNumber) */
  async getGenerationInfo() {
    const { data } = await this.http.get("/General/GenerationVersion/"); // خروجی: GenerationVersion + LockNumber. :contentReference[oaicite:33]{index=33}
    return data as { GenerationVersion: string; LockNumber: string };
  }

  // ---------- Data APIs (همه با هدرهای اجباری) ----------

  async getItems(tenantId: string, integrationId: number, token: string) {
    const headers = await this.buildHeaders(tenantId, integrationId, token);
    const { data } = await this.http.get("/Items", { headers }); // ساختار Item[] طبق سند. :contentReference[oaicite:34]{index=34}
    return data;
  }

  async getItemImage(tenantId: string, integrationId: number, token: string, itemId: number) {
    const headers = await this.buildHeaders(tenantId, integrationId, token);
    const { data } = await this.http.get(`/Items/${itemId}/Image`, { headers }); // Base64 image. :contentReference[oaicite:35]{index=35}
    return data as string;
  }

  async getInventories(tenantId: string, integrationId: number, token: string) {
    const headers = await this.buildHeaders(tenantId, integrationId, token);
    const { data } = await this.http.get("/Items/Inventories", { headers }); // موجودی‌ها. :contentReference[oaicite:36]{index=36}
    return data;
  }

  async getPriceNoteItems(tenantId: string, integrationId: number, token: string) {
    const headers = await this.buildHeaders(tenantId, integrationId, token);
    const { data } = await this.http.get("/PriceNoteItems", { headers }); // Fee و marginها. :contentReference[oaicite:37]{index=37}
    return data;
  }

  // Customers
  async getCustomers(tenantId: string, integrationId: number, token: string) {
    const headers = await this.buildHeaders(tenantId, integrationId, token);
    const { data } = await this.http.get("/Customers", { headers }); // Customer[]. :contentReference[oaicite:38]{index=38}
    return data;
  }
  async getCustomerById(tenantId: string, integrationId: number, token: string, customerId: number) {
    const headers = await this.buildHeaders(tenantId, integrationId, token);
    const { data } = await this.http.get(`/Customers/${customerId}`, { headers }); // جزئیات. :contentReference[oaicite:39]{index=39}
    return data;
  }

  // Quotations
  async getQuotations(tenantId: string, integrationId: number, token: string, fromDate?: string, toDate?: string) {
    const headers = await this.buildHeaders(tenantId, integrationId, token);
    const params: any = {};
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;
    const { data } = await this.http.get("/Quotations", { headers, params }); // لیست بدون اقلام. 
    return data;
  }
  async getQuotation(tenantId: string, integrationId: number, token: string, id: number) {
    const headers = await this.buildHeaders(tenantId, integrationId, token);
    const { data } = await this.http.get(`/Quotations/${id}`, { headers }); // با اقلام. 
    return data;
  }
  async createQuotation(tenantId: string, integrationId: number, token: string, body: any) {
    const headers = await this.buildHeaders(tenantId, integrationId, token);
    const { data } = await this.http.post("/Quotations", body, { headers }); // POST بدنه طبق مدل. 
    return data;
  }
  async closeQuotation(tenantId: string, integrationId: number, token: string, quotationId: number) {
    const headers = await this.buildHeaders(tenantId, integrationId, token);
    await this.http.post(`/Quotations/${quotationId}/Close`, {}, { headers }); // Close. :contentReference[oaicite:43]{index=43}
  }
  async uncloseQuotation(tenantId: string, integrationId: number, token: string, quotationId: number) {
    const headers = await this.buildHeaders(tenantId, integrationId, token);
    await this.http.post(`/Quotations/${quotationId}/UnClose`, {}, { headers }); // UnClose. :contentReference[oaicite:44]{index=44}
  }
  async deleteQuotation(tenantId: string, integrationId: number, token: string, quotationId: number) {
    const headers = await this.buildHeaders(tenantId, integrationId, token);
    await this.http.delete(`/Quotations/${quotationId}`, { headers }); // DELETE. :contentReference[oaicite:45]{index=45}
  }

  // Invoices
  async getInvoices(tenantId: string, integrationId: number, token: string) {
    const headers = await this.buildHeaders(tenantId, integrationId, token);
    const { data } = await this.http.get("/invoices", { headers }); // لیست. :contentReference[oaicite:46]{index=46}
    return data;
  }
  async getInvoice(tenantId: string, integrationId: number, token: string, id: number) {
    const headers = await this.buildHeaders(tenantId, integrationId, token);
    const { data } = await this.http.get(`/invoices/${id}`, { headers }); // جزئیات. :contentReference[oaicite:47]{index=47}
    return data;
  }
  async createInvoice(tenantId: string, integrationId: number, token: string, body: any) {
    const headers = await this.buildHeaders(tenantId, integrationId, token);
    const { data } = await this.http.post("/invoices", body, { headers }); // POST. :contentReference[oaicite:48]{index=48}
    return data;
  }
  async createInvoiceBasedOnQuotation(tenantId: string, integrationId: number, token: string, quotationId: number) {
    const headers = await this.buildHeaders(tenantId, integrationId, token);
    const { data } = await this.http.post("/Invoices/BasedOnQuotation", { QuatationID: quotationId }, { headers }); // تبدیل از پیش‌فاکتور. :contentReference[oaicite:49]{index=49}
    return data;
  }
}
