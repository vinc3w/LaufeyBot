import { ExternalUrl } from "@typings/Global";
import { Album } from "@typings/Album";
import { SimplifiedArtist } from "@typings/Artist";

export interface Track {
	artists: SimplifiedArtist[];
	availableMarkets: string[];
	discNumber: number;
	durationMs: number;
	explicit: boolean;
	externalUrls: ExternalUrl;
	href: string;
	id: string;
	name: string;
	trackNumber: number;
	type: "track";
	uri: string;
	album: Omit<Album, "tracks">;
	// if true, indicate that this track is
	// solely for development and testing purposes
	dev?: boolean;
}
