import React, { createContext, useContext, useState } from "react";

const ChartContext = createContext();

export const ChartProvider = ({ children }) => {
  const [charts, setCharts] = useState([]);

  const addChart = async (network, address) => {
    if (charts.length >= 15) return; // Maximum 15 charts

    try {
      const response = await fetch(
        `https://pro-api.coingecko.com/api/v3/onchain/networks/${network}/pools/${address}/ohlcv/minute`,
        {
          headers: {
            "x-cg-pro-api-key": process.env.REACT_APP_COINGECKO_API_KEY,
          },
        }
      );

      const data = await response.json();
      console.log("API Response:", data);

      // Check for error response
      if (data.status?.error_code) {
        console.error("API Error:", data.status.error_message);
        return;
      }

      // Check if we have the required data structure
      if (!data?.data?.attributes?.ohlcv_list) {
        console.error("Invalid data structure received:", data);
        return;
      }

      // Create a unique ID for the chart
      const chartId = `${network}-${address}`;

      // Get base and quote info with fallbacks
      const baseInfo = data?.meta?.base || {
        name: "Unknown",
        address: address,
      };
      const quoteInfo = data?.meta?.quote || {
        name: "Unknown",
        address: "Unknown",
      };

      setCharts((prev) => [
        ...prev,
        {
          id: chartId,
          name: baseInfo.name,
          address: address,
          network: network,
          ohlcv_list: data.data.attributes.ohlcv_list,
          base: baseInfo,
          quote: quoteInfo,
        },
      ]);
    } catch (error) {
      console.error("Error fetching chart data:", error);
    }
  };

  const removeChart = (index) => {
    setCharts((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <ChartContext.Provider value={{ charts, addChart, removeChart }}>
      {children}
    </ChartContext.Provider>
  );
};

export const useChart = () => {
  const context = useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within a ChartProvider");
  }
  return context;
};
