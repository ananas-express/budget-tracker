type FinanceSummaryProps = {
  incomeCents: number;
  expenseCents: number;
  balanceCents: number;
};

function FinanceSummary({
  incomeCents,
  expenseCents,
  balanceCents,
}: FinanceSummaryProps) {
  return (
    <section>
      <h2>Ukupan budzet</h2>

      <p>Prihodi: {(incomeCents / 100).toFixed(2)} €</p>

      <p>Rashodi: {(expenseCents / 100).toFixed(2)} €</p>

      <p>Trenutno stanje: {(balanceCents / 100).toFixed(2)} €</p>
    </section>
  );
}

export default FinanceSummary;