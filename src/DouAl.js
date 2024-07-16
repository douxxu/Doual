#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
require('colors');
const readlineSync = require('readline-sync');

const SCRIPT_NAME = path.basename(__filename);
const ALIAS_FILE_PATH = path.join(process.env.HOME, '.doual_aliases');
const SHELL_RC_FILES = {
    bash: '.bashrc',
    zsh: '.zshrc',
    fish: '.config/fish/config.fish'
};

const getShellRcFile = () => {
    const shell = process.env.SHELL || '';
    if (shell.includes('zsh')) {
        return SHELL_RC_FILES.zsh;
    } else if (shell.includes('fish')) {
        return SHELL_RC_FILES.fish;
    }
    return SHELL_RC_FILES.bash;
};

const log = (message, type = 'info') => {
    const typeMap = {
        info: '[i]'.blue,
        success: '[✔]'.green,
        error: '[✘]'.red
    };
    console.log(`${typeMap[type]} ${message.grey}`);
};

const showHelp = () => {
    console.log(`
Usage:
  dal <command> [options]

Commands:
  create <initial_command> <alias> [-a <arguments>] [-r <true|false>]
    Create or update an alias.
    -a, --args      Arguments for the initial command
    -r, --root      Run as root (true or false)

  remove <alias>
    Remove an alias.

  list
    List all aliases.

  <alias>
    Execute the specified alias.
`);
};

const saveAlias = (command, alias, options) => {
    const aliasData = { command, alias, options };
    let aliases = [];
    if (fs.existsSync(ALIAS_FILE_PATH)) {
        aliases = JSON.parse(fs.readFileSync(ALIAS_FILE_PATH));
    }
    const existingAliasIndex = aliases.findIndex(item => item.alias === alias);
    if (existingAliasIndex !== -1) {
        aliases[existingAliasIndex] = aliasData;
    } else {
        aliases.push(aliasData);
    }
    fs.writeFileSync(ALIAS_FILE_PATH, JSON.stringify(aliases));

    const rcFilePath = path.join(process.env.HOME, getShellRcFile());
    const aliasCommand = `alias ${alias}='${options.RunAsRoot ? 'sudo ' : ''}${command}${options.InitialArgs ? ` ${options.InitialArgs}` : ''}'\n`;
    fs.appendFileSync(rcFilePath, aliasCommand);
    log(`Alias ${alias} added to ${rcFilePath}`, 'success');

    log(`Please reload your terminal for the changes to take effect.`, 'info');
};

const deleteAlias = alias => {
    if (!fs.existsSync(ALIAS_FILE_PATH)) return;
    let aliases = JSON.parse(fs.readFileSync(ALIAS_FILE_PATH));
    aliases = aliases.filter(item => item.alias !== alias);
    fs.writeFileSync(ALIAS_FILE_PATH, JSON.stringify(aliases));

    const rcFilePath = path.join(process.env.HOME, getShellRcFile());
    const rcFileContent = fs.readFileSync(rcFilePath, 'utf-8');
    const newRcFileContent = rcFileContent.replace(new RegExp(`alias ${alias}=.*\n`, 'g'), '');
    fs.writeFileSync(rcFilePath, newRcFileContent);
    log(`Alias ${alias} removed from ${rcFilePath}`, 'success');

    log(`Please reload your terminal for the changes to take effect.`, 'info');
};

const listAliases = () => {
    if (!fs.existsSync(ALIAS_FILE_PATH)) {
        console.log('No aliases found.'.yellow);
        return;
    }
    const aliases = JSON.parse(fs.readFileSync(ALIAS_FILE_PATH));
    if (aliases.length === 0) {
        console.log('No aliases found.'.yellow);
        return;
    }
    aliases.forEach(alias => {
        console.log(`Alias: ${alias.alias.cyan}, Command: ${alias.command.magenta}, Options: ${JSON.stringify(alias.options).grey}`);
    });
};

const executeAlias = aliasName => {
    if (!fs.existsSync(ALIAS_FILE_PATH)) return;
    const aliases = JSON.parse(fs.readFileSync(ALIAS_FILE_PATH));
    const alias = aliases.find(item => item.alias === aliasName);
    if (!alias) {
        console.log(`Alias ${aliasName} not found.`.red);
        return;
    }
    let command = alias.command;
    if (alias.options.InitialArgs) {
        command += ` ${alias.options.InitialArgs}`;
    }
    if (alias.options.RunAsRoot) {
        command = `sudo ${command}`;
    }
    try {
        const output = execSync(command, { stdio: 'inherit' });
        console.log(output.toString());
    } catch (error) {
        console.error(`Error executing alias: ${error.message}`.red);
    }
};

const parseArgs = () => {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        showHelp();
        process.exit(1);
    }

    const command = args[0];
    const options = {
        initialArgs: '',
        runAsRoot: false
    };

    for (let i = 1; i < args.length; i++) {
        if (args[i] === '-a' || args[i] === '--args') {
            options.initialArgs = args[++i];
        } else if (args[i] === '-r' || args[i] === '--root') {
            options.runAsRoot = args[++i].toLowerCase() === 'true';
        } else if (command === 'create' && !options.initialCommand) {
            options.initialCommand = args[i];
        } else if (command === 'create' && !options.alias) {
            options.alias = args[i];
        } else if (command === 'remove' && !options.alias) {
            options.alias = args[i];
        } else if (!command) {
            options.command = args[i];
        }
    }

    return { command, options };
};

const { command, options } = parseArgs();

const packageJson = require('../package.json');
console.log(`Starting ${SCRIPT_NAME} v${packageJson.version}`.cyan);

switch (command) {
    case 'create':
        if (!options.initialCommand || !options.alias) {
            showHelp();
            process.exit(1);
        }
        log(`Creating or updating alias ${options.alias}...`, 'info');
        saveAlias(options.initialCommand, options.alias, { InitialArgs: options.initialArgs, RunAsRoot: options.runAsRoot });
        log(`Alias ${options.alias} created or updated successfully.`, 'success');
        break;
    case 'remove':
        if (!options.alias) {
            showHelp();
            process.exit(1);
        }
        log(`Do you want to remove the alias ${options.alias}? [${'Y'.green}${'/'.grey}${'n'.red}${']'.grey}${': '.grey} `, 'info');
        const confirm = readlineSync.question();
        if (confirm.toLowerCase() === 'y' || confirm === '') {
            log(`Removing alias ${options.alias}...`, 'info');
            deleteAlias(options.alias);
            log(`Alias ${options.alias} removed successfully.`, 'success');
        }
        break;
    case 'list':
        listAliases();
        break;
    default:
        executeAlias(command);
        break;
}
