import initialData from '../data/budget-data.json';
import type {
  Budget,
  BudgetData,
  Category,
  NewCategory,
  NewTransaction,
  Transaction,
} from '../types';

const STORAGE_KEY = 'budget-tracker-data';
const API_DELAY_MS = 500;

function waitForApi(): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, API_DELAY_MS);
  });
}

function readStoredData(): BudgetData {
  const savedData = localStorage.getItem(STORAGE_KEY);

  if (savedData === null) {
    return JSON.parse(JSON.stringify(initialData)) as BudgetData;
  }

  return JSON.parse(savedData) as BudgetData;
}

function saveStoredData(data: BudgetData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function shouldFailLoading(): boolean {
  return new URLSearchParams(window.location.search).get('fail') === '1';
}

async function loadData(): Promise<BudgetData> {
  await waitForApi();

  if (shouldFailLoading()) {
    throw new Error('Učitavanje podataka nije uspelo.');
  }

  return readStoredData();
}

export async function getBudgetData(): Promise<BudgetData> {
  return loadData();
}

export async function getTransactions(): Promise<Transaction[]> {
  const data = await loadData();
  return data.transactions;
}


export async function createTransaction(
  newTransactionData: NewTransaction
): Promise<Transaction> {
  await waitForApi();

  const data = readStoredData();

  const nextId =
    data.transactions.reduce(
      (highestId, transaction) =>
        Math.max(highestId, transaction.id),
      0
    ) + 1;

  const createdTransaction: Transaction = {
    ...newTransactionData,
    id: nextId,
  };

  data.transactions = [
    ...data.transactions,
    createdTransaction,
  ];

  saveStoredData(data);

  return createdTransaction;
}


export async function updateTransaction(
  updatedTransaction: Transaction
): Promise<Transaction> {
  await waitForApi();

  const data = readStoredData();

  const exists = data.transactions.some(
    (transaction) => transaction.id === updatedTransaction.id
  );

  if (!exists) {
    throw new Error('Transakcija nije pronađena.');
  }

  data.transactions = data.transactions.map((transaction) =>
    transaction.id === updatedTransaction.id
      ? updatedTransaction
      : transaction
  );

  saveStoredData(data);

  return updatedTransaction;
}

export async function deleteTransaction(
  transactionId: number
): Promise<void> {
  await waitForApi();

  const data = readStoredData();

  data.transactions = data.transactions.filter(
    (transaction) => transaction.id !== transactionId
  );

  saveStoredData(data);
}

export async function resetBudgetData(): Promise<void> {
  await waitForApi();

  localStorage.removeItem(STORAGE_KEY);
}
export async function saveBudget(
  month: string,
  categoryId: number,
  amount: string
): Promise<Budget> {
  await waitForApi();

  const data = readStoredData();

  const savedBudget: Budget = {
    month,
    category_id: categoryId,
    amount,
  };

  data.budgets = [
    ...data.budgets.filter(
      (budget) =>
        !(
          budget.month === month &&
          budget.category_id === categoryId
        )
    ),
    savedBudget,
  ];

  saveStoredData(data);

  return savedBudget;
}

export async function deleteBudget(
  month: string,
  categoryId: number
): Promise<void> {
  await waitForApi();

  const data = readStoredData();

  data.budgets = data.budgets.filter(
    (budget) =>
      !(
        budget.month === month &&
        budget.category_id === categoryId
      )
  );

  saveStoredData(data);
}
export async function createCategory(
  newCategoryData: NewCategory
): Promise<Category> {
  await waitForApi();

  const data = readStoredData();

  const cleanName = newCategoryData.name.trim();

  if (cleanName.length === 0 || cleanName.length > 30) {
    throw new Error(
      'Naziv kategorije mora imati između 1 i 30 karaktera.'
    );
  }

  const nameAlreadyExists = data.categories.some(
    (category) =>
      category.name.toLowerCase() === cleanName.toLowerCase()
  );

  if (nameAlreadyExists) {
    throw new Error('Kategorija sa tim nazivom već postoji.');
  }

  const nextId =
    data.categories.reduce(
      (highestId, category) =>
        Math.max(highestId, category.id),
      0
    ) + 1;

  const createdCategory: Category = {
    ...newCategoryData,
    name: cleanName,
    id: nextId,
  };

  data.categories = [
    ...data.categories,
    createdCategory,
  ];

  saveStoredData(data);

  return createdCategory;
}

export async function updateCategory(
  updatedCategory: Category
): Promise<Category> {
  await waitForApi();

  const data = readStoredData();

  const categoryExists = data.categories.some(
    (category) => category.id === updatedCategory.id
  );

  if (!categoryExists) {
    throw new Error('Kategorija nije pronađena.');
  }

  const cleanName = updatedCategory.name.trim();

  if (cleanName.length === 0 || cleanName.length > 30) {
    throw new Error(
      'Naziv kategorije mora imati između 1 i 30 karaktera.'
    );
  }

  const nameAlreadyExists = data.categories.some(
    (category) =>
      category.id !== updatedCategory.id &&
      category.name.toLowerCase() === cleanName.toLowerCase()
  );

  if (nameAlreadyExists) {
    throw new Error('Kategorija sa tim nazivom već postoji.');
  }

  const savedCategory: Category = {
    ...updatedCategory,
    name: cleanName,
  };

  data.categories = data.categories.map((category) =>
    category.id === savedCategory.id
      ? savedCategory
      : category
  );

  saveStoredData(data);

  return savedCategory;
}

export async function deleteCategory(
  categoryId: number
): Promise<void> {
  await waitForApi();

  const data = readStoredData();

  const categoryExists = data.categories.some(
    (category) => category.id === categoryId
  );

  if (!categoryExists) {
    throw new Error('Kategorija nije pronađena.');
  }

  const hasTransactions = data.transactions.some(
    (transaction) => transaction.category_id === categoryId
  );

  if (hasTransactions) {
    throw new Error(
      'Ova kategorija ne može biti obrisana jer sadrži transakcije.'
    );
  }

  data.categories = data.categories.filter(
    (category) => category.id !== categoryId
  );

  data.budgets = data.budgets.filter(
    (budget) => budget.category_id !== categoryId
  );

  saveStoredData(data);
}