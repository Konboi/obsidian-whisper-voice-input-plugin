export type LmProvider = "ollama" | "codex" | "custom";

export interface LmProviderPreset {
	baseUrl: string;
	model: string;
}

export const LM_PROVIDER_PRESETS: Record<Exclude<LmProvider, "custom">, LmProviderPreset> = {
	ollama: {
		baseUrl: "http://127.0.0.1:11434/v1",
		model: "gemma3:4b",
	},
	codex: {
		baseUrl: "http://127.0.0.1:38180/v1",
		model: "gpt-5.5",
	},
};

export function inferLmProvider(baseUrl: string): LmProvider {
	try {
		const {port} = new URL(baseUrl);
		if (port === "11434") {
			return "ollama";
		}
		if (port === "38180") {
			return "codex";
		}
	} catch {
		// Keep invalid or incomplete values editable as a custom server.
	}
	return "custom";
}

export function authorizationHeaders(apiKey: string): Record<string, string> {
	const trimmedApiKey = apiKey.trim();
	return trimmedApiKey ? {Authorization: `Bearer ${trimmedApiKey}`} : {};
}
