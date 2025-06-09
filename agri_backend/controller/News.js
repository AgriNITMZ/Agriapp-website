const News = require('../models/News');

// @desc Add News
exports.addNews = async (req, res) => {
    try {
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
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc Get All News with Pagination
exports.getAllNews = async (req, res) => {
    try {
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
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc Get Single News by ID
exports.getNewsById = async (req, res) => {
    try {
        const news = await News.findById(req.params.id);
        if (!news) return res.status(404).json({ success: false, message: "News not found" });

        res.status(200).json({ success: true, data: news });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc Update News
exports.updateNews = async (req, res) => {
    try {
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
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc Delete News
exports.deleteNews = async (req, res) => {
    try {
        const deletedNews = await News.findByIdAndDelete(req.params.id);
        if (!deletedNews) return res.status(404).json({ success: false, message: "News not found" });

        res.status(200).json({ success: true, message: "News deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
