import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@supabase/auth-helpers-react";
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
import { User, Settings, Store, Shield, FileText, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  const { toast } = useToast();
  const navigate = useNavigate();
  const session = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stores, setStores] = useState<StoreConfig[]>([]);

  const user = session?.user;
  const userEmail = user?.email || "";
  const displayName = profile?.display_name || user?.user_metadata?.display_name || "User";
  const initials = displayName.charAt(0).toUpperCase();

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchStores();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }
      
      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchStores = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await (supabase as any)
        .from('store_configurations')
        .select('id, store_name, platform, is_active')
        .eq('user_id', user.id)
        .eq('is_active', true);
      
      if (error) {
        console.error('Error fetching stores:', error);
        return;
      }
      
      setStores((data as any) || []);
    } catch (error) {
      console.error('Error fetching stores:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });
      
      navigate("/");
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error signing out",
        description: "There was a problem signing you out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src="" alt={displayName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {userEmail}
            </p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Connected Stores ({stores.length})
        </DropdownMenuLabel>
        
        {stores.length === 0 ? (
          <DropdownMenuItem disabled>
            <Store className="mr-2 h-4 w-4" />
            No stores connected
          </DropdownMenuItem>
        ) : (
          stores.map((store) => (
            <DropdownMenuItem key={store.id}>
              <Store className="mr-2 h-4 w-4" />
              <div className="flex flex-col">
                <span className="text-sm">{store.store_name}</span>
                <span className="text-xs text-muted-foreground">{store.platform}</span>
              </div>
              <Badge variant="secondary" className="ml-auto">
                Active
              </Badge>
            </DropdownMenuItem>
          ))
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => navigate('/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => navigate('/logs')}>
          <FileText className="mr-2 h-4 w-4" />
          <span>System Logs</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => navigate('/about')}>
          <User className="mr-2 h-4 w-4" />
          <span>About Us</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => navigate('/privacy-policy')}>
          <Shield className="mr-2 h-4 w-4" />
          <span>Privacy Policy</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}