import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
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
import { User, Settings, Store, Shield, FileText } from "lucide-react";
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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stores, setStores] = useState<StoreConfig[]>([]);

  const userEmail = "user@example.com";
  const displayName = "User";
  const initials = "U";

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
          Connected Stores (0)
        </DropdownMenuLabel>
        
        <DropdownMenuItem disabled>
          <Store className="mr-2 h-4 w-4" />
          No stores connected
        </DropdownMenuItem>
        
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}