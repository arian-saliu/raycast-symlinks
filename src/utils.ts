import fs from "fs";
import path from "path";
import { environment } from "@raycast/api";

const SYMLINK_FILE = path.join(environment.supportPath, "symlinks.json");

export function getSymlinks() {
    if (!fs.existsSync(SYMLINK_FILE)) {
        fs.writeFileSync(SYMLINK_FILE, JSON.stringify([], null, 2), "utf-8");
        return [];
    }
    const data = fs.readFileSync(SYMLINK_FILE, "utf-8");
    return JSON.parse(data) || [];
}

export function saveSymlink(name: string, source: string, destination: string) {
    const directory = path.dirname(SYMLINK_FILE);
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }

    const symlinks = getSymlinks();
    symlinks.push({ name, source, destination });
    fs.writeFileSync(SYMLINK_FILE, JSON.stringify(symlinks, null, 2), "utf-8");
}

export function removeSymlink(source: string, destination: string) {
    let symlinks = getSymlinks();
    symlinks = symlinks.filter(
        (s: { source: string; destination: string }) => s.source !== source || s.destination !== destination,
    );
    fs.writeFileSync(SYMLINK_FILE, JSON.stringify(symlinks, null, 2), "utf-8");
}
