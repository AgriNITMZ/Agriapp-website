const Scheme = require('../models/Scheme');

// Add a new scheme
exports.addScheme = async (req, res) => {
    try {
        const scheme = new Scheme(req.body);
        await scheme.save();
        res.status(201).json({ success: true, message: "Scheme added successfully!", data: scheme });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to add scheme", error: error.message });
    }
};

// Get all schemes with pagination
exports.getSchemes = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const schemes = await Scheme.find().skip(skip).limit(limit);
        const total = await Scheme.countDocuments();

        res.json({
            success: true,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: schemes
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch schemes", error: error.message });
    }
};

// Get a single scheme by ID
exports.getSchemeById = async (req, res) => {
    try {
        const scheme = await Scheme.findById(req.params.id);
        if (!scheme) return res.status(404).json({ success: false, message: "Scheme not found" });

        res.json({ success: true, data: scheme });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error retrieving scheme", error: error.message });
    }
};

// Update a scheme
exports.updateScheme = async (req, res) => {
    try {
        const scheme = await Scheme.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!scheme) return res.status(404).json({ success: false, message: "Scheme not found" });

        res.json({ success: true, message: "Scheme updated successfully", data: scheme });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating scheme", error: error.message });
    }
};

// Delete a scheme
exports.deleteScheme = async (req, res) => {
    try {
        const scheme = await Scheme.findByIdAndDelete(req.params.id);
        if (!scheme) return res.status(404).json({ success: false, message: "Scheme not found" });

        res.json({ success: true, message: "Scheme deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error deleting scheme", error: error.message });
    }
};
