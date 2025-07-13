import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, LogOut, Settings, Store } from "lucide-react";

interface Profile {
  display_name: string | null;
  company_name: string | null;
  avatar_url: string | null;
}

interface StoreConfig {
  id: string;
  store_name: string;
  platform: string;
  is_active: boolean;
}

export function UserMenu() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stores, setStores] = useState<StoreConfig[]>([]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchStores();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('display_name, company_name, avatar_url')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error);
    } else {
      setProfile(data);
    }
  };

  const fetchStores = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('store_configurations')
      .select('id, store_name, platform, is_active')
      .eq('user_id', user.id)
      .order('store_name');

    if (error) {
      console.error('Error fetching stores:', error);
    } else {
      setStores(data || []);
    }
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    }
  };

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'User';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatar_url || ''} alt={displayName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
            {profile?.company_name && (
              <p className="text-xs leading-none text-muted-foreground">
                {profile.company_name}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Connected Stores ({stores.filter(s => s.is_active).length})
        </DropdownMenuLabel>
        
        {stores.length > 0 ? (
          stores.map((store) => (
            <DropdownMenuItem key={store.id} className="flex items-center justify-between">
              <div className="flex items-center">
                <Store className="mr-2 h-4 w-4" />
                <span className="text-sm">{store.store_name}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Badge 
                  variant={store.is_active ? "default" : "secondary"}
                  className="text-xs"
                >
                  {store.platform}
                </Badge>
                {store.is_active && (
                  <div className="h-2 w-2 bg-green-500 rounded-full" />
                )}
              </div>
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled>
            <Store className="mr-2 h-4 w-4" />
            No stores connected
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}