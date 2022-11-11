const path = require("path");
const dishes = require(path.resolve("src/data/dishes-data"));
const nextId = require("../utils/nextId");

//Functional Middleware functions:

//if dish exist it will be retrieved by ID
//if dish does not exist it will return error 404 with corresponding message
function dishExists (req, res, next) {
   const dishId = req.params.dishId;
   res.locals.dishId = dishId;
   const foundDish = dishes.find((dish) => dish.id === dishId);
   if (!foundDish) {
      return next({
         status: 404, 
         message: `Dish not found: ${dishId}` });
   }
   res.locals.dish = foundDish;
};
//Dish must have a name. If the dish does not have a name or 0 characters return error with corresponding message
function dishValidName (req, res, next) {
   const { data = null } = req.body;
   res.locals.newDD = data;
   const dishName = data.name;
   if (!dishName || dishName.length === 0) {
      return next({
         status: 400,
         message: "Dish must include a name",
      });
   }
};
//Dish must contain a description. If there is no description or 0 characters return error with message asking for description
function dishHasValidDescription (req, res, next) {
   const dishDescription = res.locals.newDD.description;
   if (!dishDescription || dishDescription.length === 0) {
      return next({
         status: 400,
         message: "Dish must include a description",
      });
   }
};
//Dish must have a valid price. If there is no proce, if it is not a number, or
// 0 will send error reqesting a price
function dishHasValidPrice (req, res, next) {
   const dishPrice = res.locals.newDD.price;
   if (!dishPrice || typeof dishPrice != "number" || dishPrice <= 0) {
      return next({
         status: 400,
         message: "Dish must have a price that is an integer greater than 0",
      });
   }
};
// Dishes must have a valid imagine. If the length of chars is 0 or there is no image. Will require an image url
function dishHasValidImage (req, res, next) {
   const dishImage = res.locals.newDD.image_url;
   if (!dishImage || dishImage.length === 0) {
      return next({
         status: 400,
         message: "Dish must include an image_url",
      });
   }
};
//Dish ID's must match to locate. If there is no ID or non matching ID an error will be returned asking for ID for the correct dish
function dishIdMatches (req, res, next) {
   const paramId = res.locals.dishId;
   const { id = null } = res.locals.newDD;
   if (paramId != id && id) {
      return next({
         status: 400,
         message: `Dish id does not match route id. Dish: ${id}, Route: ${paramId}`,
      });
   }
};

//Clarity Middleware Functions
function createValidation (req, res, next) {
   dishValidName(req, res, next);
   dishHasValidDescription(req, res, next);
   dishHasValidPrice(req, res, next);
   dishHasValidImage(req, res, next);
   next();
};

function readValidation (req, res, next) {
   dishExists(req, res, next);
   next();
};

function updateValidation (req, res, next) {
   dishExists(req, res, next);
   dishValidName(req, res, next);
   dishHasValidDescription(req, res, next);
   dishHasValidPrice(req, res, next);
   dishHasValidImage(req, res, next);
   dishIdMatches(req, res, next);
   next();
};

//Handlers:
function create(req, res) {
   const newDishData = res.locals.newDD;
   newDishData.id = nextId();
   dishes.push(newDishData);
   res.status(201).json({ data: newDishData });
}

function read(req, res) {
   res.status(200).json({ data: res.locals.dish });
}

function update(req, res) {
   const newData = res.locals.newDD;
   const oldData = res.locals.dish;
   const index = dishes.indexOf(oldData);
   for (const key in newData) {
      dishes[index][key] = newData[key];
   }
   res.status(200).json({ data: dishes[index] });
}

function list(req, res) {
   res.status(200).json({ data: dishes });
}

module.exports = {
   create: [createValidation, create],
   read: [readValidation, read],
   update: [updateValidation, update],
   list,
};
