import { getCurrentUser } from "@/lib/auth";
import { getTranslations } from "next-intl/server";

import { DarkPricing } from "@/components/price/dark-pricing";
import { PricingCards } from "@/components/price/pricing-cards";
import { billingProvider } from "@/config/billing-provider";
import { getUserPlans } from "@/services/billing";
import type { CreditsDictionary } from "@/hooks/use-credit-packages";
import type { UserSubscriptionPlan } from "@/types";

export async function PricingSection() {
  const user = await getCurrentUser();
  let subscriptionPlan: UserSubscriptionPlan | undefined;
  const isCreem = billingProvider === "creem";

  if (user && !isCreem) {
    subscriptionPlan = await getUserPlans(user.id);
  }

  const t = await getTranslations("PricingCards");
  const dictPrice = (await getTranslations()).raw("PricingCards") as Record<string, string>;
  const dictCredits = (await getTranslations()).raw("Credits") as CreditsDictionary;

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {t("pricing")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("slogan")}
          </p>
        </div>

        {isCreem ? (
          <DarkPricing
            userId={user?.id}
            dictPrice={dictPrice}
            dictCredits={dictCredits}
          />
        ) : (
          <PricingCards
            userId={user?.id}
            subscriptionPlan={subscriptionPlan}
          />
        )}
      </div>
    </section>
  );
}
