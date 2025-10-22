import { useInstaller } from './InstallerLayout';
import { PricingSummary } from '../components/PricingSummary';
import { useCurrencyFormat } from '../../../shared/hooks/useCurrencyFormat';

export const StepPricing = () => {
  const { priceBreakdown, draft, setCouponCode, billingVisible } = useInstaller();
  const { formatCurrency } = useCurrencyFormat({ currency: draft.currency, locale: draft.locale });

  return (
    <PricingSummary
      breakdown={priceBreakdown}
      formatCurrency={(value) => formatCurrency({ currency: draft.currency, value })}
      couponCode={draft.couponCode}
      onCouponChange={setCouponCode}
      billingVisible={billingVisible}
    />
  );
};
