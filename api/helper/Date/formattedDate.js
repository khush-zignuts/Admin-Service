const formatDate = (dateString) => {
  try {
    const formattedDate = new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short", // Short weekday name (e.g., Sun)
      month: "short", // Short month name (e.g., Oct)
      day: "numeric", // Numeric day (e.g., 12)
      year: "numeric", // Numeric year (e.g., 2025)
    });
    return formattedDate;
  } catch (error) {
    console.error("Error formatting date:", error.message);
    return null; 
  }
};

module.exports = { formatDate };
