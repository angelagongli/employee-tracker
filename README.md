# Employee Tracker

## Description
The employee tracker is a command-line application that allows a user to view, create, update and delete information about employees, roles and departments of a company stored in a MySQL database.

## Usage
The employee tracker is run at the command line using [Node.js](https://nodejs.org/en/), and the employee database is created using [MySQL](https://www.mysql.com/). Navigate to the directory containing index.js and package.json, and `npm install` the dependencies. Run schema.sql and seed.sql to initialize the MySQL employee database and populate it with sample data. Then run the application by typing `node index.js` and following the prompts, as shown below:

![employee tracker demo gif](/employee-tracker-demo.gif)

View as [.mp4 file](https://github.com/angelagongli/employee-tracker/blob/master/employee-tracker-demo.mp4) (larger).

The employee tracker will continue prompting the user about different available interactions with the database until Ctrl + C is pressed to exit.

## Credits
The [inquirer](https://www.npmjs.com/package/inquirer) and [mysql](https://www.npmjs.com/package/mysql) npm modules are used by the application to interact with the user and the MySQL employee database respectively.

The [console.table](https://www.npmjs.com/package/console.table) and [figlet](https://www.npmjs.com/package/figlet) npm packages are used for their nice table printing and fonts.

The design of the employee tracker is based on guidelines by the Coding Boot Camp at UT.

## License
Copyright (c) Angela Li. All rights reserved.
Licensed under the [MIT License](LICENSE).