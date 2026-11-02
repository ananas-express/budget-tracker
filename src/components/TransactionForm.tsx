import { useEffect, useState, type FormEvent } from 'react';
import type {
  Category,
  NewTransaction,
  Transaction,
  TransactionType,
} from '../types';

type TransactionFormProps = {
  categories: Category[];
  onSubmit: (transaction: NewTransaction) => Promise<void>;
  transaction?: Transaction;
  onCancel?: () => void;
};

function TransactionForm({
  categories,
  onSubmit,
  transaction,
  onCancel,
}: TransactionFormProps) {

  const [type, setType] = useState<TransactionType>(
  transaction?.type ?? 'expense'
);

const [amount, setAmount] = useState(
  transaction?.amount ?? ''
);

const [date, setDate] = useState(
  transaction?.date ?? ''
);

const [categoryId, setCategoryId] = useState(
  transaction ? String(transaction.category_id) : ''
);

const [description, setDescription] = useState(
  transaction?.description ?? ''
);

useEffect(() => {
  setType(transaction?.type ?? 'expense');
  setAmount(transaction?.amount ?? '');
  setDate(transaction?.date ?? '');
  setCategoryId(
    transaction ? String(transaction.category_id) : ''
  );
  setDescription(transaction?.description ?? '');
  setError('');
}, [transaction]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();

  setError('');
  setIsSubmitting(true);

  const newTransaction: NewTransaction = {
    type,
    amount,
    date,
    description: description.trim() === '' ? null : description.trim(),
    category_id: Number(categoryId),
  };

  try {
    await onSubmit(newTransaction);

    setAmount('');
    setDate('');
    setCategoryId('');
    setDescription('');
  } catch (submitError) {
    if (submitError instanceof Error) {
      setError(submitError.message);
    } else {
      setError('Došlo je do greške prilikom čuvanja transakcije.');
    }
  } finally {
    setIsSubmitting(false);
  }
}

  return (
    <section>
      <h2>{transaction ? 'Izmeni transakciju' : 'Dodaj transakciju'}</h2>

      <form className="transaction-form" onSubmit={handleSubmit}>

  <label htmlFor="type">Tip transakcije</label>

  <select
    id="type"
    value={type}
    onChange={(event) =>
      setType(event.target.value as TransactionType)
    }
  >
    <option value="income">Prihod</option>
    <option value="expense">Rashod</option>
  </select>

  <label htmlFor="amount">Iznos (€)</label>

  <input
    id="amount"
    type="number"
    value={amount}
    onChange={(event) => setAmount(event.target.value)}
    min="0.01"
    max="1000000"
    step="0.01"
    required
  />

  <label htmlFor="date">Datum</label>

  <input
    id="date"
    type="date"
    value={date}
    onChange={(event) => setDate(event.target.value)}
    required
  />

  <label htmlFor="category">Kategorija</label>

  <select
    id="category"
    value={categoryId}
    onChange={(event) => setCategoryId(event.target.value)}
    required
  >
    <option value="">Izaberi kategoriju</option>

    {categories.map((category) => (
      <option key={category.id} value={category.id}>
        {category.name}
      </option>
    ))}
  </select>

  <label htmlFor="description">Opis</label>

  <textarea
    id="description"
    value={description}
    onChange={(event) => setDescription(event.target.value)}
    maxLength={200}
  />
{error && <p role="alert">{error}</p>}
  <button type="submit" disabled={isSubmitting}>
  {isSubmitting
    ? 'Čuvanje...'
    : transaction
      ? 'Sačuvaj izmene'
      : 'Dodaj transakciju'}
</button>

{transaction && onCancel && (
  <button
    type="button"
    onClick={onCancel}
    disabled={isSubmitting}
  >
    Odustani
  </button>
)}

</form>
    </section>
  );
}

export default TransactionForm;