// Main orchestrator component for history log management.

import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { historyLogApi } from "../services/historyLogApi";
import api from "../../../api/client";
import { Card, CardContent } from "../../../components/common/card";
import { Pagination } from "../../../components/common/pagination";
import { Button } from "../../../components/common/button";
import { Input } from "../../../components/common/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/common/select";
import { X, Search } from "lucide-react";
import { formatDateTime } from "../../../utils/formatHelpers";
import type { HistoryLog, HistoryLogFilters } from "../../../types/historyLog";
import { HistoryLogDetailModal } from "./HistoryLogDetailModal";
import { HistoryLogCard } from "./HistoryLogCard";

interface UserOption {
  id: number;
  first_name?: string;
  last_name?: string;
  email?: string;
}

export const HistoryLogLayout: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";

  // State
  const [historyEntries, setHistoryEntries] = useState<HistoryLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<HistoryLog | null>(null);
  const [filters, setFilters] = useState<HistoryLogFilters>({});
  const [projectSearch, setProjectSearch] = useState("");
  const [users, setUsers] = useState<UserOption[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Fetch history entries
  useEffect(() => {
    const fetchHistoryEntries = async () => {
      setLoading(true);
      setError(null);
      try {
        const entries = await historyLogApi.getAll(filters);
        setHistoryEntries(entries);
      } catch (err) {
        console.error("Failed to fetch history entries:", err);
        setError("Failed to load history log entries.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistoryEntries();
    setCurrentPage(1); // Reset to page 1 when filters change
  }, [JSON.stringify(filters)]);

  // Fetch users for filter dropdown (Admin sees all, others may see limited list)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/api/users/");
        const data = Array.isArray(res.data) ? res.data : (res.data?.results ?? []);
        setUsers(data);
      } catch {
        setUsers([]);
      }
    };
    fetchUsers();
  }, []);

  // Handlers
  const handleViewDetails = (entry: HistoryLog) => {
    setSelectedEntry(entry);
  };

  const handleBackToList = () => {
    setSelectedEntry(null);
  };

  const handleRevert = async () => {
    if (!selectedEntry) return;
    try {
      await historyLogApi.revert(selectedEntry.id);
      // Refresh the list
      const entries = await historyLogApi.getAll(filters);
      setHistoryEntries(entries);
      // Close modal
      setSelectedEntry(null);
    } catch (err) {
      console.error("Failed to revert entry:", err);
      throw err;
    }
  };

  // Client-side filter by project name (search bar)
  const filteredByProject = projectSearch.trim()
    ? historyEntries.filter((entry) =>
        (entry.project_name ?? "")
          .toLowerCase()
          .includes(projectSearch.trim().toLowerCase())
      )
    : historyEntries;

  // Pagination calculations
  const totalPages = Math.ceil(filteredByProject.length / pageSize);
  const paginatedEntries = filteredByProject.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getActionDisplayName = (action: HistoryLog["action"]) => {
    switch (action) {
      case "CREATE":
        return "Create";
      case "UPDATE":
        return "Update";
      case "DELETE":
        return "Delete";
      case "REVERT":
        return "Revert";
      default:
        return action;
    }
  };

  const getActionBadgeClass = (action: HistoryLog["action"]) => {
    switch (action) {
      case "CREATE":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "UPDATE":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "DELETE":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "REVERT":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  // Handle page size change
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    const newTotalPages = Math.ceil(filteredByProject.length / newPageSize);
    if (currentPage > newTotalPages) {
      setCurrentPage(newTotalPages > 0 ? newTotalPages : 1);
    }
  };

  const hasActiveFilters =
    filters.action ||
    filters.user ||
    filters.date_from ||
    filters.date_to ||
    filters.project ||
    filters.change_type ||
    projectSearch.trim();

  const clearAllFilters = () => {
    setFilters({});
    setProjectSearch("");
  };

  // Detail modal view
  if (selectedEntry) {
    return (
      <>
        <HistoryLogDetailModal
          historyEntry={selectedEntry}
          isOpen={true}
          onClose={handleBackToList}
          onRevert={isAdmin ? handleRevert : undefined}
        />
      </>
    );
  }

  // List view
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl sm:text-2xl font-bold">History Log</h1>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <select
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="w-full min-w-0 px-3 py-2 border rounded-md text-sm bg-background sm:w-auto"
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 pt-6 sm:p-6">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:flex sm:flex-wrap sm:items-end sm:gap-3 md:gap-4">
              {/* Project search - leftmost */}
              <div className="space-y-1.5 w-full min-w-0 sm:w-52 sm:flex-none">
                <label className="text-sm font-medium">Project</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type="text"
                    placeholder="Search project..."
                    value={projectSearch}
                    onChange={(e) => {
                      setProjectSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full min-w-0 pl-9"
                  />
                </div>
              </div>
              {/* Start date */}
              <div className="space-y-1.5 w-full min-w-0 sm:w-40 sm:flex-none">
                <label className="text-sm font-medium">Start date</label>
                <Input
                  type="date"
                  value={filters.date_from ?? ""}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      date_from: e.target.value || undefined,
                    }))
                  }
                  className="w-full min-w-0"
                />
              </div>
              {/* End date */}
              <div className="space-y-1.5 w-full min-w-0 sm:w-40 sm:flex-none">
                <label className="text-sm font-medium">End date</label>
                <Input
                  type="date"
                  value={filters.date_to ?? ""}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      date_to: e.target.value || undefined,
                    }))
                  }
                  className="w-full min-w-0"
                />
              </div>
              {/* User */}
              <div className="space-y-1.5 w-full min-w-0 sm:w-44 sm:flex-none">
                <label className="text-sm font-medium">User</label>
                <Select
                  value={filters.user?.toString() ?? "all"}
                  onValueChange={(value) =>
                    setFilters((prev) => ({
                      ...prev,
                      user: value === "all" ? undefined : parseInt(value, 10),
                    }))
                  }
                >
                  <SelectTrigger className="w-full min-w-0">
                    <SelectValue placeholder="All users" />
                  </SelectTrigger>
                  <SelectContent className="max-h-80 overflow-y-auto">
                    <SelectItem value="all">All users</SelectItem>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id.toString()}>
                        {[u.first_name, u.last_name].filter(Boolean).join(" ") || u.email || `User ${u.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Action */}
              <div className="space-y-1.5 w-full min-w-0 sm:w-36 sm:flex-none">
                <label className="text-sm font-medium">Action</label>
                <Select
                  value={filters.action || "all"}
                  onValueChange={(value) =>
                    setFilters((prev) => ({
                      ...prev,
                      action: value === "all" ? undefined : (value as HistoryLog["action"]),
                    }))
                  }
                >
                  <SelectTrigger className="w-full min-w-0">
                    <SelectValue placeholder="Action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="CREATE">Create</SelectItem>
                    <SelectItem value="UPDATE">Update</SelectItem>
                    <SelectItem value="DELETE">Delete</SelectItem>
                    <SelectItem value="REVERT">Revert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  className="w-full shrink-0 sm:w-auto"
                >
                  <X className="h-3 w-3 mr-1 shrink-0" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-8">
          <p className="text-sm text-muted-foreground">Loading history entries...</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {filteredByProject.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  {historyEntries.length === 0
                    ? "No history entries found."
                    : "No history entries match the current filters."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Mobile: card list */}
              <div className="space-y-4 sm:hidden">
                {paginatedEntries.map((entry) => (
                  <HistoryLogCard
                    key={entry.id}
                    entry={entry}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>

              {/* Desktop: table */}
              <Card className="hidden sm:block">
                <CardContent className="p-0">
                  <div className="overflow-x-auto rounded-md border bg-card [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb]:bg-muted">
                    <table className="w-full min-w-[600px]">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Date & Time</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Description</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">User</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Action</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Project</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedEntries.map((entry) => (
                          <tr
                            key={entry.id}
                            className="border-t cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => handleViewDetails(entry)}
                          >
                            <td className="px-4 py-3 text-sm">{formatDateTime(entry.timestamp)}</td>
                            <td className="px-4 py-3 text-sm max-w-md truncate">{entry.description}</td>
                            <td className="px-4 py-3 text-sm">{entry.user_name || "Unknown"}</td>
                            <td className="px-4 py-3 text-sm">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getActionBadgeClass(entry.action)}`}
                              >
                                {getActionDisplayName(entry.action)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">{entry.project_name || "Unknown"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredByProject.length}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

