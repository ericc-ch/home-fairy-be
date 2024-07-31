import { TTS_API_KEY, TTS_BASE_URL } from "@/lib/env.ts";
import { ofetch } from "ofetch";

const tts = ofetch.create({
  baseURL: TTS_BASE_URL,
  headers: {
    "X-API-Key": TTS_API_KEY,
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

export const waitForTTS = (
  options: GetTTSStatusOptions,
  delay: number = 100
) => {
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
    }, delay);
  });
};

type DownloadTTSAudioOptions = {
  taskId: string;
};

export const downloadTTSAudio = ({ taskId }: DownloadTTSAudioOptions) => {
  return tts(`/output/${taskId}.mp3`, {
    method: "GET",
    responseType: "blob",
  });
};

type DownloadTTSSubtitleOptions = DownloadTTSAudioOptions;

export const downloadTTSSubtitle = ({ taskId }: DownloadTTSSubtitleOptions) => {
  return tts(`/output/${taskId}.vtt`, {
    method: "GET",
    responseType: "text",
  });
};
