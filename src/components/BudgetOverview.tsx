import type {
  Budget,
  Category,
  Transaction,
} from '../types';

type BudgetOverviewProps = {
  month: string;
  categories: Category[];
  budgets: Budget[];
  transactions: Transaction[];
  onDelete: (categoryId: number) => Promise<void>;
};

function BudgetOverview({
  month,
  categories,
  budgets,
  transactions,
  onDelete,
}: BudgetOverviewProps) {

  const categoryRows = categories
    .map((category) => {
      const expenseCents = transactions
        .filter(
          (transaction) =>
            transaction.category_id === category.id &&
            transaction.type === 'expense'
        )
        .reduce(
          (total, transaction) =>
            total + Math.round(Number(transaction.amount) * 100),
          0
        );

      const categoryBudget = budgets.find(
        (budget) =>
          budget.month === month &&
          budget.category_id === category.id
      );

      const budgetCents = categoryBudget
        ? Math.round(Number(categoryBudget.amount) * 100)
        : null;

      return {
        category,
        expenseCents,
        budgetCents,
      };
    })
    .filter(
      (item) =>
        item.expenseCents > 0 || item.budgetCents !== null
    )
    .sort(
      (a, b) => b.expenseCents - a.expenseCents
    );

  function formatEuro(cents: number): string {
    return `${(cents / 100).toFixed(2)} €`;
  }

  return (
    <section>
      <h2>Budžeti po kategorijama</h2>

      {categoryRows.length === 0 ? (
        <p>Još nema troškova ni postavljenih budžeta za ovaj mesec.</p>
      ) : (
        categoryRows.map((item) => {
          const remainingCents =
            item.budgetCents === null
              ? null
              : item.budgetCents - item.expenseCents;

          const progressPercent =
            item.budgetCents !== null && item.budgetCents > 0
              ? Math.round(
                  (item.expenseCents / item.budgetCents) * 100
                )
              : 0;

          return (
            <div
  key={item.category.id}
  className="budget-category-item"
>
              <h3>{item.category.name}</h3>

              <p>
                Potrošeno: {formatEuro(item.expenseCents)}
              </p>

              {item.budgetCents === null ? (
                <p>Budžet nije postavljen.</p>
              ) : (
                <>
                  <p>
                    Planirani budžet: {formatEuro(item.budgetCents)}
                  </p>

                  <p>
                    {remainingCents !== null && remainingCents >= 0
                      ? `Preostalo: ${formatEuro(remainingCents)}`
                      : `Prekoračenje: ${formatEuro(Math.abs(remainingCents ?? 0))}`}
                  </p>

                  <p>
                    Iskorišćeno: {progressPercent}%
                  </p>

                  <div
                    style={{
                      width: '100%',
                      height: '12px',
                      backgroundColor: '#eeeeee',
                      borderRadius: '6px',
                      overflow: 'hidden',
                    }}
                    role="progressbar"
                    aria-valuenow={Math.min(progressPercent, 100)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Potrošnja budžeta za ${item.category.name}`}
                  >
                    <div
                      style={{
                        width: `${Math.min(progressPercent, 100)}%`,
                        height: '100%',
                        backgroundColor:
                          remainingCents !== null && remainingCents < 0
                            ? '#c62828'
                            : '#2e7d32',
                      }}
                    />
                  </div>

                  {remainingCents !== null && remainingCents < 0 && (
                    <p>
                      Upozorenje: budžet je prekoračen!
                    </p>
                  )}

                <button
  type="button"
  onClick={() => void onDelete(item.category.id)}
>
  Obriši budžet
</button>

                </>
              )}
            </div>
          );
        })
      )}
    </section>
  );
}

export default BudgetOverview;