import { basicAuth } from "@/utils/auth.ts";
import { ofetch } from "ofetch";
import { Transcript } from "./stt_types.ts";

const stt = ofetch.create({
  baseURL: Deno.env.get("STT_BASE_URL"),
  headers: {
    Authorization: `Basic ${basicAuth(
      Deno.env.get("STT_USERNAME")!,
      Deno.env.get("STT_PASSWORD")!
    )}`,
  },
});

type GetSttOptions = {
  body: {
    audio: Blob;
  };
};

type GetSttResponse = Transcript;

export const getStt = ({ body }: GetSttOptions) => {
  const formData = new FormData();
  formData.append("audio", body.audio);

  return stt<GetSttResponse>("/stt", {
    method: "POST",
    body: formData,
  });
};
