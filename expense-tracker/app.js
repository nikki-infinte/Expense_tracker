const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const app = express();


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set('view engine', 'ejs');




// MongoDB connection
mongoose.connect('mongodb://localhost:27017/expenseDb');

const db = mongoose.connection;


const expenseSchema = new mongoose.Schema({
    name: String,
    amount: Number,
   currency: String,
    addToCalendar: { type: Boolean, default: true },
    date: { type: Date, default: Date.now }
});

const Expense = mongoose.model('Expense', expenseSchema);

db.on('error', (err) => {
    console.error("Error connecting to MongoDB:", err);
});
db.once('open', () => {
    console.log("Successfully connected to MongoDB");
});

app.post('/add-expense', async (req, res) => {
    try {
        const { name, amount, currency, date } = req.body;
        
        const expense = new Expense({
            name: name,
            amount: amount,
            currency: currency,
            date: date ? new Date(date) : new Date()
        });

        await expense.save();
        res.status(201).send('Expense added successfully');
    } catch (err) {
        console.error('Error adding expense:', err);
        res.status(500).send('Error adding expense');
    }
});

// Route to fetch expenses by specific date
app.get("/expenses/:date", async (req, res) => {
    const { date } = req.params;

    try {
        const expenses = await Expense.find({ date: { $gte: new Date(date), $lt: new Date(date + 'T23:59:59.999Z') } }).exec();
        res.json(expenses);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching expenses');
    }
});

//create an API which will send me data from database of particular  date 

app.get("/expense")



// Route to aggregate expenses per day
app.get("/expenses-aggregate", async (req, res) => {
    try {
        const results = await Expense.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
                    totalAmount: { $sum: '$amount' }
                }
            }
        ]).exec();

        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error aggregating expenses');
    }
});

// Existing routes (unchanged)
app.get("/", (req, res) => {
    res.render("index");
});

app.get("/track-daily", async (req, res) => {
    try {
        // Get the current date and set the start and end of the day
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);

        // Query for expenses between the start and end of the current day
        const expenses = await Expense.find({ date: { $gte: start, $lt: end } }).exec();
        
        // Render the chart with the fetched expenses
        res.render('charts', { expenses: expenses });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching expenses');
    }
});

app.get('/calendar', (req, res) => {
    res.render('calendar');
});

app.get('/api/get-expenses', async (req, res) => {
    try {
        const expenses = await Expense.find({ addToCalendar: true }).exec();
        res.json(expenses);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching expenses');
    }
});


app.get('/api/events', async (req, res) => {
    try {
        const events = await Expense.find({}).exec();
        const formattedEvents = events.map(event => ({
            title: event.description, // Adjust this based on your schema
            start: event.date,
            end: event.date,
        }));
        res.json(formattedEvents);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching events');
    }
});

// Start server
app.listen(3000, () => {
    console.log("Listening on port 3000");
});
