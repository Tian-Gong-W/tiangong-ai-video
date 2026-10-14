import { getAvailableModels } from "@/config/credits";
import { apiSuccess } from "@/lib/api/response";
import { getConfiguredAIProvider } from "@/ai";

export async function GET() {
  const models = getAvailableModels({
    provider: getConfiguredAIProvider(),
  });
  return apiSuccess(models);
}
