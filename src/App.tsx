
import { useCallback, useEffect, useState } from 'react';
import FinanceSummary from './components/FinanceSummary';
import BudgetOverview from './components/BudgetOverview';
import BudgetForm from './components/BudgetForm';
import CategoryManager from './components/CategoryManager';
import TransactionForm from './components/TransactionForm';

import {
  createCategory,
  createTransaction,
  deleteBudget,
  deleteCategory,
  deleteTransaction,
  getBudgetData,
  resetBudgetData,
  saveBudget,
  updateCategory,
  updateTransaction,
} from './services/budgetServices';

import type {
  BudgetData,
  Category,
  NewCategory,
  NewTransaction,
  Transaction,
} from './types';

function formatDate(date: string): string {
  const [year, month, day] = date.split('-');

  return `${day}/${month}/${year}`;
}

function getCurrentMonth(): string {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');

  return `${year}-${month}`;
}
function changeMonth(month: string, amount: number): string {
  const [year, monthNumber] = month.split('-').map(Number);

  const date = new Date(year, monthNumber - 1 + amount, 1);

  const newYear = date.getFullYear();
  const newMonth = String(date.getMonth() + 1).padStart(2, '0');

  return `${newYear}-${newMonth}`;
}

function formatMonth(month: string): string {
  const [year, monthNumber] = month.split('-').map(Number);

  const date = new Date(year, monthNumber - 1, 1);

  return new Intl.DateTimeFormat('sr-Latn-RS', {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function getUrlFilters(): {
  month: string | null;
  category: string;
  type: 'all' | 'income' | 'expense';
  search: string;
  sort: 'date' | 'amount-desc' | 'amount-asc';
} {
  const params = new URLSearchParams(window.location.search);

  const month = params.get('month');
  const type = params.get('type');
  const sort = params.get('sort');

  const validMonth =
    month && /^\d{4}-(0[1-9]|1[0-2])$/.test(month)
      ? month
      : null;

  return {
    month: validMonth,
    category: params.get('category') ?? 'all',
    type:
      type === 'income' || type === 'expense'
        ? type
        : 'all',
    search: params.get('search') ?? '',
    sort:
      sort === 'amount-desc' || sort === 'amount-asc'
        ? sort
        : 'date',
  };
}

function App() {
  const [budgetData, setBudgetData] = useState<BudgetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialUrlFilters] = useState(() => getUrlFilters());
  const [selectedMonth, setSelectedMonth] = useState<string>(
  initialUrlFilters.month ?? getCurrentMonth()
);

const [selectedCategory, setSelectedCategory] = useState<string>(
  initialUrlFilters.category
);

const [selectedType, setSelectedType] = useState<
  'all' | 'income' | 'expense'
>(initialUrlFilters.type);

const [searchText, setSearchText] = useState<string>(
  initialUrlFilters.search
);

const [sortOrder, setSortOrder] = useState<
  'date' | 'amount-desc' | 'amount-asc'
>(initialUrlFilters.sort);


  const [editingTransaction, setEditingTransaction] =
  useState<Transaction | null>(null);

  const loadBudgetData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getBudgetData();
      setBudgetData(data);

      const urlFilters = getUrlFilters();

if (!urlFilters.month) {
  const newestTransaction = [...data.transactions].sort(
    (a, b) => b.date.localeCompare(a.date)
  )[0];

  if (newestTransaction) {
    setSelectedMonth(newestTransaction.date.slice(0, 7));
  }
}
    } catch (caughtError: unknown) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Došlo je do nepoznate greške.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBudgetData();
  }, [loadBudgetData]);

  useEffect(() => {
  if (loading || error) {
    return;
  }

  const params = new URLSearchParams();

  params.set('month', selectedMonth);

  if (selectedCategory !== 'all') {
    params.set('category', selectedCategory);
  }

  if (selectedType !== 'all') {
    params.set('type', selectedType);
  }

  if (searchText.trim() !== '') {
    params.set('search', searchText.trim());
  }

  if (sortOrder !== 'date') {
    params.set('sort', sortOrder);
  }

  const newUrl = `${window.location.pathname}?${params.toString()}${window.location.hash}`;

  window.history.replaceState(null, '', newUrl);

}, [
  loading,
  error,
  selectedMonth,
  selectedCategory,
  selectedType,
  searchText,
  sortOrder,
]);


 async function handleCreateTransaction(
  newTransaction: NewTransaction
): Promise<void> {
  const createdTransaction = await createTransaction(newTransaction);

  setBudgetData((currentData) => {
    if (currentData === null) {
      return currentData;
    }

    return {
      ...currentData,
      transactions: [
        ...currentData.transactions,
        createdTransaction,
      ],
    };
  });
}

async function handleUpdateTransaction(
  transactionData: NewTransaction
): Promise<void> {
  if (editingTransaction === null) {
    return;
  }

  const updatedTransaction: Transaction = {
    ...transactionData,
    id: editingTransaction.id,
  };

  const savedTransaction = await updateTransaction(updatedTransaction);

  setBudgetData((currentData) => {
    if (currentData === null) {
      return currentData;
    }

    return {
      ...currentData,
      transactions: currentData.transactions.map((transaction) =>
        transaction.id === savedTransaction.id
          ? savedTransaction
          : transaction
      ),
    };
  });

  setEditingTransaction(null);
}

async function handleSaveBudget(
  categoryId: number,
  amount: string
): Promise<void> {
  if (!budgetData) {
    return;
  }



  const savedBudget = await saveBudget(
    selectedMonth,
    categoryId,
    amount
  );

  setBudgetData((currentData) => {
    if (!currentData) {
      return currentData;
    }

    return {
      ...currentData,
      budgets: [
        ...currentData.budgets.filter(
          (budget) =>
            !(
              budget.month === savedBudget.month &&
              budget.category_id === savedBudget.category_id
            )
        ),
        savedBudget,
      ],
    };
  });
}


async function handleDeleteBudget(
  categoryId: number
): Promise<void> {
  if (!budgetData) {
    return;
  }

  const confirmed = window.confirm(
    'Da li sigurno želiš da obrišeš budžet za ovu kategoriju?'
  );

  if (!confirmed) {
    return;
  }

  try {
    await deleteBudget(selectedMonth, categoryId);

    setBudgetData((currentData) => {
      if (!currentData) {
        return currentData;
      }

      return {
        ...currentData,
        budgets: currentData.budgets.filter(
          (budget) =>
            !(
              budget.month === selectedMonth &&
              budget.category_id === categoryId
            )
        ),
      };
    });
  } catch (error) {
    window.alert(
      error instanceof Error
        ? error.message
        : 'Brisanje budžeta nije uspelo.'
    );
  }
}

async function handleCreateCategory(
  newCategory: NewCategory
): Promise<void> {
  const createdCategory = await createCategory(newCategory);

  setBudgetData((currentData) => {
    if (!currentData) return currentData;

    return {
      ...currentData,
      categories: [...currentData.categories, createdCategory],
    };
  });
}

async function handleUpdateCategory(
  updatedCategory: Category
): Promise<void> {
  const savedCategory = await updateCategory(updatedCategory);

  setBudgetData((currentData) => {
    if (!currentData) return currentData;

    return {
      ...currentData,
      categories: currentData.categories.map((category) =>
        category.id === savedCategory.id ? savedCategory : category
      ),
    };
  });
}

async function handleDeleteCategory(categoryId: number): Promise<void> {
  await deleteCategory(categoryId);

  setBudgetData((currentData) => {
    if (!currentData) return currentData;

    return {
      ...currentData,
      categories: currentData.categories.filter(
        (category) => category.id !== categoryId
      ),
      budgets: currentData.budgets.filter(
        (budget) => budget.category_id !== categoryId
      ),
    };
  });
}

async function handleResetData(): Promise<void> {
  const confirmed = window.confirm(
    'Da li ste sigurni da želite da vratite početne podatke? Sve trenutne izmene biće izgubljene.'
  );

  if (!confirmed) return;

  try {
    await resetBudgetData();
    await loadBudgetData();
  } catch (caughtError: unknown) {
    setError(
      caughtError instanceof Error
        ? caughtError.message
        : 'Došlo je do nepoznate greške.'
    );
  }
}

async function handleDeleteTransaction(
  transactionId: number
): Promise<void> {
  const confirmed = window.confirm(
    'Da li ste sigurni da želite da obrišete ovu transakciju?'
  );

  if (!confirmed) {
    return;
  }

  try {
    await deleteTransaction(transactionId);

    setBudgetData((currentData) => {
      if (currentData === null) {
        return currentData;
      }

      return {
        ...currentData,
        transactions: currentData.transactions.filter(
          (transaction) => transaction.id !== transactionId
        ),
      };
    });
  } catch (caughtError) {
    window.alert(
      caughtError instanceof Error
        ? caughtError.message
        : 'Brisanje transakcije nije uspelo.'
    );
  }
}

  if (loading) {
    return (
      <main>
        <h1>Moj Budget Tracker</h1>
        <p>Učitavanje podataka...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <h1>Moj Budget Tracker</h1>
        <p role="alert">Greška: {error}</p>
        <button onClick={() => void loadBudgetData()}>
          Pokušaj ponovo
        </button>
      </main>
    );
  }

  if (budgetData === null) {
    return null;
  }

const monthlyTransactions = budgetData.transactions
  .filter((transaction) => transaction.date.startsWith(selectedMonth))
  .sort((a, b) => b.date.localeCompare(a.date));

  const filteredTransactions = monthlyTransactions.filter(
  (transaction) =>
    (selectedCategory === 'all' ||
      String(transaction.category_id) === selectedCategory) &&
    (selectedType === 'all' ||
      transaction.type === selectedType) &&
    (
      searchText.trim() === '' ||
      (transaction.description ?? '')
        .toLowerCase()
        .includes(searchText.trim().toLowerCase())
    )
);


const sortedTransactions = [...filteredTransactions].sort(
  (a, b) => {
    if (sortOrder === 'amount-desc') {
      return Number(b.amount) - Number(a.amount);
    }

    if (sortOrder === 'amount-asc') {
      return Number(a.amount) - Number(b.amount);
    }

    return b.date.localeCompare(a.date);
  }
);

  const incomeCents = monthlyTransactions.reduce(
    (total, transaction) => {
      if (transaction.type !== 'income') {
        return total;
      }

      return total + Math.round(Number(transaction.amount) * 100);
    },
    0
  );

  const expenseCents = monthlyTransactions.reduce(
    (total, transaction) => {
      if (transaction.type !== 'expense') {
        return total;
      }

      return total + Math.round(Number(transaction.amount) * 100);
    },
    0
  );

  const balanceCents = incomeCents - expenseCents;

  return (
    <main className="app-main">
      <h1>Moj Budget Tracker</h1>
      <p>Aplikacija za praćenje budžeta</p>

      <h2>Finansije</h2>
<section className="filter-section">
  <section>
  <h2>Pregled meseca</h2>

  <h3>{formatMonth(selectedMonth)}</h3>

  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      flexWrap:'wrap',
      gap: '12px',
    }}
  >
    <button
      type="button"
      onClick={() =>
        setSelectedMonth((currentMonth) =>
          changeMonth(currentMonth, -1)
        )
      }
    >
      Prethodni mesec
    </button>

    <button
      type="button"
      onClick={() =>
        setSelectedMonth((currentMonth) =>
          changeMonth(currentMonth, 1)
        )
      }
    >
      Sledeći mesec
    </button>
  </div>
</section>

  <div>
  <label htmlFor="search-filter">
    Pretraga po opisu:
  </label>

  <input
    id="search-filter"
    type="search"
    value={searchText}
    onChange={(event) => setSearchText(event.target.value)}
    placeholder="Unesi deo opisa..."
  />
</div>
<div>
  <label htmlFor="sort-filter">
    Sortiranje:
  </label>

  <select
    id="sort-filter"
    value={sortOrder}
    onChange={(event) =>
      setSortOrder(
        event.target.value as 'date' | 'amount-desc' | 'amount-asc'
      )
    }
  >
    <option value="date">Najnovije prvo</option>
    <option value="amount-desc">Najveći iznos prvo</option>
    <option value="amount-asc">Najmanji iznos prvo</option>
  </select>
</div>
</section>

<button type="button" onClick={handleResetData}>
  Vrati početne podatke
</button>

      <FinanceSummary
        incomeCents={incomeCents}
        expenseCents={expenseCents}
        balanceCents={balanceCents}
      />
      <div className="content-section">
  <BudgetOverview
    month={selectedMonth}
    categories={budgetData.categories}
    budgets={budgetData.budgets}
    transactions={monthlyTransactions}
    onDelete={handleDeleteBudget}
  />
</div>

<div className="content-section">
  <BudgetForm
    month={selectedMonth}
    categories={budgetData.categories}
    budgets={budgetData.budgets}
    onSave={handleSaveBudget}
  />
</div>

<div className="content-section">
  <CategoryManager
    categories={budgetData.categories}
    onCreate={handleCreateCategory}
    onUpdate={handleUpdateCategory}
    onDelete={handleDeleteCategory}
  />
</div>
      <div className="content-section">
      <TransactionForm categories={budgetData.categories}
  onSubmit={
    editingTransaction
      ? handleUpdateTransaction
      : handleCreateTransaction
  }
  transaction={editingTransaction ?? undefined}
  onCancel={() => setEditingTransaction(null)}
/>
</div>

<section>
  <h3>Filteri</h3>

  <div>
    <label htmlFor="category-filter">
      Kategorija:
    </label>

    <select
      id="category-filter"
      value={selectedCategory}
      onChange={(event) => setSelectedCategory(event.target.value)}
    >
      <option value="all">Sve kategorije</option>

      {budgetData.categories.map((category) => (
        <option key={category.id} value={String(category.id)}>
          {category.name}
        </option>
      ))}
    </select>
  </div>
<div>
  <label htmlFor="type-filter">
    Tip transakcije:
  </label>

  <select
    id="type-filter"
    value={selectedType}
    onChange={(event) =>
      setSelectedType(
        event.target.value as 'all' | 'income' | 'expense'
      )
    }
  >
    <option value="all">Svi tipovi</option>
    <option value="income">Prihodi</option>
    <option value="expense">Rashodi</option>
  </select>
</div>

</section>

      <section className="content-section">
        <h2>Transakcije</h2>

        {sortedTransactions.length === 0 ? (
          <p>Nema transakcija koje odgovaraju izabranom mesecu i filterima.</p>
        ) : (
          <ul className="transaction-list">
            {sortedTransactions.map((transaction) => {
              const category = budgetData.categories.find(
                (item) => item.id === transaction.category_id
              );

              const formattedAmount = Number(
                transaction.amount
              ).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              });

              return (
                <li key={transaction.id}>
                  {formatDate(transaction.date)}
                  {' — '}
                  {transaction.description ?? 'Bez opisa'}
                  {' — '}
                  <span
                    style={{
                      color: category?.color ?? '#666666',
                    }}
                  >
                    {category?.name ?? 'Nepoznata kategorija'}
                  </span>
                  {' — '}
                  {transaction.type === 'income' ? 'Prihod' : 'Rashod'}
                  {' — '}
                  {formattedAmount} €



                  <button
  type="button"
  onClick={() => setEditingTransaction(transaction)}
>
  Izmeni
</button>
                  <button
  type="button"
  onClick={() => void handleDeleteTransaction(transaction.id)}
>
  Obriši
</button>


                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}

export default App;
