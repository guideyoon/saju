import { hasTossConfiguration } from "../../../lib/payments/catalog";
import { noStoreJson } from "../../../lib/server/http";
import { hasPersistenceConfiguration } from "../../../lib/storage/supabase";

export const dynamic = "force-dynamic";

function hasOperatorInformation() {
  return [
    "SERVICE_OPERATOR_NAME",
    "SERVICE_BUSINESS_NUMBER",
    "SERVICE_ECOMMERCE_NUMBER",
    "SERVICE_OPERATOR_ADDRESS",
    "SERVICE_SUPPORT_EMAIL",
    "SERVICE_SUPPORT_PHONE",
  ].every((key) => Boolean(process.env[key]?.trim()));
}

export async function GET() {
  const paymentReady = hasTossConfiguration();
  const persistenceReady = hasPersistenceConfiguration();
  const operatorReady = hasOperatorInformation();
  const authReady = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
  const publicSalesReady = paymentReady && persistenceReady && operatorReady;

  return noStoreJson({
    status: publicSalesReady ? "ready" : "configuration_required",
    checkedAt: new Date().toISOString(),
    services: {
      calculation: "ready",
      ruleInterpretation: "ready",
      aiInterpretation: process.env.OPENAI_API_KEY ? "ready" : "optional_disabled",
      payment: paymentReady ? "ready" : "configuration_required",
      operatorInformation: operatorReady ? "ready" : "configuration_required",
      persistence: persistenceReady ? "encrypted_server_storage" : "browser_only",
      kakaoAuth: authReady ? "ready" : "optional_disabled",
    },
    publicSalesReady,
  });
}
