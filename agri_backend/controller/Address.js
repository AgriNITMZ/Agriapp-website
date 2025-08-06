const User = require('../models/Users')
const Address = require('../models/Address')
const {asyncHandler}=require('../utils/error')

// create address controller

exports.createAddress = asyncHandler(async (req, res) => {

        const userId = req.user.id
        const { Name,
            streetAddress,
            city,
            state,
            zipCode,
            mobile } = req.body

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
})

// get all addresses

exports.getAllAddresses = asyncHandler(async (req, res) => {
        const userId = req.user.id

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const addresses = await Address.find({ userId });

        res.json(addresses)


})

exports.editAddress = asyncHandler(async (req, res) => {
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
   
});


// delete address by id

exports.deleteAddress = asyncHandler(async (req, res) => {
   
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


    
})

// update address by id
exports.updateAddress = asyncHandler(async (req, res) => {
   
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
})