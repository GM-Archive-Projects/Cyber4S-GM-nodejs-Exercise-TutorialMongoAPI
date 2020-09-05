require("dotenv").config();
const cors = require("cors");
const express = require("express");

const Tutorial = require("./models/Tutorial");

const getDate = require("./utils/getCurrentDateTime");
const morgan = require("morgan");

const app = express();
app.use(express.json());
app.use(cors());

//Morgan Middleware Token To Log Request Body
morgan.token("time", function (req, res) {
	return getDate();
});

//Morgan Middleware Token To Log Request Body
morgan.token("body", function (req, res) {
	return JSON.stringify(req.body);
});

//Morgan Middleware Function To Log Request Details
app.use(
	morgan(
		"Morgan Token =  :method :url :status :res[content-length] - :response-time ms :body :time"
	)
);
//Get Requests Area
//Get All Tutorials
app.get('/api/tutorials', async (req, res) => {
    if(req.query.title){
      try{
      const result = await Tutorial.find({ title: {$regex: `.*${req.query.title}*`} })
      res.send(result);
      } catch(err) {
        console.log(err)
        res.status(400).end()
      }
    }
    else{
    try {
      const tutorials = await Tutorial.find({});
      res.send(tutorials);
    } catch (err) {
      res.status(400).send(err.message);
    }
  }
  });

//Get Specific Tutorial
app.get("/api/tutorials/published", (req, res) => {
    Tutorial.find({published: true}).then((publishedTutorials) => {
        res.send(publishedTutorials)
    }).catch((err) => {
        res.status(400).send(err.message)

    })
    })
//Get Specific Tutorial
app.get("/api/tutorials/:id", async (req, res) => {
	try {
		const tutorial = await Tutorial.findById(req.params.id);
		res.send(tutorial);
	} catch (err) {
		res.status(400).send(err.message);
	}
});

//Post Request Area
//Speicifc Post Request
app.post("/api/tutorials", (req, res, next) => {
	//PostNew Tutorial to Tutorials
	const body = req.body;

	const tutorial = new Tutorial({
		title: body.title,
		published: body.published,
	});
	tutorial
		.save()
		.then((savedTutorial) => savedTutorial.toJSON())
		.then((savedAndFormattedTutorial) => {
			res.json(savedAndFormattedTutorial);
		})
		.catch((error) => next(error));
});

//===============Put Requests Area===============
//====Change Specific Person===
app.put("/api/tutorials/:id", (req, res, next) => {
	const body = req.body;

	const tutorial = {
		title: body.title,
		published: body.published,
	};

	Tutorial.findByIdAndUpdate(req.params.id, tutorial, { new: true })
		.then((updatedTutorial) => {
			console.log("Updated");
			res.json(updatedTutorial);
		})
		.catch((err) => next(err));
});

//===============Delete Requests Area===============
//====Delete Specific Note===
app.delete("/api/tutorials/:id", (req, res, next) => {
	Tutorial.findByIdAndRemove(req.params.id)
		.then((result) => {
			console.log(`Tutorial Id : ${req.params.id} Has been Deleted`);
			res.status(204).end();
		})
		.catch((error) => next(error));
});




const unknownEndpoint = (req, res) => {
	res.status(404).send({
		error: `Unkown Endpoint URL: http://localhost:${PORT}${req.path}`,
	});
};

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
	console.error(error.message);

	if (error.name === "CastError") {
		return response.status(400).send({ error: "malformatted id" });
	} else if (error.name === "ValidationError") {
		return response.status(400).json({ error: error.message });
	}
	next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
