// Main orchestrator component for history log management.

import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { historyLogApi } from "../services/historyLogApi";
import { Card, CardContent } from "../../../components/common/card";
import { Pagination } from "../../../components/common/pagination";
import { formatDateTime } from "../../../utils/formatHelpers";
import type { HistoryLog, HistoryLogFilters } from "../../../types/historyLog";
import { HistoryLogDetailModal } from "./HistoryLogDetailModal";

export const HistoryLogLayout: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";

  // State
  const [historyEntries, setHistoryEntries] = useState<HistoryLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<HistoryLog | null>(null);
  const [filters, setFilters] = useState<HistoryLogFilters>({});
  
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

  // Pagination calculations
  const totalPages = Math.ceil(historyEntries.length / pageSize);
  const paginatedEntries = historyEntries.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Handle page size change
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    const newTotalPages = Math.ceil(historyEntries.length / newPageSize);
    if (currentPage > newTotalPages) {
      setCurrentPage(newTotalPages > 0 ? newTotalPages : 1);
    }
  };

  // Get action display name
  const getActionDisplayName = (action: HistoryLog['action']) => {
    switch (action) {
      case 'CREATE':
        return 'Create';
      case 'UPDATE':
        return 'Update';
      case 'DELETE':
        return 'Delete';
      case 'REVERT':
        return 'Revert';
      default:
        return action;
    }
  };

  // Get change type display name
  const getChangeTypeDisplayName = (changeType: HistoryLog['change_type']) => {
    switch (changeType) {
      case 'ACTIVITY':
        return 'Activity';
      case 'OBJECTIVE':
        return 'Objective';
      case 'PERSONNEL':
        return 'Personnel';
      case 'BUDGET':
        return 'Budget';
      case 'COMPENSATION':
        return 'Compensation';
      case 'PROJECT':
        return 'Project';
      case 'ROLE':
        return 'Role';
      case 'DEPARTMENT':
        return 'Department';
      default:
        return changeType;
    }
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">History Log</h1>
        <div className="flex items-center gap-2">
          <select
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        </div>
      </div>

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
          {historyEntries.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-sm text-muted-foreground">No history entries found.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardContent className="p-0">
                  <div className="rounded-md border bg-card overflow-hidden">
                    <table className="w-full">
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
                            <td className="px-4 py-3 text-sm">{entry.user_name || 'Unknown'}</td>
                            <td className="px-4 py-3 text-sm">
                              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                                {getActionDisplayName(entry.action)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">{entry.project_name || 'Unknown'}</td>
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

