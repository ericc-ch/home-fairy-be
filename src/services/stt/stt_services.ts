import { basicAuth } from "../../lib/auth.ts";
import { ofetch } from "ofetch";
import { Transcript } from "./stt_types.ts";
import { STT_BASE_URL, STT_PASSWORD, STT_USERNAME } from "@/lib/env.ts";

const stt = ofetch.create({
  baseURL: STT_BASE_URL,
  headers: {
    Authorization: `Basic ${basicAuth(STT_USERNAME, STT_PASSWORD)}`,
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
