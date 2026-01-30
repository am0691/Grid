/**
 * Migration Modal Component
 * localStorage 데이터를 Supabase로 마이그레이션하는 UI
 */

import React, { useState } from 'react';
import {
  migrateLocalStorageToSupabase,
  isMigrationNeeded,
  backupLocalStorage,
  clearLocalStorageData,
} from '@/utils/migration';

interface MigrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const MigrationModal: React.FC<MigrationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [_isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'info' | 'migrating' | 'success' | 'error'>('info');
  const [message, setMessage] = useState('');
  const [details, setDetails] = useState<{ soulsCount: number; progressCount: number } | null>(null);

  if (!isOpen) return null;

  const handleBackup = () => {
    const backed = backupLocalStorage();
    if (backed) {
      alert('Backup downloaded successfully!');
    } else {
      alert('No data to backup or backup failed.');
    }
  };

  const handleMigrate = async () => {
    setIsLoading(true);
    setStep('migrating');

    try {
      const result = await migrateLocalStorageToSupabase();

      if (result.success) {
        setStep('success');
        setMessage(result.message);
        setDetails(result.details || null);
        onSuccess?.();
      } else {
        setStep('error');
        setMessage(result.message);
      }
    } catch (error) {
      setStep('error');
      setMessage(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearLocalStorage = () => {
    clearLocalStorageData();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        {/* Info Step */}
        {step === 'info' && (
          <>
            <h2 className="text-2xl font-bold mb-4">데이터 마이그레이션</h2>
            <p className="text-gray-600 mb-4">
              localStorage에 저장된 기존 데이터를 Supabase 클라우드로 마이그레이션합니다.
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
              <h3 className="font-semibold text-yellow-800 mb-2">주의사항</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• 마이그레이션 전에 데이터를 백업하는 것을 권장합니다</li>
                <li>• 인터넷 연결이 필요합니다</li>
                <li>• 마이그레이션 중에는 창을 닫지 마세요</li>
              </ul>
            </div>

            <div className="flex gap-2 mb-4">
              <button
                onClick={handleBackup}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
              >
                백업 다운로드
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
              >
                취소
              </button>
              <button
                onClick={handleMigrate}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                마이그레이션 시작
              </button>
            </div>
          </>
        )}

        {/* Migrating Step */}
        {step === 'migrating' && (
          <>
            <h2 className="text-2xl font-bold mb-4">마이그레이션 중...</h2>
            <div className="flex flex-col items-center py-8">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">데이터를 마이그레이션하고 있습니다. 잠시만 기다려주세요...</p>
            </div>
          </>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <>
            <div className="text-center">
              <div className="mb-4">
                <svg
                  className="mx-auto h-16 w-16 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2 text-green-600">마이그레이션 완료!</h2>
              <p className="text-gray-600 mb-4">{message}</p>

              {details && (
                <div className="bg-green-50 border border-green-200 rounded p-4 mb-4">
                  <p className="text-sm text-green-700">
                    영혼: {details.soulsCount}명<br />
                    진도 데이터: {details.progressCount}개
                  </p>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
                <p className="text-sm text-blue-700">
                  마이그레이션이 완료되었습니다. 이제 localStorage 데이터를 삭제할 수 있습니다.
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleClearLocalStorage}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                localStorage 초기화
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                완료
              </button>
            </div>
          </>
        )}

        {/* Error Step */}
        {step === 'error' && (
          <>
            <div className="text-center">
              <div className="mb-4">
                <svg
                  className="mx-auto h-16 w-16 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2 text-red-600">마이그레이션 실패</h2>
              <p className="text-gray-600 mb-4">{message}</p>

              <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
                <p className="text-sm text-red-700">
                  문제가 발생했습니다. 인터넷 연결을 확인하고 다시 시도해주세요.
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setStep('info')}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
              >
                다시 시도
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                닫기
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/**
 * 마이그레이션 필요 여부를 확인하고 자동으로 모달을 표시하는 훅
 */
export const useMigrationCheck = () => {
  const [showModal, setShowModal] = React.useState(false);

  React.useEffect(() => {
    if (isMigrationNeeded()) {
      setShowModal(true);
    }
  }, []);

  return {
    showModal,
    setShowModal,
  };
};
