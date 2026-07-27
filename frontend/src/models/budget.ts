export interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
}

export interface Category {
  id: string;
  name: string;
  expenses: ExpenseItem[];
}

export interface Contributor {
  id: string;
  name: string;
  paidAmount: number;
}

export interface TripBudget {
  id: string;
  tripName: string;
  peopleCount: number;
  categories: Category[];
  contributors: Contributor[];
}

export const BAR_COLORS = [
  "#0d6efd",
  "#198754",
  "#dc3545",
  "#fd7e14",
  "#6f42c1",
  "#20c997",
];
