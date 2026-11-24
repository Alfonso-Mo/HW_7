import express from "express";
import pg from "pg";

const app = express();

const pool = new pg.Pool({
    host: "localhost",
    user: "postgres",
    password: process.env.DB_PASSWORD,
    database: "dashboard",
    port: 5432
});

app.use(express.static("public"));
app.set("view engine", "ejs");

app.get("/", async (req, res) => {

    const customerNum = await pool.query("SELECT count(*) FROM customers");

    const customers = await pool.query("SELECT * FROM customers ORDER BY id LIMIT $1 OFFSET $2", [10, 0]);

    const revenueAmt = await pool.query("SELECT sum(saleamount) FROM sales");

    const sales = await pool.query("SELECT products.name, sales.quantity, sales.saleamount FROM sales LEFT JOIN products ON sales.productid = products.id ORDER BY sales.id ASC");

    const ordersAmt = await pool.query("SELECT count(quantity) FROM orders");

    const issuesAmt = await pool.query("SELECT count(id) FROM alerts WHERE type = 'issues'");

    const issues = await pool.query("SELECT * FROM alerts WHERE type = 'issues'");

    const notifAmt = await pool.query("SELECT count(id) FROM alerts WHERE type = 'notifications'");

    const notifications = await pool.query("SELECT * FROM alerts WHERE type = 'notifications'");

    const tasks = await pool.query("SELECT * FROM alerts WHERE type = 'tasks'");

    res.render("index", {
        customerNum: customerNum.rows[0].count,
        customers: customers.rows,
        revenueAmt: revenueAmt.rows[0].sum,
        sales: sales.rows,
        ordersAmt: ordersAmt.rows[0].count,
        issuesAmt: issuesAmt.rows[0].count,
        issues: issues.rows,
        notifAmt: notifAmt.rows[0].count,
        notifications: notifications.rows,
        tasks: tasks.rows
    });
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});