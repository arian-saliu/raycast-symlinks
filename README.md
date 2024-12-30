# Raycast Symlink Manager

A Raycast extension to easily create and manage symbolic links on macOS.

## Features

- Create symbolic links with a user-friendly interface
- List and manage existing symlinks
- Force creation option to replace existing links
- Visual indicators for valid/broken symlinks
- Easy access to source and destination paths

## Commands

### Create Symlink (`⌘ + K` > `Create Symlink`)

Create new symbolic links with the following options:

- **Name**: A unique friendly name for the symlink
- **Source**: Select the source file or directory
- **Destination**: Select the destination directory
- **Force Creation**: Option to replace existing symlinks

### List Symlinks (`⌘ + K` > `List Symlinks`)

View and manage your existing symlinks:

- See all created symlinks with their names and paths
- Visual status indicators (valid/broken)
- Search functionality to find specific symlinks
- Actions for each symlink:
    - Delete symlink (with confirmation)
    - Open source location
    - Open destination location
    - Copy source path
    - Copy destination path

## Keyboard Shortcuts

### In List View

- `⌘ + O`: Open source location
- `⌘ + ⇧ + O`: Open destination location
- `⌘ + C`: Copy source path
- `⌘ + ⇧ + C`: Copy destination path

## Installation

1. Install [Raycast](https://raycast.com/)
2. Open Raycast
3. Search for "Store" and open Raycast Store
4. Search for "Symlink Manager" and install

## Technical Details

- Symlinks are created using the `ln -s` command
- Symlink information is stored in a JSON file
- The extension validates paths and permissions before creating links
- Symlinks can be force-created with `ln -sf`

## Support

For issues and feature requests, please create an issue on the GitHub repository.
