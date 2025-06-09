const Category = require("../models/Category")
const ParenstCategory = require('../models/ParentCategory');
const { uploadUmageToCloudinary } = require("../utils/ImageUploader");

exports.createCategory = async (req, res) => {
    try {
        const { name, description, parentCategoryId } = req.body;

        if (!name || !description || !parentCategoryId) {
            return res.status(400).json({
                success: false,
                msg: error,
                msg: "Please provide a name for the category"
            })
        }

        const image = req.files.image
        const uploadImage = await uploadUmageToCloudinary(image, process.env.FOLDER_NAME, 1000, 1000)
        // create entry in db
        const category = new Category({
            name,
            description,
            image: uploadImage.secure_url
        })

        await ParenstCategory.findByIdAndUpdate(
            parentCategoryId,
            { $push: { subcategories: category._id } },
            { new: true }

        )
        await category.save()
        res.status(200).json({
            success: true,
            data: category,
            message: "Category created successfully"
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: error.message,
            message: "Error during category creation"
        })

    }
}
// create parent category

exports.createParentCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) {
            return res.status(400).json({
                success: false,
                msg: error,
                msg: "Please provide a name for the parent category"
            })
        }
        const image = req.files.image
        const uploadImage = await uploadUmageToCloudinary(image, process.env.FOLDER_NAME, 1000, 1000)
        // create entry in db
        const parentCategory = new ParenstCategory({
            name,
            description,
            image: uploadImage.secure_url  // image url from cloudinary
        })


        await parentCategory.save()
        res.status(200).json({
            success: true,
            data: parentCategory,
            message: "Parent category created successfully"
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: error.message,
            message: "Error during parent category creation"
        })

    }
}


// fetch parent category

exports.getAllParentCategories = async (req, res) => {
    try {
        const parentCategories = await ParenstCategory.find().populate("subcategories")
        res.status(200).json({
            success: true,
            data: parentCategories,
            message: "Parent categories fetched successfully"
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: error.message,
            message: "Error during parent category fetching"
        })

    }
}

exports.getParentCategoriesList = async (req, res) => {
    try {
        const parentCategories = await ParenstCategory.find()
            .select("_id name image") // Select only _id and name
            .populate("subcategories", "_id name image"); // If you want only id and name of subcategories as well

        res.status(200).json({
            success: true,
            data: parentCategories,
            message: "Parent categories fetched successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: error.message,
            message: "Error during parent category fetching"
        });
    }
};

// get one parent category

exports.getParentCategoryById = async (req, res) => {
    try {
        const { parentCategoryId } = req.body
        console.log("parent category id", parentCategoryId)
        const parentCategory = await ParenstCategory.findById(parentCategoryId)
            .populate({
                path: "subcategories",
                populate: {
                    path: "product",
                    //        select: "name price description"   Only select these fields from products
                    // You can also add match if needed:
                    // match: { price: { $gt: 100 } }
                }
            })
            .exec();
        if (!parentCategory) {
            return res.status(404).json({
                success: false,
                msg: error,
                message: "Parent category not found"
            })
        }
        res.status(200).json({
            success: true,
            data: parentCategory,
            message: "Parent category fetched successfully"
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: error.message,
            message: "Error during parent category fetching"
        })

    }
}



// fetch categories

exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find()
        res.status(200).json({
            success: true,
            data: categories,
            message: "Categories fetched successfully"
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: error.message,
            message: "Error during category fetching"
        })

    }
}


// specific categories

exports.getCategoryById = async (req, res) => {
    try {
        const { categoryId } = req.body
        const category = await Category.findById(categoryId).populate("product")
        if (!category) {
            return res.status(404).json({
                success: false,
                msg: error,
                message: "Category not found"
            })
        }
        res.status(200).json({
            success: true,
            data: category,
            message: "Category fetched successfully"
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: error.message,
            message: "Error during category fetching"
        })

    }
}
