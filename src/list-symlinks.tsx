import { ActionPanel, List, Action, Icon, confirmAlert, showToast, Toast } from "@raycast/api";
import { useEffect, useState } from "react";
import { getSymlinks, removeSymlink } from "./utils";
import fs from "fs";

interface Symlink {
    name: string;
    source: string;
    destination: string;
}

export default function Command() {
    const [symlinks, setSymlinks] = useState<Symlink[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadSymlinks();
    }, []);

    const loadSymlinks = () => {
        try {
            const links = getSymlinks();
            setSymlinks(links);
        } catch (error) {
            console.error("Failed to load symlinks:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteSymlink = async (symlink: Symlink) => {
        try {
            const proceed = await confirmAlert({
                title: "Delete Symlink",
                message: `Are you sure you want to delete the symlink "${symlink.name}"?`,
                primaryAction: {
                    title: "Delete",
                },
            });

            if (!proceed) return;

            if (fs.existsSync(symlink.destination)) {
                fs.unlinkSync(symlink.destination);
            }

            removeSymlink(symlink.source, symlink.destination);

            loadSymlinks();

            await showToast({
                style: Toast.Style.Success,
                title: "Symlink deleted successfully",
            });
        } catch (error) {
            console.error("Failed to delete symlink:", error);
            await showToast({
                style: Toast.Style.Failure,
                title: "Failed to delete symlink",
                message: error instanceof Error ? error.message : "Unknown error",
            });
        }
    };

    const checkSymlinkValidity = (destination: string): boolean => {
        try {
            return fs.existsSync(destination) && fs.lstatSync(destination).isSymbolicLink();
        } catch {
            return false;
        }
    };

    return (
        <List isLoading={isLoading} searchBarPlaceholder="Search symlinks...">
            {symlinks.map((symlink) => {
                const isValid = checkSymlinkValidity(symlink.destination);
                return (
                    <List.Item
                        key={`${symlink.source}-${symlink.destination}`}
                        title={symlink.name}
                        subtitle={symlink.source}
                        accessories={[
                            {
                                icon: isValid ? Icon.CheckCircle : Icon.XMarkCircle,
                                tooltip: isValid ? "Valid symlink" : "Invalid or broken symlink",
                            },
                        ]}
                        actions={
                            <ActionPanel>
                                <Action
                                    title="Delete Symlink"
                                    icon={Icon.Trash}
                                    style={Action.Style.Destructive}
                                    onAction={() => handleDeleteSymlink(symlink)}
                                />
                                <Action.OpenWith
                                    title="Open Source"
                                    path={symlink.source}
                                    shortcut={{ modifiers: ["cmd"], key: "o" }}
                                />
                                <Action.OpenWith
                                    title="Open Destination"
                                    path={symlink.destination}
                                    shortcut={{ modifiers: ["cmd", "shift"], key: "o" }}
                                />
                                <Action.CopyToClipboard
                                    title="Copy Source Path"
                                    content={symlink.source}
                                    shortcut={{ modifiers: ["cmd"], key: "c" }}
                                />
                                <Action.CopyToClipboard
                                    title="Copy Destination Path"
                                    content={symlink.destination}
                                    shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
                                />
                            </ActionPanel>
                        }
                    />
                );
            })}
            {symlinks.length === 0 && !isLoading && (
                <List.EmptyView
                    title="No symlinks found"
                    description="Create a new symlink using the Create Symlink command"
                    icon={Icon.Link}
                />
            )}
        </List>
    );
}
