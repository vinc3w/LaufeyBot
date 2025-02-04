import {
  Copyright,
  ExternalId,
  ExternalUrl,
  Image,
  Paging
} from "@typings/Global";
import { Track } from "@typings/Track";
import { SimplifiedArtist } from "@typings/Artist";

export type AlbumType = "single" | "album" | "compilation";

export type AlbumGroup = AlbumType | "appears_on";

export interface Album {
  albumGroup: AlbumGroup;
  albumType: AlbumType;
  artists: SimplifiedArtist[];
  availableMarkets: string[];
  externalUrls: ExternalUrl;
  href: string;
  id: string;
  images: Image[];
  name: string;
  releaseDate: string;
  releaseDatePrecision: string;
  totalTracks: number;
  type: "album";
  uri: string;
  copyrights: Copyright[];
  externalIds: ExternalId;
  genres: string[];
  label: string;
  popularity: number;
  tracks: Paging<Track>;
}
