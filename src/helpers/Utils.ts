import { faceEmojis } from "config";
import { lstatSync, readdirSync } from "fs";
import { join } from "path";

export function recursivelyReadDirectory(rootPath: string) {
  const filePaths: string[] = [];

  const go = (rootPath: string) => {
    const fullPath = join(process.cwd(), rootPath);
    const files = readdirSync(fullPath);
    files.forEach(file => {
      const filePath = join(fullPath, file);
      const isDirectory = lstatSync(filePath).isDirectory();
      if (isDirectory) {
        go(join(rootPath, file));
      } else {
        filePaths.push(filePath);
      }
    });
  }

  go(rootPath);
  return filePaths;
}

export function getRandomFaceEmoji() {
  const random = Math.floor(Math.random() * faceEmojis.length);
  return faceEmojis[random];
}

export function transformToTitleCase(word: string) {
  return word[0]?.toUpperCase() + word.slice(1);
}

export function msToReadableMinutes(ms: number) {
  const inSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(inSeconds / 60);
  const seconds = inSeconds - (minutes * 60);
  return `${minutes}:${seconds.toString().length === 1 ? "0" + seconds : seconds}`;
}
