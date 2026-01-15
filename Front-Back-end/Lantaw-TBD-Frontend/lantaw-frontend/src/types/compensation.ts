export interface Compensation {
    id: number;
    type: "SALARY" | "HONORARIA";
    budget_item: number;
    budget_item_name: string | null;
    personnel: number;
    personnel_first_name: string;
    personnel_last_name: string;
    reason: string;
    amount: string | null;
    date_effective: string;
    date_modified: string;
}

export interface CompensationCreateData {
    type: "SALARY" | "HONORARIA";
    budget_item: number | null;    
    personnel: number;     
    reason: string | null;
    amount: string;
    date_effective: string;
}