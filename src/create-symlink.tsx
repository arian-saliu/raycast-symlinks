import { Form, ActionPanel, Action, showToast, Toast, confirmAlert } from "@raycast/api";
import { useState } from "react";
import { promisify } from "util";
import { exec } from "child_process";
import { saveSymlink, getSymlinks } from "./utils";
import fs from "fs";
import path from "path";
import { homedir } from "os";

class ValidationError extends Error {
    field: string;

    constructor({ field, message }: { field: string; message: string }) {
        super(message);
        this.field = field;
        this.name = "ValidationError";
    }
}

const execAsync = promisify(exec);

const HOMEDIR = `${homedir()}`;

export default function Command() {
    const [name, setName] = useState<string>("");
    const [source, setSource] = useState<string>("");
    const [destination, setDestination] = useState<string>("");
    const [forceCreate, setForceCreate] = useState<boolean>(false);

    function normalizePath(inputPath: string): string {
        return path.normalize(inputPath.replace(/^~/, HOMEDIR));
    }

    async function validatePaths(): Promise<boolean> {
        const normalizedSource = normalizePath(source);
        const normalizedDest = normalizePath(destination);

        if (!fs.existsSync(normalizedSource)) {
            throw new ValidationError({ field: "source", message: "Source path does not exist" });
        }

        if (!fs.existsSync(normalizedDest)) {
            throw new ValidationError({ field: "destination", message: "Destination path does not exist" });
        }

        const destinationStats = fs.statSync(normalizedDest);
        if (!destinationStats.isDirectory()) {
            throw new ValidationError({ field: "destination", message: "Destination must be a directory" });
        }

        return true;
    }

    async function createSymlink() {
        try {
            if (!name || !source || !destination) {
                await showToast({ style: Toast.Style.Failure, title: "All fields are required" });
                return;
            }

            const existingSymlinks = getSymlinks();
            const nameExists = existingSymlinks.some((symlink: { name: string }) => symlink.name === name);
            if (nameExists) {
                await showToast({
                    style: Toast.Style.Failure,
                    title: "Name already exists",
                    message: "Please choose a different name for your symlink",
                });
                return;
            }

            await validatePaths();

            const normalizedSource = normalizePath(source);
            const normalizedDest = normalizePath(destination);
            const destinationPath = path.join(normalizedDest, path.basename(normalizedSource));

            if (fs.existsSync(destinationPath)) {
                if (forceCreate) {
                    const proceed = await confirmAlert({
                        title: "Replace existing symlink?",
                        message: "This will remove the existing symlink.",
                        primaryAction: {
                            title: "Replace",
                        },
                    });

                    if (!proceed) return;
                } else {
                    await showToast({
                        style: Toast.Style.Failure,
                        title: "A file or symlink already exists at destination",
                    });
                    return;
                }
            }

            let sourcePath = normalizedSource;

            const command = forceCreate
                ? `ln -sf "${sourcePath}" "${destinationPath}"`
                : `ln -s "${sourcePath}" "${destinationPath}"`;

            await execAsync(command);
            saveSymlink(name, sourcePath, destinationPath);

            await showToast({ style: Toast.Style.Success, title: "Symlink created successfully" });
        } catch (error) {
            console.error(error);
            await showToast({
                style: Toast.Style.Failure,
                title: "Failed to create symlink",
                message: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }

    return (
        <Form
            actions={
                <ActionPanel>
                    <Action.SubmitForm title="Create Symlink" onSubmit={createSymlink} />
                </ActionPanel>
            }
        >
            <Form.Description text="Create a new Symbolink link." />
            <Form.TextField id="name" title="Name" placeholder="A friendly name" value={name} onChange={setName} />

            <Form.FilePicker
                id="source"
                title="Source"
                allowMultipleSelection={false}
                canChooseDirectories
                canChooseFiles={false}
                value={source ? [source] : []}
                onChange={(paths) => setSource(paths[0])}
            />

            <Form.FilePicker
                id="destination"
                title="Destination"
                allowMultipleSelection={false}
                canChooseDirectories
                canChooseFiles={false}
                value={destination ? [destination] : []}
                onChange={(paths) => setDestination(paths[0])}
            />

            <Form.Checkbox
                id="force"
                label="Replace if already exists"
                title="Force creation"
                value={forceCreate}
                onChange={setForceCreate}
            />
        </Form>
    );
}
