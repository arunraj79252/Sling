export const formatTime = (timestamp) => {
  // Convert UTC timestamp to IST
  const istDate = new Date(timestamp);
  const istOptions = { timeZone: "Asia/Kolkata" };
  const istDateString = istDate.toLocaleString("en-IN", istOptions);

  // Get today's date in IST
  const today = new Date().toLocaleDateString("en-IN", istOptions);

  // Format the timestamp based on the rules
  let formattedTimestamp;

  if (istDateString.startsWith(today)) {
    // Display as hh:mm am/pm if it's today's date
    formattedTimestamp = istDate.toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour12: true,
      hour: "numeric",
      minute: "numeric",
    });
  } else if (istDate.toDateString() === new Date().toDateString()) {
    // Display as "yesterday" if it's yesterday's date
    formattedTimestamp = "Yesterday";
  } else {
    // Display as dd/mm/yy for older dates
    const options = { day: "numeric", month: "numeric", year: "2-digit" };
    formattedTimestamp = istDate.toLocaleDateString("en-IN", options);
  }
  return formattedTimestamp
};
