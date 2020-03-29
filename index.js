#!/usr/bin/env node

//colorizes output
const chalk = require('chalk')
//clears the terminal screen
const clear = require('clear')
//creates ASCII art from text
const figlet = require('figlet')
const files = require('./lib/files');
const github = require('./lib/github');
const repo = require('./lib/repo');

clear();

//print GINIT using chalk and figlet
console.log(
  chalk.yellow(
    figlet.textSync('Ginit', { horizontalLayout: 'full' })
  )
);

// in case a .git file is present in current directory, process is abandoned
if(files.directoryExists('.git')){
    console.log(chalk.red('Already a Git repository!'));
    process.exit();
}

//Fetch token from config store; stored in /home/nils/.config/configstore/ginit.json
  const getGithubToken = async () => {
    let token = github.getStoredGithubToken();

    // if token exists return it
    if(token) {
      return token;
    }
  
    // No token found, use credentials to access GitHub account
    token = await github.getPersonalAccesToken();
  
    return token;
  };

  const run = async () => {
    try {
      // Retrieve & Set Authentication Token
      const token = await getGithubToken();
      github.githubAuth(token);
  
      // Create remote repository
      const url = await repo.createRemoteRepo();
  
      // Create .gitignore file
      await repo.createGitignore();
  
      // Set up local repository and push to remote
      await repo.setupRepo(url);
  
      console.log(chalk.green('All done!'));
    } catch(err) {
        if (err) {
          switch (err.status) {
            case 401:
              console.log(chalk.red('Couldn\'t log you in. Please provide correct credentials/token.'));
              break;
            case 422:
              console.log(chalk.red('There is already a remote repository or token with the same name'));
              break;
            default:
              console.log(chalk.red(err));
          }
        }
    }
  };

  run();
