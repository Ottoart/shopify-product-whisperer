import { useSearchParams } from "react-router-dom";
import { RepricingOverviewDashboard } from "@/components/repricing/RepricingOverviewDashboard";
import { RepricingListings } from "@/components/repricing/RepricingListings";

const Repricing = () => {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab');

  // Show listings page if tab=listings, otherwise show dashboard
  if (tab === 'listings') {
    return <RepricingListings />;
  }

  return <RepricingOverviewDashboard />;
};

export default Repricing;