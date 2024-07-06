# 🚀 DouAl - Alias Manager

DouAl is a simple and efficient alias manager that allows you to create, list, and delete aliases for your command line. It works on macOS and most Linux distributions.

## 📀 Requirements

To use DouAl, you need the following:

**Base Requirements:**
- [Node.js](https://nodejs.org/en)
- [npm](https://www.npmjs.com/package/npm)

**Packages:**
- [colors](https://www.npmjs.com/package/colors)
- [readline-sync](https://www.npmjs.com/package/readline-sync)

*Note: All these packages are available on [npmjs.org](https://npmjs.com) and can be installed with the command `npm install <package-name>`.*

## 🖥 Installation

To install DouAl, follow these steps:

1. Ensure you have [Node.js](https://nodejs.org/en) and [npm](https://www.npmjs.com/package/npm) installed on your device.
2. Open a terminal.
3. Install DouAl with npm:

```bash
npm install -g DouAl
```


## ⚡️ Using DouAl

### Create an Alias

You can create an alias using the following command:

```bash
dal create <initial_command> <alias> [-a <arguments>] [-r <true|false>]
```

**Options:**
- `-a, --args <arguments>`: Arguments for the initial command
- `-r, --root <true|false>`: Run as root

**Example:**

```bash
dal create "ls -la" ll -a "--color=auto"
```

### Delete an Alias

You can delete an alias using the following command:

```bash
dal delete <alias>
```

**Example:**

```bash
dal delete ll
```

### List All Aliases

You can list all aliases using the following command:

```bash
dal list
```

### Execute an Alias

To execute an alias, simply type the alias name in the terminal:

```bash
<alias>
```

**Example:**

```bash
ll
```

## 📝 Example Usage

### Creating an Alias

```bash
dak create "ls -la" ll -a "--color=auto"
```

Output:

```
Starting DouAl.js v1.0.0
[i] Creating or updating alias ll...
[✔] Alias ll added to ~/.zshrc
[✔] Alias ll created or updated successfully.
[i] Please reload your terminal for the changes to take effect.
```

### Deleting an Alias

```bash
dal delete ll
```

Output:

```
Starting DouAl.js v1.0.0
[i] Do you want to remove the alias ll? ([Y]/n): y
[i] Removing alias ll...
[✔] Alias ll removed from ~/.zshrc
[✔] Alias ll removed successfully.
[i] Please reload your terminal for the changes to take effect.
```

### Listing All Aliases

```bash
dal list
```

Output:

```
Starting DouAl.js v1.0.0
Alias: ll, Command: ls -la, Options: {"InitialArgs":"","RunAsRoot":false}
```

## 📝 License

This project is licensed under the MIT License.
