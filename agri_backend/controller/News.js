const News = require('../models/News');
const{asyncHandler}=require('../utils/error')

// @desc Add News
exports.addNews = asyncHandler(async (req, res) => {
 
        const { title, date, source, image, description } = req.body;
        const news = new News({
            title,
            date: new Date(date), // Convert date to Date type
            source,
            image,
            description
        });

        await news.save();
        res.status(201).json({ success: true, message: "News added successfully", data: news });
  
});

// @desc Get All News with Pagination
exports.getAllNews = asyncHandler(async (req, res) => {
        let { page, limit } = req.query;
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const skip = (page - 1) * limit;

        const newsList = await News.find().sort({ date: -1 }).skip(skip).limit(limit);
        const total = await News.countDocuments();

        res.status(200).json({
            success: true,
            page,
            limit,
            total,
            data: newsList
        });
   
});

// @desc Get Single News by ID
exports.getNewsById = asyncHandler(async (req, res) => {
        const news = await News.findById(req.params.id);
        if (!news) return res.status(404).json({ success: false, message: "News not found" });

        res.status(200).json({ success: true, data: news });
  
});

// @desc Update News
exports.updateNews = asyncHandler(async (req, res) => {
   
        const { title, date, source, image, description } = req.body;
        const updatedNews = await News.findByIdAndUpdate(req.params.id, {
            title,
            date: new Date(date), // Ensure date is stored as Date type
            source,
            image,
            description
        }, { new: true });

        if (!updatedNews) return res.status(404).json({ success: false, message: "News not found" });

        res.status(200).json({ success: true, message: "News updated successfully", data: updatedNews });
   
});

// @desc Delete News
exports.deleteNews = asyncHandler(async (req, res) => {
    
        const deletedNews = await News.findByIdAndDelete(req.params.id);
        if (!deletedNews) return res.status(404).json({ success: false, message: "News not found" });

        res.status(200).json({ success: true, message: "News deleted successfully" });
    
});
