const mongoose = require('mongoose');

/**
 * MongoDB Aggregation Helper Functions for Analytics
 */

// Helper to create date range match stage
const createDateRangeMatch = (startDate, endDate, dateField = 'createdAt') => {
  return {
    $match: {
      [dateField]: {
        $gte: startDate,
        $lte: endDate
      }
    }
  };
};

// Helper to create seller-specific match stage
const createSellerMatch = (sellerId) => {
  return {
    $match: {
      'items.sellerId': new mongoose.Types.ObjectId(sellerId)
    }
  };
};

// Helper to group by date periods (daily, weekly, monthly)
const createDateGrouping = (period = 'daily', dateField = 'createdAt') => {
  let groupBy;
  
  switch (period) {
    case 'daily':
      groupBy = {
        year: { $year: `$${dateField}` },
        month: { $month: `$${dateField}` },
        day: { $dayOfMonth: `$${dateField}` }
      };
      break;
    case 'weekly':
      groupBy = {
        year: { $year: `$${dateField}` },
        week: { $week: `$${dateField}` }
      };
      break;
    case 'monthly':
      groupBy = {
        year: { $year: `$${dateField}` },
        month: { $month: `$${dateField}` }
      };
      break;
    default:
      groupBy = {
        year: { $year: `$${dateField}` },
        month: { $month: `$${dateField}` },
        day: { $dayOfMonth: `$${dateField}` }
      };
  }
  
  return groupBy;
};

// Helper to calculate growth percentage
const calculateGrowthPercentage = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

// Helper to format aggregation results for charts
const formatChartData = (data, labelField, valueField) => {
  return data.map(item => ({
    label: item[labelField],
    value: item[valueField],
    date: item.date || item._id
  }));
};

// Helper to create lookup stages for populating references
const createLookupStage = (from, localField, foreignField, as) => {
  return {
    $lookup: {
      from,
      localField,
      foreignField,
      as
    }
  };
};

// Helper to unwind arrays safely
const createUnwindStage = (path, preserveNullAndEmptyArrays = true) => {
  return {
    $unwind: {
      path: `$${path}`,
      preserveNullAndEmptyArrays
    }
  };
};

// Helper to create facet stage for multiple aggregations
const createFacetStage = (facets) => {
  return {
    $facet: facets
  };
};

// Helper to sort by date
const createDateSort = (dateField = 'createdAt', order = -1) => {
  return {
    $sort: {
      [dateField]: order
    }
  };
};

// Helper to limit results
const createLimitStage = (limit) => {
  return {
    $limit: limit
  };
};

// Helper to project specific fields
const createProjectStage = (fields) => {
  return {
    $project: fields
  };
};

// Helper to add computed fields
const createAddFieldsStage = (fields) => {
  return {
    $addFields: fields
  };
};

module.exports = {
  createDateRangeMatch,
  createSellerMatch,
  createDateGrouping,
  calculateGrowthPercentage,
  formatChartData,
  createLookupStage,
  createUnwindStage,
  createFacetStage,
  createDateSort,
  createLimitStage,
  createProjectStage,
  createAddFieldsStage
};