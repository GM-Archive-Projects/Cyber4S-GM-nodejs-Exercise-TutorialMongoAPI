const mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);

const url = process.env.MONGODB_URI;

console.log("connecting to", url);

mongoose
	.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
	.then((result) => {
		console.log("connected to MongoDB");
	})
	.catch((error) => {
		console.log("error connecting to MongoDB:", error.message);
	});

const tutorialScehema = new mongoose.Schema({
	title: {
		type: String,
		minlength: 2,
		required: true,
	},
    published: { type: Boolean }

});

tutorialScehema.set("toJSON", {
	transform: (document, returnedObject) => {
		returnedObject.id = returnedObject._id.toString();
		delete returnedObject._id;
		delete returnedObject.__v;
	},
});
module.exports = mongoose.model("Tutorial", tutorialScehema);
