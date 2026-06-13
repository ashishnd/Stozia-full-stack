import { useCallback, useEffect, useState } from "react";
import { api } from "./api/client";
import type { ComparisonResponse, RFQDetail, RFQSummary } from "./api/types";
import { ComparisonTable } from "./components/ComparisonTable";
import { CSVImport } from "./components/CSVImport";
import { QuoteForm } from "./components/QuoteForm";
import { RFQDetailPanel } from "./components/RFQDetailPanel";
import { RFQForm } from "./components/RFQForm";
import { RFQList } from "./components/RFQList";

function App() {
  const [rfqs, setRfqs] = useState<RFQSummary[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedRfq, setSelectedRfq] = useState<RFQDetail | null>(null);
  const [comparison, setComparison] = useState<ComparisonResponse | null>(null);
  const [loadingComparison, setLoadingComparison] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRfqs = useCallback(async () => {
    const data = await api.listRfqs();
    setRfqs(data);
    return data;
  }, []);

  const loadRfqDetails = useCallback(async (rfqId: number) => {
    setLoadingComparison(true);
    setError(null);

    try {
      const [rfq, comparisonData] = await Promise.all([
        api.getRfq(rfqId),
        api.getComparison(rfqId),
      ]);
      setSelectedRfq(rfq);
      setComparison(comparisonData);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load RFQ.");
      setSelectedRfq(null);
      setComparison(null);
    } finally {
      setLoadingComparison(false);
    }
  }, []);

  useEffect(() => {
    loadRfqs().catch((loadError) => {
      setError(loadError instanceof Error ? loadError.message : "Failed to load RFQs.");
    });
  }, [loadRfqs]);

  useEffect(() => {
    if (selectedId !== null) {
      loadRfqDetails(selectedId);
    }
  }, [selectedId, loadRfqDetails]);

  const handleRfqCreated = async (rfqId: number) => {
    await loadRfqs();
    setSelectedId(rfqId);
  };

  const handleQuoteUpdated = async () => {
    if (selectedId !== null) {
      await Promise.all([loadRfqs(), loadRfqDetails(selectedId)]);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <p className="eyebrow">Stozia Take-Home</p>
          <h1>Supplier Quote Comparison</h1>
          <p className="subtitle">
            Create RFQs, collect supplier quotes, and compare total pricing side by side.
          </p>
        </div>
      </header>

      {error && <p className="banner error">{error}</p>}

      <main className="layout">
        <aside className="sidebar">
          <RFQForm onCreated={handleRfqCreated} />
          <RFQList rfqs={rfqs} selectedId={selectedId} onSelect={setSelectedId} />
        </aside>

        <section className="content">
          {selectedRfq ? (
            <>
              <RFQDetailPanel rfq={selectedRfq} />
              <ComparisonTable comparison={comparison} loading={loadingComparison} />
              <QuoteForm rfqId={selectedRfq.id} onCreated={handleQuoteUpdated} />
              <CSVImport rfqId={selectedRfq.id} onImported={handleQuoteUpdated} />
            </>
          ) : (
            <section className="panel empty-state">
              <h2>Select an RFQ</h2>
              <p className="muted">
                Choose an RFQ from the list or create a new one to start comparing supplier quotes.
              </p>
            </section>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
