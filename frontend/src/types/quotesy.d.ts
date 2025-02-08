declare module 'quotesy' {
  export interface Quote {
    text: string;
    author: string;
  }

  export function random(): Quote;
} 