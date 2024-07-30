interface Word {
  word: string;
  start: number;
  end: number;
}

export interface Transcript {
  text: string;
  word_count: number;
  vtt: string;
  words: Word[];
}
