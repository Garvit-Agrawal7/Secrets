import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";

const app = express();
mongoose.connect("mongodb://localhost:27017/loginDB")

const dbSchema = {
	email: String,
	password: String
};
const Login = new mongoose.model("Login", dbSchema);


app.use(express.static("public"))
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) =>{
	res.render("home.ejs")
})

app.get("/login", (req, res) => {
	res.render("login.ejs")
})

app.get("/register", (req, res) => {
	res.render("register.ejs")
})

app.post("/register", (req, res) => {
	const newUser = new Login({
		email: req.body.username,
		password: req.body.password
	});
	newUser.save()
		.then(function () {
			res.render("secrets.ejs")
		})
		.catch(function (err) {
			console.log(err)
		})
})

app.post("/login", (req, res) => {
	const username = req.body.username
	const password = req.body.password
	Login.findOne({email:username})
		.then(function (foundUser) {
			if (foundUser.password === password) {
				res.render("secrets.ejs")
			}
		})
		.catch(function (err) {
			console.log(err)
		})
})


app.listen(3000)