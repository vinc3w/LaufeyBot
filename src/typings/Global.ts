export interface ExternalUrl {
  spotify: string;
}

export interface Image {
  height: number | null;
  url: string;
  width: number | null;
}

export interface ExternalId {
  ean: string;
  isrc: string;
  upc: string;
}

export interface Copyright {
  text: string;
  type: "C" | "P";
}

export interface Paging<T> {
  href: string;
  items: T[];
  limit: number;
  next?: string;
  offset: number;
  previous?: string;
  total: number;
}

export interface Followers {
  href: string | null;
  total: number;
}
