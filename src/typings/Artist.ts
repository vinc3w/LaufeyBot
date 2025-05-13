import { ExternalUrl, Followers, Image } from "@typings/Global";

export interface SimplifiedArtist {
  externalUrls: ExternalUrl;
  href: string;
  id: string;
  name: string;
  type: "artist";
  uri: string;
}

export interface Artist extends SimplifiedArtist {
  about: string;
  followers: Followers;
  genres: string[];
  images: Image[];
  popularity: number;
}
