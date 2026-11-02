import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';

import type {
  Budget,
  Category,
} from '../types';

type BudgetFormProps = {
  month: string;
  categories: Category[];
  budgets: Budget[];
  onSave: (categoryId: number, amount: string) => Promise<void>;
};

function BudgetForm({
  month,
  categories,
  budgets,
  onSave,
}: BudgetFormProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    categories.length > 0 ? String(categories[0].id) : ''
  );

  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (categories.length === 0) {
      setSelectedCategoryId('');
      setAmount('');
      return;
    }

    const categoryExists = categories.some(
      (category) => String(category.id) === selectedCategoryId
    );

    if (!categoryExists) {
      setSelectedCategoryId(String(categories[0].id));
    }
  }, [categories, selectedCategoryId]);

  useEffect(() => {
    if (!selectedCategoryId) {
      setAmount('');
      return;
    }

    const existingBudget = budgets.find(
      (budget) =>
        budget.month === month &&
        budget.category_id === Number(selectedCategoryId)
    );

    setAmount(existingBudget?.amount ?? '');
    setError(null);
  }, [month, selectedCategoryId, budgets]);

  const selectedBudget = budgets.find(
    (budget) =>
      budget.month === month &&
      budget.category_id === Number(selectedCategoryId)
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanAmount = amount.trim();

    if (!selectedCategoryId) {
      setError('Izaberi kategoriju.');
      return;
    }

    if (!/^\d+(\.\d{1,2})?$/.test(cleanAmount)) {
      setError('Unesi ispravan iznos sa najviše dve decimale.');
      return;
    }

    const numericAmount = Number(cleanAmount);

    if (numericAmount <= 0 || numericAmount > 1000000) {
      setError('Iznos mora biti veći od 0 i najviše 1.000.000,00 €.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await onSave(Number(selectedCategoryId), cleanAmount);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Čuvanje budžeta nije uspelo.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section>
      <h2>Postavljanje budžeta</h2>

      {categories.length === 0 ? (
        <p>Prvo dodaj kategoriju.</p>
      ) : (
        <form className="budget-form" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="budget-category">
              Kategorija
            </label>

            <select
              id="budget-category"
              value={selectedCategoryId}
              onChange={(event) =>
                setSelectedCategoryId(event.target.value)
              }
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="budget-amount">
              Iznos budžeta (€)
            </label>

            <input
              id="budget-amount"
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="Na primer: 200.00"
            />
          </div>

          {selectedBudget && (
            <p>
              Za ovu kategoriju već postoji budžet za izabrani mesec.
              Novi iznos će zameniti postojeći.
            </p>
          )}

          {error && <p role="alert">{error}</p>}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? 'Čuvanje...'
              : selectedBudget
                ? 'Sačuvaj izmene'
                : 'Postavi budžet'}
          </button>
        </form>
      )}
    </section>
  );
}

export default BudgetForm;