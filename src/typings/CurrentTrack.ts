import { Track } from "@typings/Track";

export interface CurrentTrack extends Track {
	queueNumber: number;
	startPlayDate: Date | null;
}
