'use client';

import { useActiveUsers, useIsConnected } from '@/src/entities/spreadsheet';
import { cn } from '@/lib/utils';

export function ActiveUsersPanel() {
  const activeUsers = useActiveUsers();
  const isConnected = useIsConnected();

  return (
    <div className="flex items-center gap-4">
      {/* Connection status */}
      <div className="flex items-center gap-2">
        <div
          className={cn(
            'w-2 h-2 rounded-full',
            isConnected ? 'bg-green-500' : 'bg-red-500'
          )}
        />
        <span className="text-sm text-gray-600">
          {isConnected ? '연결됨' : '연결 끊김'}
        </span>
      </div>

      {/* Active users */}
      {activeUsers.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">참여자:</span>
          <div className="flex -space-x-2">
            {activeUsers.slice(0, 5).map((user) => (
              <div
                key={user.userId}
                className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-medium"
                style={{ backgroundColor: user.color }}
                title={user.userName}
              >
                {user.userName.charAt(0).toUpperCase()}
              </div>
            ))}
            {activeUsers.length > 5 && (
              <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-400 flex items-center justify-center text-white text-xs font-medium">
                +{activeUsers.length - 5}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
