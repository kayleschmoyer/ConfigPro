import { DocumentList } from '../components/DocumentList';
import { usePortal } from '../hooks/usePortal';

export const PortalDocuments = () => {
  const { snapshot } = usePortal();

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold text-foreground">Documents</h2>
        <p className="text-sm text-muted">Access proposals, statements, and signed agreements.</p>
      </header>
      <DocumentList
        documents={snapshot.documents}
        onDownload={document => {
          if (typeof window !== 'undefined') {
            window.open(document.url, '_blank', 'noopener');
          }
        }}
      />
    </div>
  );
};

export default PortalDocuments;
