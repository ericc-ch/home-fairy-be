import { ofetch } from "ofetch";

const tts = ofetch.create({
  baseURL: Deno.env.get("TTS_BASE_URL"),
  headers: {
    "X-API-Key": Deno.env.get("TTS_API_KEY")!,
  },
});

type GenerateTTSOptions = {
  body: {
    text: string;
    voice?: string;
    subtitle?: boolean;
  };
};

type GenerateTTSResponse = {
  taskId: string;
};

export const generateTTS = ({ body }: GenerateTTSOptions) => {
  return tts<GenerateTTSResponse>("/tts", {
    method: "POST",
    body,
  });
};

type GetTTSStatusOptions = {
  taskId: string;
};

type GetTTSStatusResponse = {
  error: string | null;
  status: "pending" | "done" | "error";
  url: string | null;
};

export const getTTSStatus = ({ taskId }: GetTTSStatusOptions) => {
  return tts<GetTTSStatusResponse>(`/tts/${taskId}`, {
    method: "GET",
  });
};

export const waitForTTS = (options: GetTTSStatusOptions) => {
  return new Promise<GetTTSStatusResponse>((resolve, reject) => {
    const interval = setInterval(async () => {
      const response = await getTTSStatus(options);
      if (response.status === "done") {
        clearInterval(interval);
        resolve(response);
      } else if (response.status === "error") {
        clearInterval(interval);
        reject(response);
      }
    }, 100);
  });
};

const TTS_FILES_EXTENSIONS = {
  audio: "mp3",
  subtitle: "vtt",
} as const;

type DownloadTTSOptions = {
  taskId: string;
  type: keyof typeof TTS_FILES_EXTENSIONS;
};

export const downloadTTS = ({ taskId, type }: DownloadTTSOptions) => {
  return tts(`/tts/${taskId}/download.${TTS_FILES_EXTENSIONS[type]}`, {
    method: "GET",
    responseType: type === "audio" ? "blob" : "text",
  });
};
