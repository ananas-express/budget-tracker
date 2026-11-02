export type TransactionType = 'income' | 'expense';

export type Transaction = {
    id: number;
    type: TransactionType;
    amount: string;
    date: string;
    description: string | null;
    category_id: number;
};

export type NewTransaction = Omit<Transaction, 'id'>;

export type Category = {
  id: number;
  name: string;
  color: string;
};
export type NewCategory = Omit<Category, 'id'>;

export type Budget = {
  month: string;
  category_id: number;
  amount: string;
};

export type BudgetData = {
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
};