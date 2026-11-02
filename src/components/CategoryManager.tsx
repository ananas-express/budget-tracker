import { useState } from 'react';
import type { FormEvent } from 'react';

import type {
  Category,
  NewCategory,
} from '../types';

type CategoryManagerProps = {
  categories: Category[];
  onCreate: (category: NewCategory) => Promise<void>;
  onUpdate: (category: Category) => Promise<void>;
  onDelete: (categoryId: number) => Promise<void>;
};

function CategoryManager({
  categories,
  onCreate,
  onUpdate,
  onDelete,
}: CategoryManagerProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#2E7D32');

  const [editingCategory, setEditingCategory] =
    useState<Category | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function resetForm() {
    setName('');
    setColor('#2E7D32');
    setEditingCategory(null);
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanName = name.trim();

    if (cleanName.length === 0 || cleanName.length > 30) {
      setError('Naziv kategorije mora imati između 1 i 30 karaktera.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      if (editingCategory) {
        await onUpdate({
          ...editingCategory,
          name: cleanName,
          color,
        });
      } else {
        await onCreate({
          name: cleanName,
          color,
        });
      }

      resetForm();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Čuvanje kategorije nije uspelo.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(categoryId: number) {
    const confirmed = window.confirm(
      'Da li sigurno želiš da obrišeš ovu kategoriju?'
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await onDelete(categoryId);

      if (editingCategory?.id === categoryId) {
        resetForm();
      }
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Brisanje kategorije nije uspelo.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section>
      <h2>Upravljanje kategorijama</h2>

      <form className="category-form" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="category-name">
            Naziv kategorije
          </label>

          <input
            id="category-name"
            type="text"
            value={name}
            maxLength={30}
            onChange={(event) => setName(event.target.value)}
            placeholder="Na primer: Transport"
          />
        </div>

        <div>
          <label htmlFor="category-color">
            Boja kategorije
          </label>

          <input
            id="category-color"
            type="color"
            value={color}
            onChange={(event) => setColor(event.target.value)}
          />
        </div>

        {error && <p role="alert">{error}</p>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? 'Čuvanje...'
            : editingCategory
              ? 'Sačuvaj izmene'
              : 'Dodaj kategoriju'}
        </button>

        {editingCategory && (
          <button
            type="button"
            onClick={resetForm}
            disabled={isSubmitting}
          >
            Otkaži izmenu
          </button>
        )}
      </form>

      <h3>Postojeće kategorije</h3>

      {categories.length === 0 ? (
        <p>Još nema kategorija.</p>
      ) : (
        categories.map((category) => (
          <div key={category.id} className="category-item">
            <span
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: category.color,
                display: 'inline-block',
              }}
            />

            <span>{category.name}</span>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                setEditingCategory(category);
                setName(category.name);
                setColor(category.color);
                setError(null);
              }}
            >
              Izmeni
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => void handleDelete(category.id)}
            >
              Obriši
            </button>
          </div>
        ))
      )}
    </section>
  );
}

export default CategoryManager;