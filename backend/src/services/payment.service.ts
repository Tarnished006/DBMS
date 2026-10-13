import { v4 as uuidv4 } from 'uuid';
import { db, isPostgres } from '../db/dbAdapter.js';
import { memoryDb } from '../db/memoryStore.js';
import { BusinessException } from '../errors/BusinessException.js';
import { PaymentDto } from '../types/index.js';

export class PaymentService {
  async getPaymentByOrderId(orderId: string): Promise<PaymentDto> {
    if (isPostgres()) {
      const res = await db.query('SELECT * FROM payments WHERE order_id = $1', [orderId]);
      if (res.rows.length === 0) throw new BusinessException('PAYMENT_NOT_FOUND');
      return this.enrichPayment(res.rows[0]);
    }
    const p = memoryDb.payments.find((pm) => pm.order_id === orderId);
    if (!p) throw new BusinessException('PAYMENT_NOT_FOUND');
    return this.enrichPayment(p);
  }

  async processPayment(orderId: string, provider = 'MOCK'): Promise<PaymentDto> {
    const existing = await this.getPaymentByOrderId(orderId);
    if (existing.status === 'SUCCESS') {
      throw new BusinessException('PAYMENT_ALREADY_EXISTS', 'Payment has already succeeded for this order.');
    }

    const now = new Date();
    const txId = uuidv4();

    if (isPostgres()) {
      await db.query(
        'UPDATE payments SET status = $1, provider = $2, last_modified_date = $3 WHERE id = $4',
        ['SUCCESS', provider, now, existing.id]
      );

      await db.query(
        `INSERT INTO payment_transactions (
          id, payment_id, external_transaction_id, transaction_type, amount, status, created_date, last_modified_date
        ) VALUES ($1, $2, $3, 'PAYMENT', $4, 'SUCCESS', $5, $5)`,
        [txId, existing.id, `EXT-${Date.now().toString(36).toUpperCase()}`, existing.amount, now]
      );
    } else {
      const p = memoryDb.payments.find((pm) => pm.id === existing.id);
      if (p) {
        p.status = 'SUCCESS';
        p.provider = provider;
        p.last_modified_date = now;
      }

      memoryDb.payment_transactions.push({
        id: txId,
        payment_id: existing.id,
        external_transaction_id: `EXT-${Date.now().toString(36).toUpperCase()}`,
        transaction_type: 'PAYMENT',
        amount: existing.amount,
        status: 'SUCCESS',
        failure_reason: null,
        created_date: now,
        last_modified_date: now,
      });
    }

    return this.getPaymentByOrderId(orderId);
  }

  async refundPayment(orderId: string, isAdmin = false): Promise<PaymentDto> {
    const payment = await this.getPaymentByOrderId(orderId);
    if (payment.status !== 'SUCCESS') {
      throw new BusinessException(
        'PAYMENT_REFUND_NOT_ALLOWED',
        'Financial Policy Rule: A refund cannot be initiated for this payment under its current transaction status.'
      );
    }

    const now = new Date();
    const txId = uuidv4();

    if (isPostgres()) {
      await db.query('UPDATE payments SET status = $1, last_modified_date = $2 WHERE id = $3', [
        'REFUNDED',
        now,
        payment.id,
      ]);

      await db.query(
        `INSERT INTO payment_transactions (
          id, payment_id, external_transaction_id, transaction_type, amount, status, created_date, last_modified_date
        ) VALUES ($1, $2, $3, 'REFUND', $4, 'SUCCESS', $5, $5)`,
        [txId, payment.id, `RFND-${Date.now().toString(36).toUpperCase()}`, payment.amount, now]
      );
    } else {
      const p = memoryDb.payments.find((pm) => pm.id === payment.id);
      if (p) {
        p.status = 'REFUNDED';
        p.last_modified_date = now;
      }

      memoryDb.payment_transactions.push({
        id: txId,
        payment_id: payment.id,
        external_transaction_id: `RFND-${Date.now().toString(36).toUpperCase()}`,
        transaction_type: 'REFUND',
        amount: payment.amount,
        status: 'SUCCESS',
        failure_reason: null,
        created_date: now,
        last_modified_date: now,
      });
    }

    return this.getPaymentByOrderId(orderId);
  }

  async getAllPayments(filters: any = {}): Promise<PaymentDto[]> {
    if (isPostgres()) {
      let query = 'SELECT * FROM payments';
      const params: any[] = [];
      if (filters.status) {
        query += ' WHERE status = $1';
        params.push(filters.status);
      }
      query += ' ORDER BY created_date DESC';
      const res = await db.query(query, params);
      return Promise.all(res.rows.map((r: any) => this.enrichPayment(r)));
    }

    let list = memoryDb.payments;
    if (filters.status) {
      list = list.filter((p) => p.status === filters.status);
    }
    return Promise.all(list.map((p) => this.enrichPayment(p)));
  }

  async getTransactions(paymentId?: string, type?: string, status?: string) {
    if (isPostgres()) {
      const conditions: string[] = [];
      const params: any[] = [];
      let idx = 1;

      if (paymentId) {
        conditions.push(`payment_id = $${idx++}`);
        params.push(paymentId);
      }
      if (type) {
        conditions.push(`transaction_type = $${idx++}`);
        params.push(type);
      }
      if (status) {
        conditions.push(`status = $${idx++}`);
        params.push(status);
      }

      const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      const res = await db.query(`SELECT * FROM payment_transactions ${where} ORDER BY created_date DESC`, params);
      return res.rows.map((r: any) => ({
        id: r.id,
        paymentId: r.payment_id,
        externalTransactionId: r.external_transaction_id,
        transactionType: r.transaction_type,
        amount: parseFloat(r.amount),
        status: r.status,
        failureReason: r.failure_reason,
        createdDate: r.created_date,
      }));
    }

    let list = memoryDb.payment_transactions;
    if (paymentId) list = list.filter((t) => t.payment_id === paymentId);
    if (type) list = list.filter((t) => t.transaction_type === type);
    if (status) list = list.filter((t) => t.status === status);

    return list.map((t) => ({
      id: t.id,
      paymentId: t.payment_id,
      externalTransactionId: t.external_transaction_id,
      transactionType: t.transaction_type,
      amount: t.amount,
      status: t.status,
      failureReason: t.failure_reason,
      createdDate: t.created_date,
    }));
  }

  private async enrichPayment(row: any): Promise<PaymentDto> {
    const transactions = await this.getTransactions(row.id);
    return {
      id: row.id,
      orderId: row.order_id,
      amount: typeof row.amount === 'string' ? parseFloat(row.amount) : row.amount,
      currency: row.currency,
      provider: row.provider,
      status: row.status,
      createdDate: row.created_date,
      lastModifiedDate: row.last_modified_date,
      transactions,
    };
  }
}

export const paymentService = new PaymentService();
