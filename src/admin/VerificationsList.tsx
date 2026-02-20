import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import type { VerificationRecord } from '../types/verification.types';
import Layout from '../components/Layout/Layout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import ErrorMessage from '../components/common/ErrorMessage';
import './Admin.css';

type VerificationsResponse =
  | VerificationRecord[]
  | { data?: unknown; items?: unknown; verifications?: unknown };

const responseKeys = ['data', 'items', 'verifications'] as const;

function normalizeVerifications(payload: VerificationsResponse): VerificationRecord[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  for (const key of responseKeys) {
    const value = payload[key];
    if (Array.isArray(value)) {
      return value as VerificationRecord[];
    }
  }

  return [];
}

function getValue(record: VerificationRecord, keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (value !== null && value !== undefined && value !== '') {
      return String(value);
    }
  }

  return '—';
}

function formatDate(value: string): string {
  if (!value || value === '—') {
    return '—';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function toPayloadPreview(record: VerificationRecord): string {
  const serialized = JSON.stringify(record);
  return serialized.length > 140 ? `${serialized.slice(0, 140)}...` : serialized;
}

export default function VerificationsList() {
  const [verifications, setVerifications] = useState<VerificationRecord[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingAll, setDeletingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchVerifications = async () => {
    setLoading(true);
    setError(null);

    let mounted = true;

    try {
      const response = await axios.get<VerificationsResponse>(`${API_BASE_URL}/auth/verifications`);
      if (mounted) {
        setVerifications(normalizeVerifications(response.data));
      }
    } catch (err: unknown) {
      if (mounted) {
        const axiosError = err as {
          response?: { data?: { message?: string } };
          message?: string;
        };
        setError(
          axiosError.response?.data?.message ||
          axiosError.message ||
          'Failed to load auth verifications'
        );
        setVerifications([]);
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

  useEffect(() => {
    let mounted = true;
    setError(null);
    setLoading(true);

    axios
      .get<VerificationsResponse>(`${API_BASE_URL}/auth/verifications`)
      .then((response) => {
        if (mounted) {
          setVerifications(normalizeVerifications(response.data));
        }
      })
      .catch((err: unknown) => {
        if (mounted) {
          const axiosError = err as {
            response?: { data?: { message?: string } };
            message?: string;
          };
          setError(
            axiosError.response?.data?.message ||
            axiosError.message ||
            'Failed to load auth verifications'
          );
          setVerifications([]);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleDeleteAll = async () => {
    if (!window.confirm('Delete all verifications? This action cannot be undone.')) {
      return;
    }

    setDeletingAll(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await axios.delete(`${API_BASE_URL}/auth/verifications`);
      await fetchVerifications();
      setSuccessMessage('All verifications were deleted successfully.');
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setError(
        axiosError.response?.data?.message ||
        axiosError.message ||
        'Failed to delete all verifications'
      );
    } finally {
      setDeletingAll(false);
    }
  };

  const totalCount = useMemo(() => verifications?.length ?? 0, [verifications]);

  return (
    <Layout title="Auth Verifications">
      <div className="admin-container">
        <div className="card" style={{ padding: 'var(--spacing-lg)' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 'var(--spacing-md)',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <h2 style={{ marginBottom: 'var(--spacing-xs)' }}>All Verifications</h2>
              <p style={{ margin: 0, color: 'var(--gray-600)' }}>
                Total records: {totalCount}
              </p>
            </div>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDeleteAll}
              disabled={deletingAll || loading || totalCount === 0}
            >
              {deletingAll ? 'Deleting...' : 'Delete All Verifications'}
            </button>
          </div>
        </div>

        {successMessage && (
          <div className="alert alert-success">
            <span>{successMessage}</span>
          </div>
        )}

        {error && !loading && <ErrorMessage message={error} />}

        {loading && <LoadingSpinner size="large" />}

        {!loading && verifications && verifications.length === 0 && (
          <EmptyState title="No verifications found" />
        )}

        {!loading && verifications && verifications.length > 0 && (
          <div className="card">
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>User ID</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Created At</th>
                    <th>Payload</th>
                  </tr>
                </thead>
                <tbody>
                  {verifications.map((verification, index) => {
                    const id = getValue(verification, ['id', '_id', 'verificationId']);
                    const userId = getValue(verification, ['userId', 'user_id', 'customerId']);
                    const type = getValue(verification, ['type', 'eventType', 'verificationType']);
                    const status = getValue(verification, ['status', 'state', 'result']);
                    const createdAtRaw = getValue(verification, [
                      'createdAt',
                      'created_at',
                      'timestamp',
                      'verifiedAt',
                    ]);

                    return (
                      <tr key={`${id}-${index}`}>
                        <td>{id}</td>
                        <td>{userId}</td>
                        <td>{type}</td>
                        <td>{status}</td>
                        <td>{formatDate(createdAtRaw)}</td>
                        <td>
                          <code style={{ fontSize: '0.75rem', color: 'var(--gray-700)' }}>
                            {toPayloadPreview(verification)}
                          </code>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
