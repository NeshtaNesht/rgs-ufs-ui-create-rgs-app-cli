'use strict';
const chalk = require('chalk');
const commander = require('commander');
const fs = require('fs-extra');
const readline = require('readline-sync');
const path = require('path');
const replace = require('replace-in-file');
const spawn = require('cross-spawn');

const packageJson = require('./package.json');
const newJson = require('./template/package.json');

let projectDirectory;
let myModuleName;
let projectName;

function init() {
  const program = new commander.Command(packageJson.name)
    .version(packageJson.version)
    .arguments('<каталог-проекта>')
    .usage(`${chalk.green('<каталог-проекта>')}`)
    .action((name) => {
      projectDirectory = name;
    })
    .parse(process.argv);
  if (typeof projectDirectory === 'undefined') {
    console.error(
      chalk.yellow(
        'Необходимо задать рабочий каталог. Пример: create-rgs-app ./my-project'
      )
    );
    process.exit(1);
  }
  console.log(
    chalk.green('Запущена утилита создания каркаса нового модуля РГС')
  );
  projectName = readline.question(
    chalk.bold.yellow(
      'Введите наименование проекта (для файла packaje.json. Например, rgs-my-clients): '
    )
  );
  if (!projectName) {
    console.error(
      chalk.bold.redBright('Ошибка: Неверно указано наименование модуля')
    );
    process.exit(1);
  }
  myModuleName = readline.question(
    chalk.bold.yellow('Введите наименование модуля на английском: ')
  );
  const pattern = /^[^\s()-]*$/;
  if (!pattern.test(myModuleName)) {
    console.error(
      chalk.bold.redBright(
        'Ошибка: Наименование модуля может содержать только нижнее подчеркивание в качестве разделителя'
      )
    );
    process.exit(1);
  }
  // agileTeamName = readline.question(chalk.bold.yellow('Название команды: '));
  // console.log(`Вы ввели: ${myModuleName}`);
  createApp(projectDirectory, myModuleName, projectName);
}

function createApp(directory, moduleName, projName) {
  console.log(chalk.bold.green('Началась инициализация приложения'));

  const initializePackageJson = {
    name: projName,
  };

  fs.mkdirSync(directory);
  console.log(chalk.green(`Каталог: ${directory}`));
  try {
    fs.copySync(path.resolve(__dirname, './template'), directory);
    console.log(chalk.green('Шаблон скопирован'));
  } catch (err) {
    console.log('Ошибка при копировании каталога: ', err);
    process.exit(1);
  }
  fs.removeSync(path.resolve(directory, './package.json'));
  fs.writeFileSync(
    path.resolve(directory, 'package.json'),
    JSON.stringify(
      {
        ...initializePackageJson,
        ...newJson,
      },
      null,
      2
    )
  );
  console.log(chalk.yellow('Создан package.json'));

  const options = {
    files: path.resolve(directory, '.env'),
    from: /{module-name}/g,
    to: moduleName,
  };
  try {
    replace.sync(options);
    console.log(chalk.green('Файл .env отредактирован'));
  } catch (err) {
    console.error(err);
  }

  install(directory);
}

function install(directory) {
  console.log(chalk.bold.green('Начинаю установку зависимостей'));
  process.chdir(path.resolve(directory));
  new Promise((resolve, reject) => {
    const child = spawn('npm', ['install'], { stdio: 'inherit' });
    child.on('close', (code) => {
      if (code !== 0) {
        reject({
          command: 'Ошибка при установке зависимостей',
        });
        return;
      }
      resolve();
    });
  })
    .then(() => {
      const child = spawn('npm', ['run', 'start:dev'], { stdio: 'inherit' });
      child.on('close', (code) => {
        if (code !== 0) {
          reject({
            command: 'Ошибка при запуске приложения',
          });
          return;
        }
      });
    })
    .catch(({ command }) => {
      console.error(command);
    });
}

module.exports = {
  init,
};
