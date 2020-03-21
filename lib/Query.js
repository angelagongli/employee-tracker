const mysql = require("mysql");

class Query {
    constructor() {
        this.connection = mysql.createConnection({
            host: "localhost",
            port: 3306,
            user: "root",
            password: "your_password",
            database: "employees_db"
        });
    }
    
    custom(sql, args) {
        return new Promise((resolve, reject) => {
            this.connection.query(sql, args, (err, res) => {
                if (err) {
                    return reject(err);
                }
                resolve(res);
            });
        });
    }

    select(table) {
        return new Promise((resolve, reject) => {
            this.connection.query("SELECT * FROM " + table,
                (err, res) => {
                if (err) {
                    return reject(err);
                }
                resolve(res);
            });
        });
    }

    selectWhere(table, args) {
        return new Promise((resolve, reject) => {
            this.connection.query(`SELECT * FROM ${table} WHERE ?`,
                args,
                (err, res) => {
                if (err) {
                    return reject(err);
                }
                resolve(res);
            });
        });
    }

    insert(table, args) {
        return new Promise((resolve, reject) => {
            this.connection.query(`INSERT INTO ${table} SET ?`,
                args,
                (err, res) => {
                if (err) {
                    return reject(err);
                }
                resolve(res);
            });
        });
    }

    updateWhere(table, args) {
        return new Promise((resolve, reject) => {
            this.connection.query(`UPDATE ${table} SET ? WHERE ?`,
                args,
                (err, res) => {
                if (err) {
                    return reject(err);
                }
                resolve(res);
            });
        });
    }

    deleteWhere(table, args) {
        return new Promise((resolve, reject) => {
            this.connection.query(`DELETE FROM ${table} WHERE ?`,
                args,
                (err, res) => {
                if (err) {
                    return reject(err);
                }
                resolve(res);
            });
        });
    }
}

module.exports = Query;
