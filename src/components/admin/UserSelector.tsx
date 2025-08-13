import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, User } from 'lucide-react';
import type { AdminUser } from '@/hooks/useAdminUsers';

interface UserSelectorProps {
  users: AdminUser[];
  selectedUserId?: string;
  onSelectUser: (userId: string) => void;
}

export function UserSelector({ users, selectedUserId, onSelectUser }: UserSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedUser = users.find(user => user.id === selectedUserId);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search users by email or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="min-w-[300px]">
          <Select value={selectedUserId} onValueChange={onSelectUser}>
            <SelectTrigger>
              <SelectValue placeholder="Select a user to manage">
                {selectedUser && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{selectedUser.display_name || selectedUser.email}</span>
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {filteredUsers.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {user.display_name || user.email}
                    </span>
                    {user.display_name && (
                      <span className="text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      Plan: {user.subscription?.plan_name || 'Free'} | 
                      Status: {user.subscription?.status || 'None'}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedUser && (
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4" />
            <span className="font-medium">Selected User</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Email:</span> {selectedUser.email}
            </div>
            <div>
              <span className="text-muted-foreground">Name:</span> {selectedUser.display_name || 'Not set'}
            </div>
            <div>
              <span className="text-muted-foreground">Member since:</span> {new Date(selectedUser.created_at).toLocaleDateString()}
            </div>
            <div>
              <span className="text-muted-foreground">Plan:</span> {selectedUser.subscription?.plan_name || 'Free'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}