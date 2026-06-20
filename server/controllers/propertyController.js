const Property = require("../models/property");

// ADD PROPERTY
const addProperty = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      location,
      bedrooms,
      bathrooms,
      area,
    } = req.body;

    const property = await Property.create({
      title,
      description,
      price:    Number(price),
      location,
      bedrooms: Number(bedrooms) || 0,
      bathrooms:Number(bathrooms) || 0,
      area:     Number(area) || 0,
      image:    req.file ? `/uploads/${req.file.filename}` : null,
      owner:    req.user.id,
    });

    res.status(201).json({
      success: true,
      property,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// GET ALL PROPERTIES
const getAllProperties = async (req, res) => {
  try {
    const properties = await Property.find().populate('owner', 'name email');

    res.status(200).json({
      success: true,
      count: properties.length,
      properties,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// GET SINGLE PROPERTY
const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    res.status(200).json({
      success: true,
      property,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// UPDATE PROPERTY
const updateProperty = async (req, res) => {
  try {
    const updateData = {
      title:       req.body.title,
      description: req.body.description,
      price:       Number(req.body.price),
      location:    req.body.location,
      bedrooms:    Number(req.body.bedrooms) || 0,
      area:        Number(req.body.area) || 0,
    };
    if (req.file) updateData.image = `/uploads/${req.file.filename}`;

    const property = await Property.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
      }
    );

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    res.status(200).json({
      success: true,
      property,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// DELETE PROPERTY
const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndDelete(
      req.params.id
    );

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Property deleted successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


module.exports = {
  addProperty,
  getAllProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
};