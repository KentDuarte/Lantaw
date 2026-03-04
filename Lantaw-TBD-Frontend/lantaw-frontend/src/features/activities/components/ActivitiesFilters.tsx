// Handles all search and filter controls for activities.

import React from "react";
import { Card, CardContent } from "../../../components/common/card";
import { Input } from "../../../components/common/input";
import { Button } from "../../../components/common/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/common/select";
import { Search, Filter, X } from "lucide-react";
import type { UseActivityFiltersReturn } from "../hooks/useActivityFilters";

interface ActivitiesFiltersProps {
  filters: UseActivityFiltersReturn;
}

export const ActivitiesFilters: React.FC<ActivitiesFiltersProps> = ({
  filters,
}) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search activities..."
              value={filters.filters.searchQuery}
              onChange={(e) => filters.setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 items-center">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select
              value={filters.filters.categoryFilter}
              onValueChange={filters.setCategoryFilter}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="PS">Personnel Services</SelectItem>
                <SelectItem value="MOOE">MOOE</SelectItem>
                <SelectItem value="CO">Capital Outlay</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.filters.statusFilter}
              onValueChange={filters.setStatusFilter}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.filters.expenseFilter}
              onValueChange={filters.setExpenseFilter}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Expense" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Expenses</SelectItem>
                <SelectItem value="under">Under Budget</SelectItem>
                <SelectItem value="over">Over Budget</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={filters.clearFilters}
              className="text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
