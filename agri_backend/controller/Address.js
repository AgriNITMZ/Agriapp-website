const User = require('../models/Users')
const Address = require('../models/Address')
// create address controller

exports.createAddress = async (req, res) => {
    try {
        const userId = req.user.id
        const { Name,
            streetAddress,
            city,
            state,
            zipCode,
            mobile } = req.body


        // const existingAddress = await Address.findOne({ userId })

        const newAddress = new Address({
            Name,
            userId,
            streetAddress,
            city,
            state,
            zipCode,
            mobile

        })
        // add in user model
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        user.address.push(newAddress._id);
        await user.save();
        await newAddress.save()
        res.json({ msg: "Address created successfully" })


    } catch (error) {
        console.error(error.message)
        res.status(500).send("Server error")
    }
}

// get all addresses

exports.getAllAddresses = async (req, res) => {
    try {
        const userId = req.user.id

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const addresses = await Address.find({ userId });

        res.json(addresses)

    } catch (error) {
        console.error(error.message)
        res.status(500).send("Server error")
    }
}

exports.editAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const addressId = req.params.id; // Assuming the address ID is passed in the URL
        const { Name, streetAddress, city, state, zipCode, mobile } = req.body;

        // Find the address by ID and ensure it belongs to the logged-in user
        let address = await Address.findOne({ _id: addressId, userId });
        if (!address) {
            return res.status(404).json({ message: "Address not found." });
        }

        // Update the address fields
        address.Name = Name || address.Name;
        address.streetAddress = streetAddress || address.streetAddress;
        address.city = city || address.city;
        address.state = state || address.state;
        address.zipCode = zipCode || address.zipCode;
        address.mobile = mobile || address.mobile;

        // Save the updated address
        await address.save();
        res.json({ message: "Address updated successfully", address });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server error");
    }
};


// delete address by id

exports.deleteAddress = async (req, res) => {
    try {
        const userId = req.user.id
        const addressId = req.params.id

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const address = await Address.findByIdAndDelete(addressId);
        if (!address) {
            return res.status(404).json({ message: "Address not found." });
        }
        // remove from user also
        user.address.pull(addressId);
        await user.save();
        res.json({ msg: "Address deleted successfully" })


    } catch (error) {
        console.error(error.message)
        res.status(500).send("Server error")
    }
}

// update address by id
exports.updateAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const addressId = req.params.editingAddressId;
        const { Name, streetAddress, city, state, zipCode, mobile } = req.body;

        // Check if address exists and belongs to user
        const address = await Address.findOne({ _id: addressId, userId: userId });
        if (!address) {
            return res.status(404).json({ 
                success: false,
                message: "Address not found or you're not authorized to update this address" 
            });
        }

        // Update address
        const updatedAddress = await Address.findByIdAndUpdate(
            addressId,
            {
                Name,
                streetAddress,
                city,
                state,
                zipCode,
                mobile
            },
            { new: true } // Return updated document
        );

        res.status(200).json({
            success: true,
            message: "Address updated successfully",
            address: updatedAddress
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            success: false,
            message: "Server error while updating address"
        });
    }
}