import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Search, RefreshCw } from "lucide-react";
import { format } from "date-fns";

interface AdminLog {
  id: string;
  category: string;
  level: string;
  message: string;
  details: any;
  timestamp: string;
  created_at: string;
  user_id: string;
}

export const SystemLogs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();

  const { data: logs, isLoading, refetch } = useQuery({
    queryKey: ["admin-logs", searchTerm, actionFilter, dateFrom, dateTo],
    queryFn: async () => {
      let query = supabase
        .from("admin_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (searchTerm) {
        query = query.or(`category.ilike.%${searchTerm}%,message.ilike.%${searchTerm}%`);
      }

      if (actionFilter !== "all") {
        query = query.eq("level", actionFilter);
      }

      if (dateFrom) {
        query = query.gte("created_at", dateFrom.toISOString());
      }

      if (dateTo) {
        query = query.lte("created_at", dateTo.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as AdminLog[];
    }
  });

  const getBadgeVariant = (level: string) => {
    switch (level.toLowerCase()) {
      case "error":
        return "destructive";
      case "warning":
        return "secondary";
      case "info":
        return "default";
      case "debug":
        return "outline";
      default:
        return "outline";
    }
  };

  const formatJsonData = (data: any) => {
    if (!data) return "—";
    return JSON.stringify(data, null, 2);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>System Logs</CardTitle>
            <CardDescription>View all admin actions and system events</CardDescription>
          </div>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-4 mt-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="debug">Debug</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-48">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFrom ? format(dateFrom, "PPP") : "From date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateFrom}
                onSelect={setDateFrom}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-48">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateTo ? format(dateTo, "PPP") : "To date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateTo}
                onSelect={setDateTo}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div>Loading logs...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs?.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-sm bg-muted px-1 py-0.5 rounded">
                      {log.user_id.substring(0, 8)}...
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(log.level)}>
                      {log.level}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{log.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate">
                      {log.message}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      {log.details && (
                        <details className="text-xs">
                          <summary className="cursor-pointer text-primary hover:underline">
                            View Details
                          </summary>
                          <pre className="mt-2 bg-muted p-2 rounded text-xs overflow-auto max-h-32">
                            {formatJsonData(log.details)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};