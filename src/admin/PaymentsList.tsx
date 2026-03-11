/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import type { Payment } from '../types/payment.types';
import Layout from '../components/Layout/Layout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import ErrorMessage from '../components/common/ErrorMessage';
import './Admin.css';

export default function PaymentsList() {
  const [payments, setPayments] = useState<Payment[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  // Fetch all payments for a specific user
  const fetchUserPayments = async (userId: string) => {
    if (!userId.trim()) {
      setError('Пожалуйста, введите ID пользователя');
      return;
    }

    setLoading(true);
    setError(null);
    let mounted = true;

    try {
      const response = await axios.get<Payment[]>(
        `${API_BASE_URL}/payments/my-payments/${userId}`
      );
      if (mounted) {
        setPayments(response.data);
      }
    } catch (err: any) {
      if (mounted) {
        setError(
          err.response?.data?.message ||
          err.message ||
          'Не удалось загрузить платежи'
        );
      }
    } finally {
      if (mounted) {
        setLoading(false);
      }
    }

    return () => {
      mounted = false;
    };
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUserPayments(selectedUserId);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'succeeded':
        return 'badge badge-success';
      case 'pending':
        return 'badge badge-info';
      case 'canceled':
        return 'badge badge-inactive';
      default:
        return 'badge badge-neutral';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (amount: number, currency: string) => {
    return `${amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
  };

  return (
    <Layout title="Платежи пользователя">
      <div className="admin-container">
        {/* Search Form */}
        <div className="card">
          <h2>Поиск платежей пользователя</h2>
          <form onSubmit={handleSearch} style={{ marginTop: 'var(--spacing-lg)' }}>
            <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label htmlFor="userId" style={{ display: 'block', marginBottom: 'var(--spacing-xs)', color: 'var(--gray-700)', fontSize: '0.875rem', fontWeight: 500 }}>
                  ID пользователя
                </label>
                <input
                  id="userId"
                  type="text"
                  className="form-input"
                  placeholder="Введите ID пользователя (UUID)"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Поиск...' : 'Найти'}
              </button>
            </div>
          </form>
        </div>

        {/* Error Display */}
        {error && !loading && (
          <ErrorMessage message={error} />
        )}

        {/* Loading State */}
        {loading && selectedUserId && (
          <LoadingSpinner size="large" />
        )}

        {/* Empty State */}
        {!loading && payments && payments.length === 0 && (
          <EmptyState 
            title="Платежи для этого пользователя не найдены"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
              </svg>
            }
          />
        )}

        {/* Payments Table */}
        {!loading && payments && payments.length > 0 && (
          <div className="card">
            <h2>
              История платежей
              <span style={{ marginLeft: 'var(--spacing-sm)', color: 'var(--gray-500)', fontWeight: 'normal', fontSize: '1rem' }}>
                ({payments.length})
              </span>
            </h2>
            
            <div className="table-container" style={{ marginTop: 'var(--spacing-lg)' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Дата</th>
                    <th>YooKassa ID</th>
                    <th>Сумма</th>
                    <th>Статус</th>
                    <th>Описание</th>
                    <th>Подписка</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td>{formatDate(payment.createdAt)}</td>
                      <td>
                        <code style={{ fontSize: '0.75rem', color: 'var(--gray-700)' }}>
                          {payment.yookassaPaymentId}
                        </code>
                      </td>
                      <td style={{ fontWeight: 500 }}>
                        {formatAmount(payment.amount, payment.currency)}
                      </td>
                      <td>
                        <span className={getStatusBadgeClass(payment.status)}>
                          {payment.status}
                        </span>
                      </td>
                      <td>{payment.description}</td>
                      <td>
                        {payment.subscriptionId ? (
                          <code style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>
                            {payment.subscriptionId.slice(0, 8)}...
                          </code>
                        ) : (
                          <span style={{ color: 'var(--gray-400)' }}>—</span>
                        )}
                      </td>
                      <td className="actions-column">
                        {payment.confirmationUrl && payment.status === 'pending' && (
                          <a
                            href={payment.confirmationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-primary"
                          >
                            Оплатить
                          </a>
                        )}
                        {payment.status === 'succeeded' && (
                          <span style={{ color: 'var(--success-color)', fontSize: '0.875rem' }}>
                            ✓ Оплачено
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary Card */}
            <div style={{ 
              marginTop: 'var(--spacing-xl)', 
              padding: 'var(--spacing-lg)', 
              background: 'var(--gray-50)', 
              borderRadius: 'var(--radius-md)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--spacing-lg)'
            }}>
              <div>
                <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: 'var(--spacing-xs)' }}>
                  Всего платежей
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--gray-900)' }}>
                  {payments.length}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: 'var(--spacing-xs)' }}>
                  Общая сумма
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--gray-900)' }}>
                  {formatAmount(
                    payments.reduce((sum, p) => sum + Number(p.amount), 0),
                    payments[0]?.currency || 'RUB'
                  )}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: 'var(--spacing-xs)' }}>
                  Успешно
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--success-color)' }}>
                  {payments.filter(p => p.status === 'succeeded').length}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: 'var(--spacing-xs)' }}>
                  В ожидании
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--info-color)' }}>
                  {payments.filter(p => p.status === 'pending').length}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
